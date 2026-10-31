import { NextResponse } from 'next/server';
import type { z } from 'zod';
import { MAX_BODY_BYTES, readJsonBody } from './read-json-body';

export type ParsedBody<T> = { ok: true; data: T } | { ok: false; response: NextResponse };

function invalid(status: number, error: string, message: string): ParsedBody<never> {
  return {
    ok: false,
    response: NextResponse.json(
      { error, issues: [{ code: 'schema_invalid', severity: 'error', message }] },
      { status },
    ),
  };
}

function sizeLabel(bytes: number): string {
  if (bytes % (1024 * 1024) === 0) return `${bytes / (1024 * 1024)} MB`;
  if (bytes % 1024 === 0) return `${bytes / 1024} KB`;
  return `${bytes} bytes`;
}

export async function parseJsonBody<S extends z.ZodType>(
  request: Request,
  schema: S,
  maxBytes: number = MAX_BODY_BYTES,
): Promise<ParsedBody<z.infer<S>>> {
  const body = await readJsonBody(request, maxBytes);
  if (!body.ok) {
    return invalid(
      body.status,
      body.error,
      body.error === 'payload_too_large'
        ? `Body exceeds ${sizeLabel(maxBytes)}.`
        : 'Body is not valid JSON.',
    );
  }
  const parsed = schema.safeParse(body.value);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const where = first && first.path.length > 0 ? `${first.path.join('.')}: ` : '';
    return invalid(400, 'invalid_body', `${where}${first?.message ?? 'Invalid request body.'}`);
  }
  return { ok: true, data: parsed.data };
}
