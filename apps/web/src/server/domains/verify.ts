import 'server-only';
import { Resolver } from 'node:dns/promises';
import { isIP } from 'node:net';
import { txtRecordName, txtRecordValue } from '@/lib/domains';
import type { RoutingStatus } from '@/lib/domains';
import type { DomainTarget } from './target';

export interface DnsCheckResult {
  ownership: boolean | null;
  routing: RoutingStatus;
  message: string | null;
}

export class DnsConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DnsConfigError';
  }
}

const DNS_TIMEOUT_MS = 5000;
const NEGATIVE_CODES = new Set(['ENOTFOUND', 'ENODATA']);

export function configuredDnsServers(): string[] {
  const configured = process.env.CUSTOM_DOMAIN_DNS_SERVERS ?? '';
  const servers = configured
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
  for (const server of servers) {
    const match = /^(?:\[([^\]]+)\]|([^:]+))(?::(\d{1,5}))?$/.exec(server);
    const host = match ? (match[1] ?? match[2] ?? '') : '';
    if (!match || isIP(host) === 0) {
      throw new DnsConfigError(`CUSTOM_DOMAIN_DNS_SERVERS entry "${server}" is not an IP address.`);
    }
  }
  return servers;
}

function makeResolver(): Resolver {
  const resolver = new Resolver({ timeout: DNS_TIMEOUT_MS, tries: 1 });
  const servers = configuredDnsServers();
  if (servers.length > 0) resolver.setServers(servers);
  return resolver;
}

function dnsCode(error: unknown): string | null {
  if (error instanceof Error && 'code' in error && typeof error.code === 'string') {
    return error.code;
  }
  return null;
}

function describe(code: string, name: string): string {
  if (NEGATIVE_CODES.has(code)) return `No TXT record found at ${name}.`;
  if (code === 'ETIMEOUT') return `DNS lookup for ${name} timed out; the stored status was kept.`;
  if (code === 'ESERVFAIL' || code === 'EREFUSED') {
    return `The DNS server refused the lookup for ${name} (${code}); the stored status was kept.`;
  }
  return `DNS lookup for ${name} failed (${code}); the stored status was kept.`;
}

function strip(value: string): string {
  return value.trim().toLowerCase().replace(/\.$/, '');
}

async function checkRouting(
  resolver: Resolver,
  hostname: string,
  target: DomainTarget,
): Promise<RoutingStatus> {
  if (target.cnameTarget === null && target.aRecordIp === null) return 'unknown';
  if (target.cnameTarget !== null) {
    try {
      const cnames = await resolver.resolveCname(hostname);
      if (cnames.some((cname) => strip(cname) === target.cnameTarget)) return 'ok';
    } catch (error) {
      if (dnsCode(error) === null) throw error;
    }
  }
  let own: string[];
  try {
    own = await resolver.resolve4(hostname);
  } catch (error) {
    if (dnsCode(error) === null) throw error;
    return 'missing';
  }
  if (target.aRecordIp !== null && own.includes(target.aRecordIp)) return 'ok';
  if (target.cnameTarget !== null) {
    try {
      const expected = await resolver.resolve4(target.cnameTarget);
      if (own.some((ip) => expected.includes(ip))) return 'ok';
    } catch (error) {
      if (dnsCode(error) === null) throw error;
      return 'unknown';
    }
  }
  return 'missing';
}

async function checkOwnership(
  resolver: Resolver,
  hostname: string,
  token: string,
): Promise<{ ownership: boolean | null; message: string | null }> {
  const name = txtRecordName(hostname);
  const expected = txtRecordValue(token);
  try {
    const records = await resolver.resolveTxt(name);
    const ownership = records.some((parts) => parts.join('').trim() === expected);
    return {
      ownership,
      message: ownership
        ? null
        : `A TXT record exists at ${name} but none has the value ${expected}.`,
    };
  } catch (error) {
    const code = dnsCode(error);
    if (code === null) throw error;
    return { ownership: NEGATIVE_CODES.has(code) ? false : null, message: describe(code, name) };
  }
}

export async function checkDomainOwnership(
  hostname: string,
  token: string,
): Promise<{ ownership: boolean | null; message: string | null }> {
  return checkOwnership(makeResolver(), hostname, token);
}

export async function checkDomainDns(
  hostname: string,
  token: string,
  target: DomainTarget,
): Promise<DnsCheckResult> {
  const resolver = makeResolver();
  const [owner, routing] = await Promise.all([
    checkOwnership(resolver, hostname, token),
    checkRouting(resolver, hostname, target),
  ]);
  return { ownership: owner.ownership, routing, message: owner.message };
}
