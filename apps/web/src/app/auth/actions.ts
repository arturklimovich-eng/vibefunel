'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { resolveStorageMode } from '@/lib/storage-mode';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { DIRECT_KEY, RateLimiter, clientKeyFromHeaders } from '@/server/payments/rate-limit';

export interface AuthFormState {
  error: string | null;
}

const credentialsSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(8).max(200),
  intent: z.enum(['signin', 'signup']),
  next: z.string().optional(),
});

const DEFAULT_NEXT = '/studio';
const MINUTE = 60_000;
const TOO_MANY = 'Too many attempts. Please wait a few minutes and try again.';

const UNAVAILABLE = 'Sign-in is temporarily unavailable. Please try again in a minute.';
const NOT_A_CREDENTIAL_CHECK = new Set([
  'email_not_confirmed',
  'over_request_rate_limit',
  'over_email_send_rate_limit',
  'request_timeout',
  'hook_timeout',
  'unexpected_failure',
  'captcha_failed',
  'email_provider_disabled',
  'provider_disabled',
]);

function isNonCredentialError(error: {
  code?: string | undefined;
  status?: number | undefined;
}): boolean {
  const status = error.status ?? 0;
  if (status === 0 || status === 429 || status >= 500) return true;
  return error.code !== undefined && NOT_A_CREDENTIAL_CHECK.has(error.code);
}

const requestLimiter = new RateLimiter(20_000);
const failureLimiter = new RateLimiter(20_000);
const FAILURES_PER_ACCOUNT_AND_CLIENT = 10;
const FAILURES_PER_ACCOUNT = 50;
const ACCOUNT_WINDOW_MS = 60 * MINUTE;
const ACCOUNT_CLIENT_WINDOW_MS = 15 * MINUTE;

interface AuthKeys {
  client: string;
  shared: boolean;
  account: string;
}

async function authKeys(email: string): Promise<AuthKeys> {
  const client = clientKeyFromHeaders(await headers());
  return { client, shared: client === DIRECT_KEY, account: email.toLowerCase() };
}

function accountClientKey(keys: AuthKeys): string {
  return `${keys.account}|${keys.client}`;
}

function requestBlocked(intent: 'signin' | 'signup', keys: AuthKeys): boolean {
  const limit = intent === 'signin' ? (keys.shared ? 300 : 10) : keys.shared ? 60 : 5;
  return !requestLimiter.check(`${intent}-client`, keys.client, limit, MINUTE).ok;
}

function reserveSignInFailure(keys: AuthKeys): boolean {
  if (!failureLimiter.peek('account', keys.account, FAILURES_PER_ACCOUNT).ok) return false;
  if (
    !keys.shared &&
    !failureLimiter.peek('account-client', accountClientKey(keys), FAILURES_PER_ACCOUNT_AND_CLIENT)
      .ok
  ) {
    return false;
  }
  failureLimiter.hit('account', keys.account, ACCOUNT_WINDOW_MS);
  if (!keys.shared)
    failureLimiter.hit('account-client', accountClientKey(keys), ACCOUNT_CLIENT_WINDOW_MS);
  return true;
}

function releaseSignInFailure(keys: AuthKeys): void {
  failureLimiter.release('account', keys.account);
  if (!keys.shared) failureLimiter.release('account-client', accountClientKey(keys));
}

function hasControlCharacter(value: string): boolean {
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code < 32 || code === 127) return true;
  }
  return false;
}

async function requestOrigin(): Promise<string> {
  const list = await headers();
  const host = list.get('x-forwarded-host') ?? list.get('host') ?? 'localhost';
  const proto = list.get('x-forwarded-proto') ?? 'http';
  return `${proto}://${host}`;
}

async function safeNext(value: string | undefined): Promise<string> {
  if (!value || !value.startsWith('/') || value.includes('\\') || hasControlCharacter(value)) {
    return DEFAULT_NEXT;
  }
  const origin = await requestOrigin();
  try {
    const resolved = new URL(value, origin);
    if (resolved.origin !== origin || !resolved.pathname.startsWith('/')) return DEFAULT_NEXT;
    if (resolved.pathname.startsWith('//')) return DEFAULT_NEXT;
    const target = `${resolved.pathname}${resolved.search}`;
    if (new URL(target, origin).origin !== origin) return DEFAULT_NEXT;
    return target;
  } catch (error) {
    if (error instanceof TypeError) return DEFAULT_NEXT;
    throw error;
  }
}

export async function authenticate(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (resolveStorageMode() !== 'supabase') redirect(DEFAULT_NEXT);
  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    intent: formData.get('intent'),
    next: formData.get('next') ?? undefined,
  });
  if (!parsed.success) {
    return { error: 'Enter a valid email and a password of at least 8 characters.' };
  }
  const { email, password, intent, next } = parsed.data;
  const keys = await authKeys(email);
  if (requestBlocked(intent, keys) || (intent === 'signin' && !reserveSignInFailure(keys))) {
    console.warn(`[auth] ${intent} rate limited`);
    return { error: TOO_MANY };
  }
  const client = await createSupabaseServerClient();
  if (intent === 'signup') {
    const { data, error } = await client.auth.signUp({ email, password });
    if (error) {
      console.error(`[auth] sign-up failed: ${error.message}`);
      return { error: 'Could not sign up with these details.' };
    }
    if (!data.session) {
      return { error: 'Check your inbox to confirm your email, then sign in.' };
    }
  } else {
    let error: { message: string; code?: string | undefined; status?: number | undefined } | null;
    try {
      ({ error } = await client.auth.signInWithPassword({ email, password }));
    } catch (thrown) {
      releaseSignInFailure(keys);
      console.error(`[auth] sign-in errored: ${thrown instanceof Error ? thrown.message : thrown}`);
      return { error: UNAVAILABLE };
    }
    if (!error) {
      releaseSignInFailure(keys);
    } else if (!isNonCredentialError(error)) {
      console.error(
        `[auth] sign-in failed: ${error.status ?? ''} ${error.code ?? ''} ${error.message}`,
      );
      return { error: 'Invalid email or password.' };
    } else {
      releaseSignInFailure(keys);
      console.error(
        `[auth] sign-in error ${error.status ?? ''} ${error.code ?? ''}: ${error.message}`,
      );
      if (error.code === 'email_not_confirmed') {
        return { error: 'Confirm your email address first, then sign in.' };
      }
      return { error: UNAVAILABLE };
    }
  }
  redirect(await safeNext(next));
}

export async function signOut(): Promise<void> {
  if (resolveStorageMode() === 'supabase') {
    const client = await createSupabaseServerClient();
    await client.auth.signOut();
  }
  redirect('/login');
}
