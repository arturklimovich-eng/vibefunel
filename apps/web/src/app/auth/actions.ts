'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { resolveStorageMode } from '@/lib/storage-mode';
import { createSupabaseServerClient } from '@/lib/supabase/server';

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
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      console.error(`[auth] sign-in failed: ${error.message}`);
      return { error: 'Invalid email or password.' };
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
