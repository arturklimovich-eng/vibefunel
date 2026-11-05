import type { z } from 'zod';

export type AiFeature = 'brief' | 'inline' | 'images' | 'chat';

export type AiEffort = 'low' | 'medium' | 'high';

export interface AiUsage {
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens: number;
  cacheWriteTokens: number;
  images: number;
}

export const EMPTY_USAGE: AiUsage = {
  inputTokens: 0,
  outputTokens: 0,
  cachedInputTokens: 0,
  cacheWriteTokens: 0,
  images: 0,
};

export function addUsage(a: AiUsage, b: AiUsage): AiUsage {
  return {
    inputTokens: a.inputTokens + b.inputTokens,
    outputTokens: a.outputTokens + b.outputTokens,
    cachedInputTokens: a.cachedInputTokens + b.cachedInputTokens,
    cacheWriteTokens: a.cacheWriteTokens + b.cacheWriteTokens,
    images: a.images + b.images,
  };
}

export interface GenerateObjectInput<T extends z.ZodType> {
  system: string;
  prefix?: string;
  prompt: string;
  schema: T;
  schemaName: string;
  effort: AiEffort;
  maxTokens: number;
  signal?: AbortSignal;
}

export interface GenerateObjectResult<T> {
  object: T;
  usage: AiUsage;
}

export interface TextModel {
  provider: string;
  model: string;
  generateObject<T extends z.ZodType>(
    input: GenerateObjectInput<T>,
  ): Promise<GenerateObjectResult<z.infer<T>>>;
}

export type AiErrorCode =
  | 'refusal'
  | 'rate_limited'
  | 'quota_exhausted'
  | 'provider_error'
  | 'invalid_output'
  | 'truncated'
  | 'aborted'
  | 'budget_exhausted';

export function joinPrompt(input: { prefix?: string; prompt: string }): string {
  return input.prefix ? `${input.prefix}\n\n${input.prompt}` : input.prompt;
}

export class AiError extends Error {
  readonly code: AiErrorCode;
  readonly usage: AiUsage;
  readonly detail: string | undefined;

  constructor(code: AiErrorCode, message: string, usage: AiUsage = EMPTY_USAGE, detail?: string) {
    super(message);
    this.name = 'AiError';
    this.code = code;
    this.usage = usage;
    this.detail = detail;
  }
}

export function parseModelJson<T extends z.ZodType>(
  schema: T,
  text: string,
  usage: AiUsage,
): z.infer<T> {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new AiError('invalid_output', 'The model returned text that is not JSON.', usage);
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new AiError(
      'invalid_output',
      `The model output does not match the schema: ${parsed.error.issues
        .slice(0, 5)
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; ')}`,
      usage,
    );
  }
  return parsed.data;
}

export const IMAGE_ASPECTS = ['1:1', '3:4', '4:3', '9:16', '16:9'] as const;
export type ImageAspect = (typeof IMAGE_ASPECTS)[number];

export interface GenerateImageInput {
  prompt: string;
  aspect: ImageAspect;
  signal?: AbortSignal;
}

export interface GenerateImageResult {
  bytes: Uint8Array;
  mime: string;
  usage: AiUsage;
}

export interface ImageModel {
  provider: string;
  model: string;
  generateImage(input: GenerateImageInput): Promise<GenerateImageResult>;
}
