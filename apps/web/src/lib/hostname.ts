const LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const FORBIDDEN = /[\s/\\:@?#[\]]/;

export const HOSTNAME_MAX_LENGTH = 253;

export function normalizeHostname(input: string): string | null {
  const trimmed = input.trim().toLowerCase().replace(/\.$/, '');
  if (trimmed === '' || FORBIDDEN.test(trimmed)) return null;
  let host: string;
  try {
    host = new URL(`http://${trimmed}`).hostname;
  } catch (error) {
    if (error instanceof TypeError) return null;
    throw error;
  }
  if (host.length > HOSTNAME_MAX_LENGTH) return null;
  const labels = host.split('.');
  if (labels.length < 2) return null;
  if (!labels.every((label) => LABEL.test(label))) return null;
  const tld = labels[labels.length - 1] ?? '';
  if (/^\d+$/.test(tld)) return null;
  if (tld === 'localhost' || tld === 'local' || tld === 'internal') return null;
  return host;
}

export function stripPort(hostHeader: string): string {
  const value = hostHeader.trim().toLowerCase();
  if (value.startsWith('[')) return value.replace(/\]:\d+$/, ']');
  return value.replace(/:\d+$/, '');
}
