'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { z } from 'zod';
import styles from '@/app/studio/agents/agents.module.css';
import type { ApiToken, ApiTokenScope } from '@/server/api-tokens/tokens';

const SCOPES: { value: ApiTokenScope; label: string; hint: string }[] = [
  { value: 'read', label: 'Read', hint: 'List funnels, read drafts, validate, versions' },
  { value: 'write', label: 'Edit', hint: 'Create funnels and change drafts' },
  { value: 'publish', label: 'Publish', hint: 'Publish and roll back live versions' },
  { value: 'leads', label: 'Leads', hint: 'Read captured emails' },
];

const tokenSchema = z.object({
  id: z.string(),
  name: z.string(),
  scopes: z.array(z.enum(['read', 'write', 'publish', 'leads'])),
  createdAt: z.string(),
  lastUsedAt: z.string().nullable(),
});
const createdSchema = z.object({ token: tokenSchema, secret: z.string() });
const errorSchema = z.object({ error: z.string() });

const ERRORS: Record<string, string> = {
  token_limit: 'You already have 20 active tokens. Revoke one first.',
  invalid_body: 'Give the token a name and at least one scope.',
};

function formatDate(value: string | null): string {
  if (!value) return 'Never';
  return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

async function failure(response: Response): Promise<string> {
  const parsed = errorSchema.safeParse(await response.json().catch(() => null));
  const code = parsed.success ? parsed.data.error : '';
  return ERRORS[code] ?? `Request failed (${response.status}).`;
}

export function AgentTokensPanel({
  initialTokens,
  endpoint,
  state,
}: {
  initialTokens: ApiToken[];
  endpoint: string | null;
  state: 'on' | 'off' | 'misconfigured';
}) {
  const [tokens, setTokens] = useState(initialTokens);
  const [name, setName] = useState('');
  const [scopes, setScopes] = useState<ApiTokenScope[]>(['read', 'write']);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const toggle = (scope: ApiTokenScope) =>
    setScopes((current) =>
      current.includes(scope) ? current.filter((s) => s !== scope) : [...current, scope],
    );

  const create = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/api-tokens', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, scopes }),
      });
      if (!response.ok) {
        setError(await failure(response));
        return;
      }
      const created = createdSchema.parse(await response.json());
      setTokens((current) => [created.token, ...current]);
      setSecret(created.secret);
      setName('');
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (token: ApiToken) => {
    if (!window.confirm(`Revoke "${token.name}"? Agents using it lose access at once.`)) return;
    setError(null);
    const response = await fetch(`/api/api-tokens/${encodeURIComponent(token.id)}`, {
      method: 'DELETE',
    });
    if (!response.ok && response.status !== 404) {
      setError(await failure(response));
      return;
    }
    setTokens((current) => current.filter((t) => t.id !== token.id));
  };

  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      window.setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
    } catch {
      setCopied(null);
    }
  };

  const config = JSON.stringify(
    {
      mcpServers: {
        funnels: {
          type: 'http',
          url: endpoint ?? '<APP_URL>/api/mcp',
          headers: { Authorization: `Bearer ${secret ?? '<token>'}` },
        },
      },
    },
    null,
    2,
  );

  return (
    <div className={styles.stack}>
      {state !== 'on' ? (
        <p className={styles.notice} role="status">
          {state === 'off'
            ? 'Agent access is off on this deployment. Set AGENT_ACCESS=on to enable the MCP endpoint. You can create tokens now; they start working once it is on.'
            : 'Agent access is on but SUPABASE_JWT_SECRET is missing, so the MCP endpoint answers 503.'}
        </p>
      ) : null}

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Connect</h2>
        <p className={styles.muted}>
          MCP endpoint (streamable HTTP, bearer token):{' '}
          <code>{endpoint ?? 'set APP_URL to show it'}</code>
        </p>
        <pre className={styles.code}>{config}</pre>
        <button type="button" className={styles.secondary} onClick={() => copy('config', config)}>
          {copied === 'config' ? 'Copied' : 'Copy config'}
        </button>
      </section>

      {secret ? (
        <section className={`${styles.card} ${styles.secretCard}`} aria-live="polite">
          <h2 className={styles.cardTitle}>New token</h2>
          <p className={styles.muted}>Copy it now. It is shown only once and stored as a hash.</p>
          <div className={styles.secretRow}>
            <code className={styles.secret}>{secret}</code>
            <button type="button" className={styles.primary} onClick={() => copy('secret', secret)}>
              {copied === 'secret' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <button type="button" className={styles.link} onClick={() => setSecret(null)}>
            Done
          </button>
        </section>
      ) : null}

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Create a token</h2>
        <form className={styles.form} onSubmit={create}>
          <label className={styles.field}>
            <span>Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              placeholder="Claude Code on my laptop"
              required
            />
          </label>
          <fieldset className={styles.scopes}>
            <legend>Scopes</legend>
            {SCOPES.map((s) => (
              <label key={s.value} className={styles.scope}>
                <input
                  type="checkbox"
                  checked={scopes.includes(s.value)}
                  onChange={() => toggle(s.value)}
                />
                <span>
                  <strong>{s.label}</strong>
                  <span className={styles.muted}>{s.hint}</span>
                </span>
              </label>
            ))}
          </fieldset>
          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className={styles.primary}
            disabled={busy || name.trim() === '' || scopes.length === 0}
          >
            {busy ? 'Creating…' : 'Create token'}
          </button>
        </form>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Active tokens</h2>
        {tokens.length === 0 ? (
          <p className={styles.muted}>No tokens yet.</p>
        ) : (
          <ul className={styles.list}>
            {tokens.map((t) => (
              <li key={t.id} className={styles.row}>
                <div className={styles.rowMain}>
                  <strong>{t.name}</strong>
                  <span className={styles.muted}>
                    {t.scopes.join(', ')} · created {formatDate(t.createdAt)} · last used{' '}
                    {formatDate(t.lastUsedAt)}
                  </span>
                </div>
                <button type="button" className={styles.danger} onClick={() => revoke(t)}>
                  Revoke
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
