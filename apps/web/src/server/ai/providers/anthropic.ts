import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import type { z } from 'zod';
import { strictJsonSchema } from '../json-schema';
import { AiError, parseModelJson } from '../types';
import type { AiUsage, GenerateObjectInput, GenerateObjectResult, TextModel } from '../types';

const FALLBACK_BETA = 'server-side-fallback-2026-07-01';
const FALLBACK_MODELS = new Set([
  'claude-fable-5-1',
  'claude-opus-5-5',
  'claude-opus-5',
  'claude-sonnet-5-5',
]);

function mapError(error: unknown): AiError {
  if (error instanceof Anthropic.APIUserAbortError)
    return new AiError('aborted', 'Request aborted.');
  if (error instanceof Anthropic.RateLimitError) {
    return new AiError('rate_limited', 'The model provider is rate limiting requests.');
  }
  if (error instanceof Anthropic.APIError) {
    return new AiError(
      'provider_error',
      `Anthropic API error ${error.status ?? ''}`.trim(),
      undefined,
      error.message,
    );
  }
  if (error instanceof AiError) return error;
  return new AiError('provider_error', error instanceof Error ? error.message : 'Unknown error.');
}

export function createAnthropicModel(model: string, apiKey: string): TextModel {
  const client = new Anthropic({ apiKey });
  return {
    provider: 'anthropic',
    model,
    async generateObject<T extends z.ZodType>(
      input: GenerateObjectInput<T>,
    ): Promise<GenerateObjectResult<z.infer<T>>> {
      try {
        const stream = client.beta.messages.stream(
          {
            model,
            max_tokens: input.maxTokens,
            ...(FALLBACK_MODELS.has(model)
              ? { betas: [FALLBACK_BETA], fallbacks: 'default' as const }
              : {}),
            system: [{ type: 'text', text: input.system, cache_control: { type: 'ephemeral' } }],
            output_config: {
              effort: input.effort,
              format: { type: 'json_schema', schema: strictJsonSchema(input.schema) },
            },
            messages: [
              {
                role: 'user',
                content: input.prefix
                  ? [
                      { type: 'text', text: input.prefix, cache_control: { type: 'ephemeral' } },
                      { type: 'text', text: input.prompt },
                    ]
                  : input.prompt,
              },
            ],
          },
          { signal: input.signal },
        );
        const message = await stream.finalMessage();
        const usage: AiUsage = {
          inputTokens: message.usage.input_tokens,
          cacheWriteTokens: message.usage.cache_creation_input_tokens ?? 0,
          outputTokens: message.usage.output_tokens,
          cachedInputTokens: message.usage.cache_read_input_tokens ?? 0,
          images: 0,
        };
        if (message.stop_reason === 'refusal') {
          throw new AiError('refusal', 'The model declined this request.', usage);
        }
        if (message.stop_reason === 'max_tokens') {
          throw new AiError('truncated', 'The answer was cut off by the token limit.', usage);
        }
        const text = message.content
          .flatMap((block) => (block.type === 'text' ? [block.text] : []))
          .join('');
        return { object: parseModelJson(input.schema, text, usage), usage };
      } catch (error) {
        throw mapError(error);
      }
    },
  };
}
