import { NextResponse } from 'next/server';
import { z } from 'zod';
import { HOSTNAME_MAX_LENGTH, normalizeHostname } from '@/lib/hostname';
import { withStudio } from '@/server/api-helpers';
import { domainTarget } from '@/server/domains/target';
import { toDomainView } from '@/server/domains/view';
import { parseJsonBody } from '@/server/parse-body';
import { isPlatformHost } from '@/server/platform-host';

export const dynamic = 'force-dynamic';

interface Context {
  params: Promise<{ id: string }>;
}

const bodySchema = z.object({
  hostname: z
    .string()
    .min(1)
    .max(HOSTNAME_MAX_LENGTH + 10),
});

export function GET(_request: Request, { params }: Context) {
  return withStudio(async ({ repo }) => {
    const { id } = await params;
    const domains = await repo.listDomains(id);
    return NextResponse.json({ domains: domains.map(toDomainView), instructions: domainTarget() });
  });
}

export function POST(request: Request, { params }: Context) {
  return withStudio(async ({ repo }) => {
    const { id } = await params;
    const body = await parseJsonBody(request, bodySchema);
    if (!body.ok) return body.response;
    const hostname = normalizeHostname(body.data.hostname);
    if (hostname === null) return NextResponse.json({ error: 'invalid_hostname' }, { status: 400 });
    const target = domainTarget();
    const reserved =
      isPlatformHost(hostname) ||
      (target.cnameTarget !== null &&
        (hostname === target.cnameTarget || hostname.endsWith(`.${target.cnameTarget}`)));
    if (reserved) return NextResponse.json({ error: 'reserved_hostname' }, { status: 400 });
    const domain = await repo.addDomain(id, hostname);
    return NextResponse.json({ domain: toDomainView(domain) }, { status: 201 });
  });
}
