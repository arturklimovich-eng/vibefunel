import 'server-only';
import { isIPv4 } from 'node:net';
import { normalizeHostname } from '@/lib/hostname';
import { appHost } from '@/server/platform-host';

export interface DomainTarget {
  cnameTarget: string | null;
  aRecordIp: string | null;
}

export function domainTarget(): DomainTarget {
  const configured = process.env.CUSTOM_DOMAIN_TARGET?.trim() || appHost() || '';
  const ip = process.env.CUSTOM_DOMAIN_TARGET_IP?.trim() ?? '';
  return {
    cnameTarget: configured === '' ? null : normalizeHostname(configured),
    aRecordIp: isIPv4(ip) ? ip : null,
  };
}
