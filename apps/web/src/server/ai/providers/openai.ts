import 'server-only';
import OpenAI from 'openai';
import type { z } from 'zod';
import { strictJsonSchema } from '../json-schema';
import { AiError, joinPrompt, parseModelJson } from '../types';
import type { AiUsage, GenerateObjectInput, GenerateObjectResult, TextModel } from '../types';

function mapError(error: unknown): AiError {
  if (error instanceof OpenAI.APIUserAbortError) return new AiError('aborted', 'Request aborted.');
  if (error instanceof OpenAI.RateLimitError) {
    return new AiError('rate_limited', 'The model provider is rate limiting requests.');
  }
  if (error instanceof OpenAI.APIError) {
    return new AiError(
      'provider_error',
      `OpenAI API error ${error.status ?? ''}`.trim(),
      undefined,
      error.message,
    );
  }
  if (error instanceof AiError) return error;
  return new AiError('provider_error', error instanceof Error ? error.message : 'Unknown error.');
}

export function createOpenAiModel(model: string, apiKey: string, baseURL?: string): TextModel {
  const client = new OpenAI({ apiKey, baseURL });
  return {
    provider: 'openai',
    model,
    async generateObject<T extends z.ZodType>(
      input: GenerateObjectInput<T>,
    ): Promise<GenerateObjectResult<z.infer<T>>> {
      try {
        const completion = await client.chat.completions.create(
          {
            model,
            max_completion_tokens: input.maxTokens,
            reasoning_effort: input.effort,
            messages: [
              { role: 'system', content: input.system },
              { role: 'user', content: joinPrompt(input) },
            ],
            response_format: {
              type: 'json_schema',
              json_schema: {
                name: input.schemaName,
                strict: true,
                schema: strictJsonSchema(input.schema),
              },
            },
          },
          { signal: input.signal },
        );
        const cached = completion.usage?.prompt_tokens_details?.cached_tokens ?? 0;
        const usage: AiUsage = {
          inputTokens: (completion.usage?.prompt_tokens ?? 0) - cached,
          outputTokens: completion.usage?.completion_tokens ?? 0,
          cachedInputTokens: cached,
          images: 0,
        };
        const choice = completion.choices[0];
        if (!choice) throw new AiError('provider_error', 'The model returned no answer.', usage);
        if (choice.message.refusal) {
          throw new AiError('refusal', 'The model declined this request.', usage);
        }
        if (choice.finish_reason === 'length') {
          throw new AiError('truncated', 'The answer was cut off by the token limit.', usage);
        }
        return { object: parseModelJson(input.schema, choice.message.content ?? '', usage), usage };
      } catch (error) {
        throw mapError(error);
      }
    },
  };
}
