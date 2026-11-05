import 'server-only';
import { ApiError, FinishReason, GoogleGenAI } from '@google/genai';
import type { z } from 'zod';
import { strictJsonSchema } from '../json-schema';
import { AiError, joinPrompt, parseModelJson } from '../types';
import type { AiUsage, GenerateObjectInput, GenerateObjectResult, TextModel } from '../types';

const BLOCKED: ReadonlySet<FinishReason | undefined> = new Set([
  FinishReason.SAFETY,
  FinishReason.PROHIBITED_CONTENT,
  FinishReason.BLOCKLIST,
  FinishReason.SPII,
  FinishReason.RECITATION,
]);

function mapError(error: unknown, signal?: AbortSignal): AiError {
  if (error instanceof AiError) return error;
  if (signal?.aborted) return new AiError('aborted', 'Request aborted.');
  if (error instanceof ApiError) {
    if (error.status === 429) {
      const quota = /quota/i.test(error.message);
      return new AiError(
        quota ? 'quota_exhausted' : 'rate_limited',
        quota
          ? 'The AI provider quota for this key is used up. Check the plan and billing of the API key.'
          : 'The model provider is rate limiting requests.',
        undefined,
        error.message,
      );
    }
    return new AiError(
      'provider_error',
      `Gemini API error ${error.status}`,
      undefined,
      error.message,
    );
  }
  return new AiError('provider_error', error instanceof Error ? error.message : 'Unknown error.');
}

function withoutAdditionalProperties(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(withoutAdditionalProperties);
  if (typeof node !== 'object' || node === null) return node;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(node)) {
    if (key === 'additionalProperties') continue;
    out[key] = withoutAdditionalProperties(value);
  }
  return out;
}

export function createGoogleModel(model: string, apiKey: string): TextModel {
  const client = new GoogleGenAI({ apiKey });
  return {
    provider: 'google',
    model,
    async generateObject<T extends z.ZodType>(
      input: GenerateObjectInput<T>,
    ): Promise<GenerateObjectResult<z.infer<T>>> {
      try {
        const response = await client.models.generateContent({
          model,
          contents: joinPrompt(input),
          config: {
            systemInstruction: input.system,
            maxOutputTokens: input.maxTokens,
            responseMimeType: 'application/json',
            responseJsonSchema: withoutAdditionalProperties(strictJsonSchema(input.schema)),
            abortSignal: input.signal,
          },
        });
        const meta = response.usageMetadata;
        const cached = meta?.cachedContentTokenCount ?? 0;
        const usage: AiUsage = {
          inputTokens: (meta?.promptTokenCount ?? 0) - cached,
          outputTokens: (meta?.candidatesTokenCount ?? 0) + (meta?.thoughtsTokenCount ?? 0),
          cachedInputTokens: cached,
          cacheWriteTokens: 0,
          images: 0,
        };
        const candidate = response.candidates?.[0];
        if (!candidate || BLOCKED.has(candidate.finishReason)) {
          throw new AiError('refusal', 'The model declined this request.', usage);
        }
        if (candidate.finishReason === FinishReason.MAX_TOKENS) {
          throw new AiError('truncated', 'The answer was cut off by the token limit.', usage);
        }
        return { object: parseModelJson(input.schema, response.text ?? '', usage), usage };
      } catch (error) {
        throw mapError(error, input.signal);
      }
    },
  };
}
