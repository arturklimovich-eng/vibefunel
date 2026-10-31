'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js/pure';
import { z } from 'zod';
import { fetchPaymentStatus as fetchStatus } from '@/lib/payment-status';
import { useRuntime } from './runtime-context';
import { SolidgateForm, rememberSolidgateRef, storedSolidgateRef } from './SolidgateForm';
import type { SolidgateMerchantData } from './SolidgateForm';
import styles from './blocks.module.css';

const checkoutResponse = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('embedded'),
    clientSecret: z.string().min(1),
    provider: z.string(),
  }),
  z.object({ mode: z.literal('redirect'), url: z.string().min(1), provider: z.string() }),
  z.object({
    mode: z.literal('solidgate'),
    merchant: z.string().min(1),
    signature: z.string().min(1),
    paymentIntent: z.string().min(1),
    ref: z.string().min(1),
    provider: z.string(),
  }),
]);

const POLL_INTERVAL_MS = 2000;
const POLL_MAX_MS = 60_000;

type View =
  | { kind: 'idle' }
  | { kind: 'working'; text: string }
  | { kind: 'embedded'; clientSecret: string }
  | { kind: 'solidgate'; merchantData: SolidgateMerchantData; ref: string }
  | { kind: 'mock_redirect' }
  | { kind: 'timeout' }
  | { kind: 'processing' }
  | { kind: 'exists' }
  | { kind: 'failed' }
  | { kind: 'needs_review' }
  | { kind: 'refunded' }
  | { kind: 'disputed' }
  | { kind: 'not_configured' }
  | { kind: 'error'; text: string };

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });
}

function isSafeRedirect(url: string): boolean {
  if (url.startsWith('/') && !url.startsWith('//')) return true;
  try {
    return new URL(url).protocol === 'https:';
  } catch (error) {
    if (error instanceof TypeError) return false;
    throw error;
  }
}

function EmbeddedView({ clientSecret }: { clientSecret: string }) {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const stripePromise = useMemo(
    () => (publishableKey ? loadStripe(publishableKey) : null),
    [publishableKey],
  );
  if (!stripePromise) {
    return <p className={styles.paymentText}>Payments are not configured.</p>;
  }
  return (
    <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  );
}

