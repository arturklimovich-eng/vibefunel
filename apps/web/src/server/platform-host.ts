import { normalizeHostname, stripPort } from '@/lib/hostname';

export function appHost(): string | null {
  const configured = process.env.APP_URL;
  if (!configured) return null;
  try {
    return new URL(configured).hostname.toLowerCase();
  } catch (error) {
    if (error instanceof TypeError) return null;
    throw error;
  }
}

export function isPlatformHost(host: string): boolean {
  if (host === 'localhost' || host.endsWith('.localhost')) return true;
  if (host === '127.0.0.1' || host === '[::1]' || host === '0.0.0.0') return true;
  const app = appHost();
  if (app !== null && host === app) return true;
  return extraPlatformHosts().includes(host);
}

function extraPlatformHosts(): string[] {
  return (process.env.PLATFORM_HOSTS ?? '')
    .split(',')
    .map((entry) => normalizeHostname(entry))
    .filter((entry): entry is string => entry !== null);
}

export interface RequestHost {
  raw: string;
  host: string;
  port: string | null;
}

export function requestHost(headers: Headers): RequestHost | null {
  const header = headers.get('host');
  if (!header) return null;
  const raw = header.split(',')[0]?.trim().toLowerCase() ?? '';
  if (raw === '') return null;
  const port = /:(\d{1,5})$/.exec(raw)?.[1] ?? null;
  return { raw, host: stripPort(raw), port };
}

export function customHost(headers: Headers): RequestHost | null {
  const request = requestHost(headers);
  if (!request) return null;
  const normalized = normalizeHostname(request.host);
  if (isPlatformHost(normalized ?? request.host)) return null;
  if (normalized === null) return null;
  return { raw: request.raw, host: normalized, port: request.port };
}
