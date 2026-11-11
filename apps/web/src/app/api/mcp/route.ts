import { NextResponse } from 'next/server';
import { agentAccessEnabled, authenticateAgent } from '@/server/agent-auth';
import { appUrl } from '@/server/capabilities';
import { INVALID_REQUEST, handleMcpMessage } from '@/server/mcp/server';
import type { JsonRpcResponse } from '@/server/mcp/server';
import {
  checkRateLimit,
  clientKey,
  ipLimit,
  peekRateLimit,
  recordRateLimitHit,
} from '@/server/rate-limit';
import { readJsonBody } from '@/server/read-json-body';

export const dynamic = 'force-dynamic';

const MAX_MCP_BODY_BYTES = 2 * 1024 * 1024;
const MAX_BATCH = 20;
const WINDOW_MS = 60_000;
const TOKEN_CALLS_PER_MINUTE = 300;

function originAllowed(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  const own = appUrl() ?? new URL(request.url).origin;
  return origin === own;
}

function tooMany(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: 'rate_limited' },
    { status: 429, headers: { 'retry-after': String(retryAfterSeconds) } },
  );
}

function unauthorized(error: string, status: number) {
  return NextResponse.json(
    { error },
    {
      status,
      headers: status === 401 ? { 'www-authenticate': 'Bearer realm="funnel-platform"' } : {},
    },
  );
}

export async function POST(request: Request) {
  if (!agentAccessEnabled()) return new NextResponse(null, { status: 404 });
  if (!originAllowed(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const ip = clientKey(request);
  const failures = peekRateLimit('mcp-auth', ip, ipLimit(request, 200, 20));
  if (!failures.ok) return tooMany(failures.retryAfterSeconds);
  const auth = await authenticateAgent(request.headers);
  if (!auth.ok) {
    if (auth.error === 'not_configured') return unauthorized(auth.error, 503);
    recordRateLimitHit('mcp-auth', ip, WINDOW_MS);
    return unauthorized(auth.error, 401);
  }
  const calls = checkRateLimit('mcp', auth.agent.tokenId, TOKEN_CALLS_PER_MINUTE, WINDOW_MS);
  if (!calls.ok) return tooMany(calls.retryAfterSeconds);

  const body = await readJsonBody(request, MAX_MCP_BODY_BYTES);
  if (!body.ok) return NextResponse.json({ error: body.error }, { status: body.status });

  const messages = Array.isArray(body.value) ? body.value : [body.value];
  if (messages.length === 0 || messages.length > MAX_BATCH) {
    return NextResponse.json(
      { jsonrpc: '2.0', id: null, error: { code: INVALID_REQUEST, message: 'Invalid batch.' } },
      { status: 400 },
    );
  }
  const responses: JsonRpcResponse[] = [];
  for (const message of messages) {
    const response = await handleMcpMessage(auth.agent, message);
    if (response) responses.push(response);
  }
  if (responses.length === 0) return new NextResponse(null, { status: 202 });
  return NextResponse.json(Array.isArray(body.value) ? responses : responses[0], {
    headers: { 'cache-control': 'no-store' },
  });
}

function notAllowed() {
  if (!agentAccessEnabled()) return new NextResponse(null, { status: 404 });
  return new NextResponse(null, { status: 405, headers: { allow: 'POST' } });
}

export const GET = notAllowed;
export const DELETE = notAllowed;