export function CheckoutPanel({ planKey }: { planKey: string }) {
  const runtime = useRuntime();
  const {
    slug,
    runId,
    screenId,
    returnScreenId,
    returnRef,
    clearReturn,
    confirmPayment,
    track,
    analyticsConsent,
  } = runtime;
  const paid = screenId !== null && runtime.payments[screenId] === 'succeeded';
  const isReturn = screenId !== null && returnScreenId === screenId;
  const [view, setView] = useState<View>({ kind: 'idle' });
  const [attempt, setAttempt] = useState(0);
  const [repurchase, setRepurchase] = useState(false);
  const [localRef, setLocalRef] = useState<string | null>(null);

  useEffect(() => {
    if (slug === null || runId === null || screenId === null || planKey === '' || paid) return;
    const controller = new AbortController();
    const { signal } = controller;

    const confirm = (advance: boolean) => {
      if (!signal.aborted) confirmPayment(screenId, { advance });
    };

    const ref = localRef ?? returnRef;

    const poll = async (): Promise<void> => {
      setView({ kind: 'working', text: 'Confirming your payment...' });
      let sawProcessing = false;
      let wait = 0;
      for (let waited = 0; waited <= POLL_MAX_MS; waited += wait) {
        const result = await fetchStatus(runId, screenId, signal, ref);
        if (signal.aborted) return;
        if (result.kind === 'not_configured') {
          setView({ kind: 'not_configured' });
          return;
        }
        if (result.kind === 'status' && result.status === 'succeeded') {
          confirm(true);
          return;
        }
        if (result.kind === 'status' && result.status === 'needs_review') {
          setView({ kind: 'needs_review' });
          return;
        }
        if (
          result.kind === 'status' &&
          (result.status === 'refunded' || result.status === 'disputed')
        ) {
          setView({ kind: result.status });
          return;
        }
        if (result.kind === 'status' && result.status === 'processing') sawProcessing = true;
        if (result.kind === 'status' && result.status === 'failed') {
          setView({ kind: 'failed' });
          return;
        }
        wait = result.kind === 'rate_limited' ? result.retryAfterMs : POLL_INTERVAL_MS;
        await sleep(wait, signal);
        if (signal.aborted) return;
      }
      setView(sawProcessing ? { kind: 'processing' } : { kind: 'timeout' });
    };

    const create = async (): Promise<void> => {
      setView({ kind: 'working', text: 'Preparing checkout...' });
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          slug,
          screenId,
          runId,
          planKey,
          analyticsConsent: analyticsConsent(),
        }),
        signal,
      });
      if (signal.aborted) return;
      if (response.status === 503) {
        setView({ kind: 'not_configured' });
        return;
      }
      if (response.status === 429) {
        setView({ kind: 'error', text: 'Too many attempts. Please wait a minute and try again.' });
        return;
      }
      if (response.status === 409) {
        setView({ kind: 'exists' });
        return;
      }
      if (!response.ok) {
        setView({ kind: 'error', text: 'Checkout could not be started. Please try again.' });
        return;
      }
      const result = checkoutResponse.parse(await response.json());
      if (signal.aborted) return;
      track({ name: 'checkout_started', screenId, planKey });
      if (result.mode === 'embedded') {
        setView({ kind: 'embedded', clientSecret: result.clientSecret });
        return;
      }
      if (result.mode === 'solidgate') {
        rememberSolidgateRef(runId, screenId, result.ref);
        setView({
          kind: 'solidgate',
          ref: result.ref,
          merchantData: {
            merchant: result.merchant,
            signature: result.signature,
            paymentIntent: result.paymentIntent,
          },
        });
        return;
      }
      if (!isSafeRedirect(result.url)) {
        setView({ kind: 'error', text: 'Checkout returned an invalid redirect.' });
        return;
      }
      setView({ kind: 'mock_redirect' });
      window.location.assign(result.url);
    };

    const run = async (): Promise<void> => {
      try {
        if (isReturn || localRef !== null) {
          await poll();
          return;
        }
        const result = await fetchStatus(
          runId,
          screenId,
          signal,
          storedSolidgateRef(runId, screenId),
        );
        if (signal.aborted) return;
        if (result.kind === 'not_configured') {
          setView({ kind: 'not_configured' });
          return;
        }
        if (result.kind === 'rate_limited') {
          setView({
            kind: 'error',
            text: 'Too many attempts. Please wait a minute and try again.',
          });
          return;
        }
        if (result.status === 'succeeded') {
          confirm(false);
          return;
        }
        if (result.status === 'needs_review') {
          setView({ kind: 'needs_review' });
          return;
        }
        if (result.status === 'processing') {
          setView({ kind: 'processing' });
          return;
        }
        if (result.status === 'disputed') {
          setView({ kind: 'disputed' });
          return;
        }
        if (result.status === 'refunded' && !repurchase) {
          setView({ kind: 'refunded' });
          return;
        }
        await create();
      } catch (error) {
        if (signal.aborted) return;
        console.error('Checkout flow failed:', error instanceof Error ? error.message : error);
        setView({ kind: 'error', text: 'Something went wrong with checkout. Please try again.' });
      }
    };

    void run();
    return () => controller.abort();
  }, [
    slug,
    runId,
    screenId,
    planKey,
    paid,
    isReturn,
    returnRef,
    localRef,
    attempt,
    repurchase,
    confirmPayment,
    track,
    analyticsConsent,
  ]);

  const solidgateRef = view.kind === 'solidgate' ? view.ref : null;
  const onSolidgateSuccess = useCallback(() => {
    if (solidgateRef !== null) setLocalRef(solidgateRef);
  }, [solidgateRef]);
  const onSolidgateFail = useCallback(() => {
    if (runId !== null && screenId !== null) rememberSolidgateRef(runId, screenId, null);
    setView({ kind: 'failed' });
  }, [runId, screenId]);

  if (slug === null) {
    return (
      <section className={styles.payment} aria-label="Payment">
        <p className={styles.paymentTitle}>Checkout</p>
        <p className={styles.paymentText}>
          {planKey === ''
            ? 'No plan selected for this checkout.'
            : `Plan "${planKey}" is charged only on the live funnel. Payments are disabled here.`}
        </p>
      </section>
    );
  }

  if (planKey === '') {
    return (
      <section className={styles.payment} aria-label="Payment">
        <p className={styles.paymentTitle}>Checkout unavailable</p>
        <p className={styles.paymentText}>No plan is selected for this checkout screen.</p>
      </section>
    );
  }

  if (paid) {
    return (
      <section className={styles.payment} aria-label="Payment">
        <p className={styles.paymentTitle}>Payment received</p>
        <p className={styles.paymentText}>Your payment was confirmed.</p>
        <button type="button" className={styles.button} onClick={() => runtime.next()}>
          Continue
        </button>
      </section>
    );
  }

  const retry = (
    <button
      type="button"
      className={styles.button}
      onClick={() => {
        if (!(view.kind === 'error' && isReturn)) clearReturn();
        setLocalRef(null);
        setAttempt((n) => n + 1);
      }}
    >
      Try again
    </button>
  );

  return (
    <section className={styles.payment} aria-label="Payment" aria-live="polite">
      {view.kind === 'idle' || view.kind === 'working' ? (
        <p className={styles.paymentText}>
          {view.kind === 'working' ? view.text : 'Loading checkout...'}
        </p>
      ) : null}
      {view.kind === 'mock_redirect' ? (
        <p className={styles.paymentText}>
          MOCK PAYMENTS (development only): redirecting to the simulated payment page.
        </p>
      ) : null}
      {view.kind === 'embedded' ? <EmbeddedView clientSecret={view.clientSecret} /> : null}
      {view.kind === 'solidgate' ? (
        <SolidgateForm
          merchantData={view.merchantData}
          onSuccess={onSolidgateSuccess}
          onFail={onSolidgateFail}
        />
      ) : null}
      {view.kind === 'not_configured' ? (
        <>
          <p className={styles.paymentTitle}>Payments not configured</p>
          <p className={styles.paymentText}>
            No payment provider is connected to this funnel, so nothing can be charged.
          </p>
        </>
      ) : null}
      {view.kind === 'failed' ? (
        <>
          <p className={styles.paymentTitle}>Payment failed</p>
          <p className={styles.paymentText}>
            The payment was not completed. You have not been charged.
          </p>
          {retry}
        </>
      ) : null}
      {view.kind === 'needs_review' ? (
        <>
          <p className={styles.paymentTitle}>Payment needs review</p>
          <p className={styles.paymentText}>
            We received your payment but could not confirm the order automatically. Please contact
            support with your payment reference.
          </p>
          {returnRef !== null ? (
            <p className={styles.paymentText}>Payment reference: {returnRef}</p>
          ) : null}
        </>
      ) : null}
      {view.kind === 'processing' ? (
        <>
          <p className={styles.paymentTitle}>Payment is being processed</p>
          <p className={styles.paymentText}>
            Your payment was received and is still being confirmed by the payment provider. Some
            payment methods take a few minutes. You will not be charged again.
          </p>
          <button type="button" className={styles.button} onClick={() => setAttempt((n) => n + 1)}>
            Check again
          </button>
        </>
      ) : null}
      {view.kind === 'exists' ? (
        <>
          <p className={styles.paymentTitle}>Payment already started</p>
          <p className={styles.paymentText}>
            A payment for this step was already made or is in progress. If you paid in another
            browser or tab, continue there.
          </p>
        </>
      ) : null}
      {view.kind === 'refunded' ? (
        <>
          <p className={styles.paymentTitle}>Payment refunded</p>
          <p className={styles.paymentText}>
            Your payment for this step was refunded, so access to the paid part of this funnel is
            closed. You can purchase again to continue.
          </p>
          <button
            type="button"
            className={styles.button}
            onClick={() => {
              clearReturn();
              setRepurchase(true);
              setAttempt((n) => n + 1);
            }}
          >
            Purchase again
          </button>
        </>
      ) : null}
      {view.kind === 'disputed' ? (
        <>
          <p className={styles.paymentTitle}>Access suspended</p>
          <p className={styles.paymentText}>
            The payment for this step is disputed with your bank, so access to the paid part of this
            funnel is suspended. Please contact support to resolve it.
          </p>
        </>
      ) : null}
      {view.kind === 'timeout' ? (
        <>
          <p className={styles.paymentTitle}>Still waiting for confirmation</p>
          <p className={styles.paymentText}>
            We have not received confirmation of your payment yet. You can check again.
          </p>
          <button type="button" className={styles.button} onClick={() => setAttempt((n) => n + 1)}>
            Check again
          </button>
        </>
      ) : null}
      {view.kind === 'error' ? (
        <>
          <p className={styles.paymentText} role="alert">
            {view.text}
          </p>
          {retry}
        </>
      ) : null}
    </section>
  );
}
