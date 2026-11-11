import { NextResponse } from 'next/server';
import { withStudio } from '@/server/api-helpers';
import { generateToken, newApiTokenSchema } from '@/server/api-tokens/tokens';
import { parseJsonBody } from '@/server/parse-body';

export const dynamic = 'force-dynamic';

export function GET() {
  return withStudio(async ({ tokens }) =>
    NextResponse.json(
      { tokens: await tokens.list() },
      { headers: { 'cache-control': 'no-store' } },
    ),
  );
}

export function POST(request: Request) {
  return withStudio(async ({ tokens }) => {
    const body = await parseJsonBody(request, newApiTokenSchema);
    if (!body.ok) return body.response;
    const { token, hash } = generateToken();
    const created = await tokens.create(body.data, hash);
    return NextResponse.json(
      { token: created, secret: token },
      { status: 201, headers: { 'cache-control': 'no-store' } },
    );
  });
}
