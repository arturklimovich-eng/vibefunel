import { NextResponse } from 'next/server';
import { isMissingServiceKey } from '@/lib/supabase/service';
import { withStudio } from '@/server/api-helpers';
import { leadsToCsv } from '@/server/leads/csv';
import { getLeadStore } from '@/server/leads/registry';

export const dynamic = 'force-dynamic';

const LIST_LIMIT = 100;

interface Context {
  params: Promise<{ id: string }>;
}

export function GET(request: Request, { params }: Context) {
  return withStudio(async ({ repo }) => {
    const { id } = await params;
    const funnel = await repo.getFunnel(id);
    if (!funnel) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    const csv = new URL(request.url).searchParams.get('format') === 'csv';
    try {
      const leads = await getLeadStore().listFunnelLeads(
        funnel.projectId,
        funnel.id,
        csv ? null : LIST_LIMIT,
      );
      if (csv) {
        return new NextResponse(leadsToCsv(leads), {
          headers: {
            'content-type': 'text/csv; charset=utf-8',
            'content-disposition': `attachment; filename="leads-${funnel.slug}.csv"`,
            'cache-control': 'no-store',
          },
        });
      }
      return NextResponse.json(
        {
          leads: leads.map((lead) => ({
            email: lead.email,
            consent: lead.consent,
            screenId: lead.screenId,
            createdAt: lead.createdAt,
          })),
        },
        { headers: { 'cache-control': 'no-store' } },
      );
    } catch (error) {
      if (isMissingServiceKey(error)) {
        return NextResponse.json({ error: 'not_configured' }, { status: 503 });
      }
      throw error;
    }
  });
}
