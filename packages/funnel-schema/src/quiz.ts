import type { Screen } from './schema';

export type QuizMode = 'single' | 'multi';

export interface QuizInfo {
  mode: QuizMode;
  optionIds: string[];
  lists: number;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function quizOf(screen: Pick<Screen, 'content'>): QuizInfo | null {
  let first: Omit<QuizInfo, 'lists'> | null = null;
  let lists = 0;
  for (const item of screen.content.content) {
    if (item.type !== 'OptionList') continue;
    lists += 1;
    if (first) continue;
    const options = Array.isArray(item.props.options) ? item.props.options : [];
    first = {
      mode: item.props.mode === 'multi' ? 'multi' : 'single',
      optionIds: options
        .map((o) => (isRecord(o) && typeof o.id === 'string' ? o.id : ''))
        .filter((id) => id.length > 0),
    };
  }
  return first ? { ...first, lists } : null;
}

export function isQuizScreen(screen: Pick<Screen, 'content'>): boolean {
  const quiz = quizOf(screen);
  return quiz !== null && quiz.optionIds.length > 0;
}
