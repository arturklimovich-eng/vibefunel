import 'server-only';
import { NextResponse } from 'next/server';
import { getStudioContext } from './repository';
import type { StudioContext } from './repository';
import { describeError } from './services/errors';

export function errorResponse(error: unknown): NextResponse | null {
  const described = describeError(error);
  if (!described) return null;
  return NextResponse.json(
    { error: described.code, ...described.details },
    { status: described.status },
  );
}

export async function withStudio(
  run: (context: StudioContext) => Promise<Response>,
): Promise<Response> {
  const context = await getStudioContext();
  if (!context) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  try {
    return await run(context);
  } catch (error) {
    const mapped = errorResponse(error);
    if (mapped) return mapped;
    throw error;
  }
}
