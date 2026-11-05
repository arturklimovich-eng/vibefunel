import 'server-only';
import {
  briefImageTargets,
  compileFunnel,
  heroImageKey,
  optionImageKey,
  funnelDefinitionSchema,
  normalizeOutline,
  outlineSchema,
  screenBlueprintSchema,
  screenTypeForKind,
  themeDraftSchema,
  validateFunnel,
} from '@funnel/schema';
import type {
  Brief,
  BriefPlan,
  FunnelDefinition,
  Outline,
  OutlineScreen,
  ScreenBlueprint,
  ThemeDraft,
  ValidationIssue,
} from '@funnel/schema';
import { CATALOG_BY_TYPE } from '@/lib/puck/catalog';
import { randomId } from '@/lib/ids';
import { listPublicPlans } from '../payments/plans';
import type { AiSession } from './guards';
import { AiError } from './types';
import type { ImageAspect } from './types';

const OUTLINE_SYSTEM = `You design mobile quiz funnels that turn ad traffic into leads and buyers.
You return the outline of one funnel as JSON that matches the given schema.

How a good funnel is built:
- Start with one "intro" screen: a sharp promise and who it is for.
- Then the "question" screens. Ask about the visitor's situation, goal, obstacles and preferences, so the result feels personal. 2 to 6 options each, short labels, an emoji per option when it fits the tone (null otherwise). Use "multi" only when several answers can be true at once.
- Put 1 to 3 "info" screens between questions: a fact, a mini case, social proof or how the product works. They keep momentum and build trust.
- "input" screens ask for one number, a date or a name (age, weight, budget). Use them only when the product really needs the value.
- A "loader" screen before the email or the paywall shows that a personal result is being prepared.
- Lead funnels end with an "email" screen and a "finish" screen. Paid funnels go email, then "paywall", then "checkout", then "finish".
- Branching: at most 2 extra "info" screens may react to one answer. Such a screen has branchOf = { screenKey, optionKey } pointing to an earlier question screen and one of its options; every other screen has branchOf = null. The screen after the question is shown to everyone else.
- Exactly one "finish" screen, last.

Rules:
- Write every visible text (title, question, options) in the requested language.
- key: short snake_case, unique per funnel; option keys unique per question.
- title: the screen name for the editor, 2 to 5 words.
- goal: one sentence on what the screen says and why it is there; the copywriter writes the screen from it.
- question is null on every screen except "question" screens.
- Never promise medical, financial or legal outcomes, and never invent statistics presented as real data.`;

export const ELEMENTS_GUIDE = `Elements in "elements" (top to bottom on a phone screen). Every element has the same fields: type, variant, text, items, entries (title, text, value), numbers, extra. Fill what the type uses and leave the rest empty ("", [] ).
- Text: variant "title" (one per screen, first, max ~8 words), "subtitle" or "paragraph" (1 to 3 short sentences); text. Supports **bold** and *italic*.
- List: variant "check" for benefits, "number" for steps ("bullet", "cross" also exist); items: 2 to 6 short lines.
- Faq: entries: 2 to 5, title = question, text = answer. Mostly on the paywall.
- Badge: text: a short label above the title, for example "2-minute quiz".
- Reviews: entries: 2 or 3, title = first name, text = review, value = rating 4 or 5. Keep names generic; never claim they are verified.
- Chart: variant "line" (projection) or "bars" (comparison); text = chart title; extra[0] = unit; entries: 3 to 6 points, title = label, value = number. Illustrative only, no real-world statistics.
- Timer: text = label; numbers[0] = minutes; extra[0] = text shown when it ends. A short discount countdown on the paywall.
- Rating: text = label; variant "stars", "numbers" or "emoji"; extra = [min label, max label].
- Slider: text = label; numbers = [min, max, step, initial]; extra = [unit, min label, max label].
- TextInput: text = label; variant "text", "number" or "name"; extra = [placeholder, unit].
- DatePicker: text = label; variant "date" or "birthday".
  (Rating, Slider, TextInput, DatePicker: the input on an "input" screen, one of them.)
- Checkbox: text = consent line, rarely needed.
- Loader: variant "bar" or "circle"; text = title; items = 3 to 5 steps; numbers[0] = seconds (4 to 8). Processing: variant "checklist" or "bars"; items = steps; numbers[0] = seconds. Use one of them on a "loader" screen.
- ResultSummary: text = title; a recap block on the finish screen.
- Slot: the place where the platform inserts the screen's own control: the answer options on a "question" screen, the email form on an "email" screen, the plan picker on a "paywall" and the payment form on "checkout". Use it exactly once on those screens, usually right after the title or subtitle. Do not use it on other screens.

Screen fields:
- cta: the main button label, 1 to 4 words, action-oriented. null on "checkout", "finish" and single-choice "question" screens (they advance on tap).
- skipLabel: on the paywall only, the decline link, for example "Maybe later"; null elsewhere.
- optionsLayout: "list" for long labels, "grid" or "cards" for 4 to 6 short options with emoji; null when the screen has no question.
- planNote: on the paywall only, one line under the plans about renewal or cancellation; null elsewhere.
- emailLabel: on the email screen only, the input label; null elsewhere.

Keep screens short: 2 to 6 elements. Do not repeat the question text as a separate Text when the outline title already asks it; the title Text should be the question itself on question screens. Never make medical, financial or legal promises.`;

