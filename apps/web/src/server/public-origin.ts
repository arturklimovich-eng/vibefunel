import 'server-only';
import { trustedHops } from '@/server/rate-limit';
import { customHost, isPlatformHost, requestHost } from '@/server/platform-host';
import { getPublishedReader } from '@/server/repository';

function requestProto(request: Request): string {
  const forwarded = trustedHops() > 0 ? request.headers.get('x-forwarded-proto') : null;
  return forwarded === 'http' || forwarded === 'https'
    ? forwarded
    : new URL(request.url).protocol.replace(':', '');
}

export function platformRequestOrigin(request: Request): string | null {
  const current = requestHost(request.headers);
  if (!current || !isPlatformHost(current.host)) return null;
  const port = current.port === null ? '' : `:${current.port}`;
  return `${requestProto(request)}://${current.host}${port}`;
}

export async function customDomainOrigin(
  request: Request,
  funnelId: string,
): Promise<string | null> {
  const custom = customHost(request.headers);
  if (!custom) return null;
  const published = await getPublishedReader().getPublishedByHost(custom.host);
  if (!published || published.funnelId !== funnelId) return null;
  const port = custom.port === null ? '' : `:${custom.port}`;
  return `${requestProto(request)}://${custom.host}${port}`;
}
