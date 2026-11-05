import { z } from 'zod';
import { OUTLINE_KINDS } from './brief';

const id = z.string().max(100);
const color = z.string().max(20);

export const assistantQuestionSchema = z.object({
  text: z.string().max(200),
  mode: z.enum(['single', 'multi']),
  options: z
    .array(
      z.object({
        id,
        key: z.string().min(1).max(60),
        label: z.string().min(1).max(120),
        emoji: z.string().max(16),
      }),
    )
    .max(12),
});
export type AssistantQuestion = z.infer<typeof assistantQuestionSchema>;

export const assistantCardSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('choice'),
    question: z.string().max(200),
    options: z.array(z.string().max(80)).max(6),
  }),
  z.object({
    kind: z.literal('plan'),
    title: z.string().max(120),
    steps: z.array(z.object({ title: z.string().max(120), kind: z.enum(OUTLINE_KINDS) })).max(40),
  }),
  z.object({
    kind: z.literal('theme'),
    palettes: z
      .array(
        z.object({
          name: z.string().max(40),
          primaryColor: color,
          backgroundColor: color,
          textColor: color,
        }),
      )
      .max(4),
  }),
  z.object({ kind: z.literal('issues') }),
  z.object({ kind: z.literal('screens'), screenIds: z.array(id).max(12) }),
]);
export type AssistantCard = z.infer<typeof assistantCardSchema>;

export const ASSISTANT_OPS = [
  'screen',
  'set_texts',
  'remove_screen',
  'add_edge',
  'remove_edge',
  'set_start_screen',
  'set_theme',
] as const;

export const assistantOpSchema = z.object({
  op: z.enum(ASSISTANT_OPS),
  screenId: id,
  ref: z.string().max(60),
  kind: z.enum(OUTLINE_KINDS),
  title: z.string().max(120),
  after: id,
  question: assistantQuestionSchema,
  content: z.string().max(1000),
  edits: z.array(z.object({ field: z.string().max(20), value: z.string().max(2000) })).max(120),
  from: id,
  to: id,
  when: z.enum(['always', 'default', 'answer']),
  option: id,
  edgeId: id,
  primaryColor: color,
  backgroundColor: color,
  textColor: color,
  font: z.enum(['sans', 'serif', 'rounded', 'keep']),
});
export type AssistantOp = z.infer<typeof assistantOpSchema>;

export const assistantAnswerSchema = z.object({
  reply: z.string().max(4000),
  cards: z.array(assistantCardSchema).max(4),
  ops: z.array(assistantOpSchema).max(60),
});
export type AssistantAnswer = z.infer<typeof assistantAnswerSchema>;
