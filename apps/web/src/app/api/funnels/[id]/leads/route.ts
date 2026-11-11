import { NextResponse } from 'next/server';
import { withStudio } from '@/server/api-helpers';
import { leadsToCsv } from '@/server/leads/csv';
import { MAX_LISTED_LEADS, listLeads } from '@/server/services/funnels';

export const dynamic = 'force-dynamic';

interface Context {
  params: Promise<{ id: string }>;
}

export function GET(request: Request, { params }: Context) {
  return withStudio(async (studio) => {
    const { id } = await params;
    const csv = new URL(request.url).searchParams.get('format') === 'csv';
    const { funnel, leads } = await listLeads(studio, {
      funnelId: id,
      limit: csv ? null : MAX_LISTED_LEADS,
    });
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
  });
}
