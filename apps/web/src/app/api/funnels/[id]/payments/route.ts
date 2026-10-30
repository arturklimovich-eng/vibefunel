import { NextResponse } from 'next/server';
import { isMissingServiceKey } from '@/lib/supabase/service';
import { withStudio } from '@/server/api-helpers';
import { getPaymentStore } from '@/server/payments/registry';

export const dynamic = 'force-dynamic';

const LIST_LIMIT = 50;

interface Context {
  params: Promise<{ id: string }>;
}

export function GET(_request: Request, { params }: Context) {
  return withStudio(async ({ repo }) => {
    const { id } = await params;
    const funnel = await repo.getFunnel(id);
    if (!funnel) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    try {
      const payments = await getPaymentStore().listFunnelPayments(
        funnel.projectId,
        funnel.id,
        LIST_LIMIT,
      );
      return NextResponse.json({ payments }, { headers: { 'cache-control': 'no-store' } });
    } catch (error) {
      if (isMissingServiceKey(error)) {
        return NextResponse.json({ error: 'not_configured' }, { status: 503 });
      }
      throw error;
    }
  });
}