export const SCREEN_SYSTEM = `You write the content of one screen of a mobile quiz funnel as JSON that matches the given schema.
The funnel outline and the screen to write are in the user message. Write in the requested language and the requested tone.

${ELEMENTS_GUIDE}`;

const THEME_SYSTEM = `You pick a color theme for a mobile funnel as JSON matching the schema.
Colors are 6-digit hex like #1f2937. The background is light unless the brand clearly calls for dark. Text must have strong contrast with the background, and the primary color must work as a button background with white text. font: "sans" by default, "serif" for premium or editorial brands, "rounded" for playful ones.`;

export function briefPlans(brief: Brief): BriefPlan[] {
  if (brief.goal === 'lead') return [];
  const all = listPublicPlans().plans;
  const picked =
    brief.planKeys.length > 0 ? all.filter((p) => brief.planKeys.includes(p.key)) : all;
  return picked.slice(0, 4);
}

function briefText(brief: Brief, plans: BriefPlan[]): string {
  return JSON.stringify({
    product: brief.product,
    offer: brief.offer,
    audience: brief.audience,
    goal: brief.goal,
    questionScreens: brief.questions,
    tone: brief.tone,
    language: brief.language,
    plans: plans.map((p) => ({ title: p.title, price: p.displayPrice })),
  });
}

function outlineText(outline: Outline): string {
  return outline.screens
    .map((s, i) => {
      const q = s.question
        ? ` | ${s.question.mode} question: ${s.question.text} [${s.question.options
            .map((o) => o.label)
            .join(' / ')}]`
        : '';
      const b = s.branchOf
        ? ` | shown after answer ${s.branchOf.optionKey} on ${s.branchOf.screenKey}`
        : '';
      return `${i + 1}. ${s.key} (${s.kind}) "${s.title}": ${s.goal}${q}${b}`;
    })
    .join('\n');
}

export async function generateOutline(
  session: AiSession,
  brief: Brief,
  signal?: AbortSignal,
): Promise<Outline> {
  const plans = briefPlans(brief);
  const outline = await withRetry(() =>
    session.generate({
      system: OUTLINE_SYSTEM,
      prompt: `Brief:\n${briefText(brief, plans)}\n\nReturn the outline with exactly ${brief.questions} "question" screens.`,
      schema: outlineSchema,
      schemaName: 'funnel_outline',
      effort: 'medium',
      maxTokens: 16000,
      signal,
    }),
  );
  return normalizeOutline(outline, brief, plans);
}

export function allowedElement(elementType: string, screenType: string): boolean {
  const entry = CATALOG_BY_TYPE.get(elementType);
  return (
    entry !== undefined &&
    !entry.hidden &&
    (entry.screens as readonly string[]).includes(screenType)
  );
}

export async function withRetry<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    if (error instanceof AiError && error.code === 'invalid_output') return run();
    throw error;
  }
}

export async function pool<T>(
  items: T[],
  size: number,
  task: (item: T) => Promise<void>,
): Promise<void> {
  let next = 0;
  const workers = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (next < items.length) {
      const item = items[next++]!;
      await task(item);
    }
  });
  await Promise.all(workers);
}

export type BriefEvent =
  | { type: 'screen'; key: string; ok: boolean }
  | { type: 'theme'; ok: boolean }
  | { type: 'image'; done: number; total: number; ok: boolean };

export type MakeImage = (
  prompt: string,
  aspect: ImageAspect,
  signal?: AbortSignal,
) => Promise<string>;

interface ImageJob {
  key: string;
  prompt: string;
  aspect: ImageAspect;
}

function imageJobs(brief: Brief, outline: Outline): ImageJob[] {
  const { hero, question } = briefImageTargets(outline);
  const style = `Style: clean modern illustration, soft light, calm palette${
    brief.brandColor ? ` with accents of ${brief.brandColor}` : ''
  }, one clear subject, plenty of empty space. No text, letters, numbers, logos or watermarks.`;
  const about = `Product: ${brief.product}.${brief.audience ? ` Audience: ${brief.audience}.` : ''}`;
  const jobs: ImageJob[] = [];
  if (hero) {
    jobs.push({
      key: heroImageKey(hero.key),
      aspect: '4:3',
      prompt: `Hero picture for the first screen of a mobile quiz funnel. ${about} Screen: ${hero.title}. ${hero.goal} ${style}`,
    });
  }
  if (question?.question) {
    for (const option of question.question.options) {
      jobs.push({
        key: optionImageKey(question.key, option.key),
        aspect: '1:1',
        prompt: `Small square picture for the answer "${option.label}" to the quiz question "${question.question.text}". ${about} Show the answer as one simple scene or object. ${style}`,
      });
    }
  }
  return jobs;
}

