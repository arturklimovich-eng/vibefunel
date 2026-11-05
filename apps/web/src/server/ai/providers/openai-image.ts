import 'server-only';
import OpenAI from 'openai';
import { AiError } from '../types';
import type {
  AiUsage,
  GenerateImageInput,
  GenerateImageResult,
  ImageAspect,
  ImageModel,
} from '../types';

const SIZES: Record<ImageAspect, '1024x1024' | '1024x1536' | '1536x1024'> = {
  '1:1': '1024x1024',
  '3:4': '1024x1536',
  '9:16': '1024x1536',
  '4:3': '1536x1024',
  '16:9': '1536x1024',
};

function mapError(error: unknown): AiError {
  if (error instanceof AiError) return error;
  if (error instanceof OpenAI.APIUserAbortError) return new AiError('aborted', 'Request aborted.');
  if (error instanceof OpenAI.RateLimitError && error.code === 'insufficient_quota') {
    return new AiError(
      'quota_exhausted',
      'The AI provider quota for this key is used up. Check the plan and billing of the API key.',
      undefined,
      error.message,
    );
  }
  if (error instanceof OpenAI.RateLimitError) {
    return new AiError('rate_limited', 'The model provider is rate limiting requests.');
  }
  if (error instanceof OpenAI.BadRequestError && error.code === 'moderation_blocked') {
    return new AiError('refusal', 'The model declined this image prompt.');
  }
  if (error instanceof OpenAI.APIError) {
    return new AiError(
      'provider_error',
      `OpenAI API error ${error.status ?? ''}`.trim(),
      undefined,
      error.message,
    );
  }
  return new AiError('provider_error', error instanceof Error ? error.message : 'Unknown error.');
}

export function createOpenAiImageModel(
  model: string,
  apiKey: string,
  baseURL?: string,
): ImageModel {
  const client = new OpenAI({ apiKey, baseURL });
  return {
    provider: 'openai',
    model,
    async generateImage(input: GenerateImageInput): Promise<GenerateImageResult> {
      try {
        const result = await client.images.generate(
          {
            model,
            prompt: input.prompt,
            n: 1,
            size: SIZES[input.aspect],
            quality: 'medium',
            output_format: 'webp',
          },
          { signal: input.signal },
        );
        const usage: AiUsage = {
          inputTokens: result.usage?.input_tokens ?? 0,
          outputTokens: result.usage?.output_tokens ?? 0,
          cachedInputTokens: 0,
          cacheWriteTokens: 0,
          images: 1,
        };
        const data = result.data?.[0]?.b64_json;
        if (!data) throw new AiError('invalid_output', 'The model returned no image.', usage);
        return { bytes: Buffer.from(data, 'base64'), mime: 'image/webp', usage };
      } catch (error) {
        throw mapError(error);
      }
    },
  };
}
