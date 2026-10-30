import { NextResponse } from 'next/server';
import { withStudio } from '@/server/api-helpers';
import { listPublicPlans } from '@/server/payments/plans';

export const dynamic = 'force-dynamic';

export function GET() {
  return withStudio(() => Promise.resolve(NextResponse.json(listPublicPlans())));
}
