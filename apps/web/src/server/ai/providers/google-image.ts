import 'server-only';
import { ApiError, FinishReason, GoogleGenAI, Modality } from '@google/genai';
import { AiError } from '../types';
import type { AiUsage, GenerateImageInput, GenerateImageResult, ImageModel } from '../types';

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

export function createGoogleImageModel(model: string, apiKey: string): ImageModel {
  const client = new GoogleGenAI({ apiKey });
  return {
    provider: 'google',
    model,
    async generateImage(input: GenerateImageInput): Promise<GenerateImageResult> {
      try {
        const response = await client.models.generateContent({
          model,
          contents: input.prompt,
          config: {
            responseModalities: [Modality.IMAGE],
            imageConfig: { aspectRatio: input.aspect },
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
          images: 1,
        };
        const candidate = response.candidates?.[0];
        if (
          !candidate ||
          candidate.finishReason === FinishReason.SAFETY ||
          candidate.finishReason === FinishReason.PROHIBITED_CONTENT ||
          candidate.finishReason === FinishReason.IMAGE_SAFETY
        ) {
          throw new AiError('refusal', 'The model declined this image prompt.', usage);
        }
        const part = candidate.content?.parts?.find((p) => p.inlineData?.data);
        const data = part?.inlineData?.data;
        if (!data) {
          throw new AiError('invalid_output', 'The model returned no image.', usage);
        }
        return {
          bytes: Buffer.from(data, 'base64'),
          mime: part.inlineData?.mimeType ?? 'image/png',
          usage,
        };
      } catch (error) {
        throw mapError(error, input.signal);
      }
    },
  };
}
