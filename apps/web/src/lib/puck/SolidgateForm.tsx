'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { MessageType, SdkLoader } from '@solidgate/client-sdk-loader';
import styles from './blocks.module.css';

export interface SolidgateMerchantData {
  merchant: string;
  signature: string;
  paymentIntent: string;
}

const REF_KEY = (runId: string, screenId: string) => `solidgate-order:${runId}:${screenId}`;

export function rememberSolidgateRef(runId: string, screenId: string, ref: string | null): void {
  try {
    if (ref === null) sessionStorage.removeItem(REF_KEY(runId, screenId));
    else sessionStorage.setItem(REF_KEY(runId, screenId), ref);
  } catch (error) {
    if (!(error instanceof DOMException)) throw error;
  }
}

export function storedSolidgateRef(runId: string, screenId: string): string | null {
  try {
    return sessionStorage.getItem(REF_KEY(runId, screenId));
  } catch (error) {
    if (error instanceof DOMException) return null;
    throw error;
  }
}

export function SolidgateForm({
  merchantData,
  onSuccess,
  onFail,
}: {
  merchantData: SolidgateMerchantData;
  onSuccess: () => void;
  onFail: () => void;
}) {
  const containerId = `solidgate-${useId().replace(/[^A-Za-z0-9_-]/g, '')}`;
  const callbacks = useRef({ onSuccess, onFail });
  const [error, setError] = useState(false);

  useEffect(() => {
    callbacks.current = { onSuccess, onFail };
  }, [onSuccess, onFail]);

  useEffect(() => {
    let cancelled = false;
    let destroy: (() => void) | null = null;
    SdkLoader.load()
      .then((sdk) => {
        if (cancelled || sdk === null) return;
        const form = sdk.init({
          merchantData,
          iframeParams: { containerId },
          formParams: { autoFocus: false },
          googlePayButtonParams: { enabled: false },
          applePayButtonParams: { enabled: false },
        });
        form.on(MessageType.Success, () => callbacks.current.onSuccess());
        form.on(MessageType.Fail, () => callbacks.current.onFail());
        destroy = () => {
          form.unsubscribeAll();
          sdk.destroy();
        };
      })
      .catch((reason: unknown) => {
        if (cancelled) return;
        console.error(
          'Solidgate form failed to load:',
          reason instanceof Error ? reason.message : reason,
        );
        setError(true);
      });
    return () => {
      cancelled = true;
      destroy?.();
    };
  }, [merchantData, containerId]);

  if (error) {
    return (
      <p className={styles.paymentText} role="alert">
        The payment form could not be loaded. Please reload the page and try again.
      </p>
    );
  }
  return <div id={containerId} />;
}
