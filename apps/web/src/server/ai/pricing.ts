import 'server-only';
import { z } from 'zod';
import type { AiUsage } from './types';

const priceSchema = z.object({
  input: z.number().min(0),
  output: z.number().min(0),
  cachedInput: z.number().min(0).optional(),
  cacheWrite: z.number().min(0).optional(),
  image: z.number().min(0).optional(),
});
export type ModelPrice = z.infer<typeof priceSchema>;

const BUILTIN: Record<string, ModelPrice> = {
  'anthropic:claude-opus-5-5': { input: 4, output: 20, cachedInput: 0.2 },
  'anthropic:claude-sonnet-5-5': { input: 2, output: 10, cachedInput: 0.2 },
  'anthropic:claude-haiku-5-5': { input: 0.1, output: 0.5, cachedInput: 0.01 },
};

function overrides(): Record<string, ModelPrice> {
  const raw = process.env.AI_PRICES_JSON;
  if (!raw) return {};
  try {
    const parsed = z.record(z.string(), priceSchema).safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : {};
  } catch {
    return {};
  }
}

export function priceFor(provider: string, model: string): ModelPrice | null {
  const key = `${provider}:${model}`;
  return overrides()[key] ?? BUILTIN[key] ?? null;
}

const CACHE_WRITE_FACTOR = 1.25;

export function costMicroUsd(price: ModelPrice, usage: AiUsage): number {
  const tokens =
    usage.inputTokens * price.input +
    usage.outputTokens * price.output +
    usage.cachedInputTokens * (price.cachedInput ?? price.input) +
    usage.cacheWriteTokens * (price.cacheWrite ?? price.input * CACHE_WRITE_FACTOR);
  return Math.ceil(tokens + usage.images * (price.image ?? 0) * 1_000_000);
}
