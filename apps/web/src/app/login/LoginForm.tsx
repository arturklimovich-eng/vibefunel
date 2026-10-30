'use client';

import { useActionState } from 'react';
import { authenticate } from '@/app/auth/actions';
import type { AuthFormState } from '@/app/auth/actions';
import styles from '../studio/studio.module.css';

const initialState: AuthFormState = { error: null };

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(authenticate, initialState);
  return (
    <form action={action} className={styles.form}>
      <input type="hidden" name="next" value={next} />
      <label className={styles.field}>
        Email
        <input type="email" name="email" required autoComplete="email" />
      </label>
      <label className={styles.field}>
        Password
        <input
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete="current-password"
        />
      </label>
      {state.error ? <p role="alert">{state.error}</p> : null}
      <div className={styles.links}>
        <button
          type="submit"
          name="intent"
          value="signin"
          className={styles.btnPrimary}
          disabled={pending}
        >
          Sign in
        </button>
        <button
          type="submit"
          name="intent"
          value="signup"
          className={styles.btn}
          disabled={pending}
        >
          Create account
        </button>
      </div>
    </form>
  );
}
