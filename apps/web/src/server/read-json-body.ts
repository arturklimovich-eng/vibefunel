export const MAX_BODY_BYTES = 1024 * 1024;

export type BodyResult =
  | { ok: true; value: unknown }
  | { ok: false; status: 400 | 413; error: 'invalid_json' | 'payload_too_large' };

export async function readJsonBody(
  request: Request,
  maxBytes: number = MAX_BODY_BYTES,
): Promise<BodyResult> {
  const declared = request.headers.get('content-length');
  if (declared !== null) {
    const length = Number(declared);
    if (Number.isFinite(length) && length > maxBytes) {
      return { ok: false, status: 413, error: 'payload_too_large' };
    }
  }
  if (!request.body) return { ok: false, status: 400, error: 'invalid_json' };

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let received = 0;
  let text = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > maxBytes) {
      await reader.cancel();
      return { ok: false, status: 413, error: 'payload_too_large' };
    }
    text += decoder.decode(value, { stream: true });
  }
  text += decoder.decode();

  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (error) {
    if (error instanceof SyntaxError) return { ok: false, status: 400, error: 'invalid_json' };
    throw error;
  }
}