const STOP_IMAGES: ReadonlySet<string> = new Set([
  'budget_exhausted',
  'quota_exhausted',
  'rate_limited',
]);

export interface BriefResult {
  definition: FunnelDefinition;
  warnings: ValidationIssue[];
  failedScreens: string[];
}

export async function generateFunnel(
  session: AiSession,
  brief: Brief,
  rawOutline: Outline,
  onEvent: (event: BriefEvent) => void,
  signal?: AbortSignal,
  makeImage?: MakeImage,
): Promise<BriefResult> {
  const plans = briefPlans(brief);
  const outline = normalizeOutline(rawOutline, brief, plans);
  const context = `Brief:\n${briefText(brief, plans)}\n\nFunnel outline:\n${outlineText(outline)}`;
  const blueprints: Record<string, ScreenBlueprint | undefined> = {};
  const failedScreens: string[] = [];
  let theme: ThemeDraft | null = null;

  const themeTask = (async () => {
    try {
      theme = await withRetry(() =>
        session.generate({
          system: THEME_SYSTEM,
          prompt: `Brand: ${brief.product}\nAudience: ${brief.audience}\nTone: ${brief.tone}${
            brief.brandColor ? `\nBrand primary color: ${brief.brandColor}` : ''
          }`,
          schema: themeDraftSchema,
          schemaName: 'funnel_theme',
          effort: 'low',
          maxTokens: 4000,
          signal,
        }),
      );
      onEvent({ type: 'theme', ok: true });
    } catch (error) {
      if (
        error instanceof AiError &&
        (error.code === 'budget_exhausted' || error.code === 'aborted')
      ) {
        throw error;
      }
      onEvent({ type: 'theme', ok: false });
    }
  })();

  const writeScreen = async (screen: OutlineScreen) => {
    signal?.throwIfAborted();
    try {
      blueprints[screen.key] = await withRetry(() =>
        session.generate({
          system: SCREEN_SYSTEM,
          prefix: context,
          prompt: `Write screen "${screen.key}" (kind: ${screen.kind}, platform screen type: ${screenTypeForKind(
            screen.kind,
          )}):\n${JSON.stringify(screen)}`,
          schema: screenBlueprintSchema,
          schemaName: 'funnel_screen',
          effort: 'low',
          maxTokens: 12000,
          signal,
        }),
      );
      onEvent({ type: 'screen', key: screen.key, ok: true });
    } catch (error) {
      if (
        error instanceof AiError &&
        (error.code === 'budget_exhausted' || error.code === 'aborted')
      ) {
        throw error;
      }
      console.error(
        '[ai] screen',
        screen.key,
        error instanceof AiError ? (error.detail ?? error.message) : error,
      );
      failedScreens.push(screen.key);
      onEvent({ type: 'screen', key: screen.key, ok: false });
    }
  };

  const [firstScreen, ...restScreens] = outline.screens;
  const screenTask = (async () => {
    if (firstScreen) await writeScreen(firstScreen);
    await pool(restScreens, 4, writeScreen);
  })();

  const images: Record<string, string> = {};
  const imageTask = (async () => {
    if (!makeImage) return;
    const jobs = imageJobs(brief, outline);
    let done = 0;
    let stopped = false;
    await pool(jobs, 3, async (job) => {
      let ok = false;
      if (!stopped) {
        try {
          images[job.key] = await makeImage(job.prompt, job.aspect, signal);
          ok = true;
        } catch (error) {
          if (error instanceof AiError && error.code === 'aborted') throw error;
          if (error instanceof AiError && STOP_IMAGES.has(error.code)) stopped = true;
          console.error(
            '[ai] image',
            job.key,
            error instanceof AiError ? (error.detail ?? error.message) : error,
          );
        }
      }
      onEvent({ type: 'image', done: ++done, total: jobs.length, ok });
    });
  })();

  await Promise.all([themeTask, screenTask, imageTask]);

  if (outline.screens.length > 0 && failedScreens.length === outline.screens.length) {
    throw new AiError('provider_error', 'No screen could be written. Try again later.');
  }

  const definition = compileFunnel({
    outline,
    blueprints,
    theme,
    brief,
    plans,
    allowed: allowedElement,
    newId: () => randomId(8),
    images,
  });
  const parsed = funnelDefinitionSchema.safeParse(definition);
  if (!parsed.success) {
    throw new AiError(
      'invalid_output',
      `The generated funnel does not fit the schema: ${parsed.error.issues[0]?.message ?? ''}`,
    );
  }
  const result = validateFunnel(parsed.data, { mode: 'save' });
  if (result.errors.length > 0) {
    throw new AiError(
      'invalid_output',
      `The generated funnel has errors: ${result.errors.map((e) => e.message).join(' ')}`,
    );
  }
  return { definition: parsed.data, warnings: result.warnings, failedScreens };
}
