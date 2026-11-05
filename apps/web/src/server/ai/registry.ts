import 'server-only';
import type { BriefPlan } from '@funnel/schema';
import { listPublicPlans } from '../payments/plans';
import { priceFor } from './pricing';
import type { ModelPrice } from './pricing';
import type { AiFeature, ImageModel, TextModel } from './types';

export interface ModelRef {
  provider: string;
  model: string;
  price: ModelPrice;
}

const TEXT_PROVIDERS = ['anthropic', 'openai', 'google'] as const;
type TextProvider = (typeof TEXT_PROVIDERS)[number];

function providerKey(provider: TextProvider): string | undefined {
  if (provider === 'anthropic') return process.env.ANTHROPIC_API_KEY;
  if (provider === 'openai') return process.env.OPENAI_API_KEY;
  return (
    process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY
  );
}

function parseRef(raw: string | undefined): (ModelRef & { provider: TextProvider }) | null {
  if (process.env.AI_ENABLED === 'false') return null;
  const value = raw?.trim();
  if (!value) return null;
  const sep = value.indexOf(':');
  if (sep <= 0) return null;
  const provider = value.slice(0, sep);
  const model = value.slice(sep + 1);
  if (!isTextProvider(provider) || model === '' || !providerKey(provider)) return null;
  const price = priceFor(provider, model);
  if (!price) return null;
  return { provider, model, price };
}

function envFor(feature: AiFeature): string | undefined {
  const specific = process.env[`AI_TEXT_MODEL_${feature.toUpperCase()}`];
  return specific && specific.trim() !== '' ? specific : process.env.AI_TEXT_MODEL;
}

function isTextProvider(value: string): value is TextProvider {
  return (TEXT_PROVIDERS as readonly string[]).includes(value);
}

export function textModelRef(feature: AiFeature): (ModelRef & { provider: TextProvider }) | null {
  return parseRef(envFor(feature));
}

export function imageModelRef(): (ModelRef & { provider: TextProvider }) | null {
  const ref = parseRef(process.env.AI_IMAGE_MODEL);
  return ref && ref.provider !== 'anthropic' ? ref : null;
}

export async function getImageModel(): Promise<(ImageModel & { ref: ModelRef }) | null> {
  const ref = imageModelRef();
  if (!ref) return null;
  const key = providerKey(ref.provider) ?? '';
  let model: ImageModel;
  if (ref.provider === 'openai') {
    const { createOpenAiImageModel } = await import('./providers/openai-image');
    model = createOpenAiImageModel(ref.model, key, process.env.OPENAI_BASE_URL || undefined);
  } else {
    const { createGoogleImageModel } = await import('./providers/google-image');
    model = createGoogleImageModel(ref.model, key);
  }
  return Object.assign(model, { ref });
}

export function aiChatEnabled(): boolean {
  return textModelRef('chat') !== null;
}

export function aiImagesEnabled(): boolean {
  return imageModelRef() !== null;
}

export async function getTextModel(
  feature: AiFeature,
): Promise<(TextModel & { ref: ModelRef }) | null> {
  const ref = textModelRef(feature);
  if (!ref) return null;
  const key = providerKey(ref.provider) ?? '';
  let model: TextModel;
  if (ref.provider === 'anthropic') {
    const { createAnthropicModel } = await import('./providers/anthropic');
    model = createAnthropicModel(ref.model, key);
  } else if (ref.provider === 'openai') {
    const { createOpenAiModel } = await import('./providers/openai');
    model = createOpenAiModel(ref.model, key, process.env.OPENAI_BASE_URL || undefined);
  } else {
    const { createGoogleModel } = await import('./providers/google');
    model = createGoogleModel(ref.model, key);
  }
  return Object.assign(model, { ref });
}

export interface AiBriefOptions {
  plans: BriefPlan[];
}

export function aiBriefOptions(): AiBriefOptions | null {
  if (!textModelRef('brief')) return null;
  return { plans: listPublicPlans().plans };
}

export function aiInlineEnabled(): boolean {
  return textModelRef('inline') !== null;
}
