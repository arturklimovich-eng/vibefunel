import { z } from 'zod';
import type { Screen } from '@funnel/schema';
import { blockId } from '@/lib/puck/block-id';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;
const MAX_EMAIL_LENGTH = 254;

export const emailInputProps = z.object({
  label: z.string().default('Email'),
  placeholder: z.string().default(''),
  required: z.boolean().default(true),
  consentLabel: z.string().default(''),
});

export type EmailInputProps = z.infer<typeof emailInputProps>;

export const EMAIL_BLOCK_TYPES: ReadonlySet<string> = new Set(['EmailInput', 'EmailOAuth']);

export interface EmailBlock {
  blockId: string;
  props: EmailInputProps | null;
}

export function emailKey(screenId: string, blockId: string): string {
  return `${screenId}:${blockId}`;
}

export function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= MAX_EMAIL_LENGTH && EMAIL_PATTERN.test(trimmed);
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function emailBlocksOf(screen: Screen): EmailBlock[] {
  const blocks: EmailBlock[] = [];
  screen.content.content.forEach((item, index) => {
    if (!EMAIL_BLOCK_TYPES.has(item.type)) return;
    const parsed = emailInputProps.safeParse(item.props);
    blocks.push({ blockId: blockId(item, index), props: parsed.success ? parsed.data : null });
  });
  return blocks;
}
