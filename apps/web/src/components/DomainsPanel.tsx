'use client';

import { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';
import { funnelRoutes, readJson } from '@/lib/api-routes';
import {
  MAX_DOMAINS_PER_FUNNEL,
  domainCheckResponseSchema,
  domainViewSchema,
  domainsResponseSchema,
} from '@/lib/domains';
import type { DomainCheckResponse, DomainView, DomainsResponse } from '@/lib/domains';
import { HOSTNAME_MAX_LENGTH, normalizeHostname } from '@/lib/hostname';
import styles from './FunnelEditor.module.css';

const errorSchema = z.object({ error: z.string() });

function formatDate(value: string | null): string {
  if (value === null) return 'never';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function describeError(status: number, body: unknown, fallback: string): string {
  const parsed = errorSchema.safeParse(body);
  const code = parsed.success ? parsed.data.error : null;
  if (code === 'invalid_hostname') return 'Enter a valid hostname such as quiz.example.com.';
  if (code === 'reserved_hostname')
    return 'That hostname belongs to the platform and cannot be used.';
  if (code === 'domain_taken') {
    return 'That hostname is already attached to this funnel or verified for another one.';
  }
  if (code === 'domain_limit')
    return `A funnel can have at most ${MAX_DOMAINS_PER_FUNNEL} domains.`;
  if (code === 'not_configured') return 'Domain verification is not configured on this server.';
  if (code === 'rate_limited') return 'Too many checks. Please wait a minute and try again.';
  return `${fallback} (HTTP ${status}).`;
}

function Instructions({ domain, data }: { domain: DomainView; data: DomainsResponse }) {
  const { cnameTarget, aRecordIp } = data.instructions;
  return (
    <dl className={styles.dnsList}>
      <dt>1. Prove ownership: TXT record</dt>
      <dd>
        Name <code>{domain.txtName}</code>
        <br />
        Value <code>{domain.txtValue}</code>
      </dd>
      <dt>2. Send visitors here</dt>
      <dd>
        {cnameTarget !== null ? (
          <>
            CNAME <code>{domain.hostname}</code> to <code>{cnameTarget}</code>
          </>
        ) : null}
        {cnameTarget !== null && aRecordIp !== null ? <br /> : null}
        {aRecordIp !== null ? (
          <>
            or, for an apex domain, an A record to <code>{aRecordIp}</code>
          </>
        ) : null}
        {cnameTarget === null && aRecordIp === null
          ? 'Ask the platform operator for the CNAME target.'
          : null}
      </dd>
    </dl>
  );
}

export function DomainsPanel({ funnelId }: { funnelId: string }) {
  const [data, setData] = useState<DomainsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [hostname, setHostname] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async (): Promise<DomainsResponse | string> => {
    try {
      const res = await fetch(funnelRoutes(funnelId).domains, { cache: 'no-store' });
      if (!res.ok) return `Domains could not be loaded (HTTP ${res.status}).`;
      const parsed = domainsResponseSchema.safeParse(await res.json());
      return parsed.success ? parsed.data : 'Domains response was not understood.';
    } catch (loadError) {
      return loadError instanceof Error ? loadError.message : 'Network error';
    }
  }, [funnelId]);

  useEffect(() => {
    let cancelled = false;
    void load().then((result) => {
      if (cancelled) return;
      if (typeof result === 'string') setError(result);
      else {
        setError(null);
        setData(result);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const refresh = async () => {
    const result = await load();
    if (typeof result === 'string') setError(result);
    else setData(result);
  };

  const add = async () => {
    const normalized = normalizeHostname(hostname);
    if (normalized === null) {
      setError('Enter a valid hostname such as quiz.example.com.');
      return;
    }
    setBusyId('new');
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(funnelRoutes(funnelId).domains, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ hostname: normalized }),
      });
      const body = await readJson(res);
      if (!res.ok) {
        setError(describeError(res.status, body, 'The domain could not be added'));
        return;
      }
      const created = z.object({ domain: domainViewSchema }).safeParse(body);
      setHostname('');
      if (created.success) setOpenId(created.data.domain.id);
      await refresh();
    } catch (addError) {
      setError(addError instanceof Error ? addError.message : 'Network error');
    } finally {
      setBusyId(null);
    }
  };

  const verify = async (domain: DomainView) => {
    setBusyId(domain.id);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(funnelRoutes(funnelId).verifyDomain(domain.id), { method: 'POST' });
      const body = await readJson(res);
      if (!res.ok) {
        setError(describeError(res.status, body, 'The DNS check failed'));
        return;
      }
      const parsed = domainCheckResponseSchema.safeParse(body);
      if (!parsed.success) {
        setError('The DNS check response was not understood.');
        return;
      }
      setNotice(summarize(parsed.data));
      await refresh();
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : 'Network error');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (domain: DomainView) => {
    if (
      !window.confirm(`Remove ${domain.hostname}? Visitors will no longer reach this funnel there.`)
    )
      return;
    setBusyId(domain.id);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(funnelRoutes(funnelId).domain(domain.id), { method: 'DELETE' });
      if (!res.ok) {
        setError(describeError(res.status, await readJson(res), 'The domain could not be removed'));
        return;
      }
      await refresh();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Network error');
    } finally {
      setBusyId(null);
    }
  };

  const atLimit = data !== null && data.domains.length >= MAX_DOMAINS_PER_FUNNEL;

  return (
    <div className={styles.panel}>
      <h2 className={styles.panelHeading}>Custom domains</h2>
      <p className={styles.hint}>
        Serve the live version of this funnel on your own hostname. Add the DNS records shown, then
        run the check; the domain goes live once ownership is verified and the funnel is published.
      </p>
      {error ? <p role="alert">{error}</p> : null}
      {notice ? <p role="status">{notice}</p> : null}
      {data === null && !error ? <p>Loading domains...</p> : null}
      {data && data.domains.length === 0 ? <p>No custom domains yet.</p> : null}
      {data && data.domains.length > 0 ? (
        <ul className={styles.edgeList}>
          {data.domains.map((domain) => {
            const open = openId === domain.id;
            return (
              <li key={domain.id} className={styles.domainItem}>
                <div className={styles.row}>
                  <span>
                    <strong>{domain.hostname}</strong>{' '}
                    {domain.status === 'verified' ? (
                      <span className={styles.badgeOk}>Verified</span>
                    ) : (
                      <span className={styles.badgePending}>Pending</span>
                    )}
                  </span>
                  <button
                    type="button"
                    className={styles.btn}
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? null : domain.id)}
                  >
                    {open ? 'Hide DNS records' : 'DNS records'}
                  </button>
                  <button
                    type="button"
                    className={styles.btn}
                    disabled={busyId !== null}
                    onClick={() => void verify(domain)}
                  >
                    {busyId === domain.id ? 'Checking...' : 'Check DNS'}
                  </button>
                  <button
                    type="button"
                    className={styles.btn}
                    disabled={busyId !== null}
                    onClick={() => void remove(domain)}
                  >
                    Remove
                  </button>
                </div>
                <p className={styles.hint}>
                  Last checked: {formatDate(domain.lastCheckedAt)}
                  {domain.lastError ? ` - ${domain.lastError}` : ''}
                </p>
                {open ? <Instructions domain={domain} data={data} /> : null}
              </li>
            );
          })}
        </ul>
      ) : null}
      <form
        className={styles.row}
        onSubmit={(event) => {
          event.preventDefault();
          void add();
        }}
      >
        <label className={styles.field}>
          Hostname
          <input
            type="text"
            value={hostname}
            maxLength={HOSTNAME_MAX_LENGTH}
            placeholder="quiz.example.com"
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => setHostname(event.target.value)}
          />
        </label>
        <button
          type="submit"
          className={styles.btnPrimary}
          disabled={busyId !== null || atLimit || hostname.trim() === ''}
        >
          Add domain
        </button>
      </form>
    </div>
  );
}

function summarize(result: DomainCheckResponse): string {
  const ownership =
    result.ownership === null
      ? 'Ownership could not be checked; the previous status was kept.'
      : result.ownership
        ? 'Ownership verified.'
        : 'Ownership not verified yet.';
  const routing =
    result.routing === 'ok'
      ? 'DNS points at the platform.'
      : result.routing === 'missing'
        ? 'DNS does not point at the platform yet.'
        : 'DNS target could not be checked.';
  return `${ownership} ${routing}`;
}
