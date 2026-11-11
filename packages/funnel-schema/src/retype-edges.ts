import { isQuizScreen } from './quiz';
import { isPaymentType } from './schema';
import type { Edge, Screen, ScreenType } from './schema';

export interface RetypeResult {
  edges: Edge[];
  changes: number;
}

export function retypeEdges(
  edges: Edge[],
  screen: Screen,
  newType: ScreenType,
  keptContent: Screen['content']['content'] = screen.content.content,
): RetypeResult {
  const wasPayment = isPaymentType(screen.type);
  const willBePayment = isPaymentType(newType);
  const willBeQuiz = isQuizScreen({ content: { ...screen.content, content: keptContent } });
  let changes = 0;
  let declineKept = false;
  const hasDefault = edges.some(
    (e) => e.sourceScreenId === screen.id && e.condition.kind === 'default',
  );
  const result: Edge[] = [];
  for (const edge of edges) {
    if (edge.sourceScreenId !== screen.id) {
      result.push(edge);
      continue;
    }
    const condition = edge.condition;
    if (condition.kind === 'answer_equals' || condition.kind === 'answer_includes') {
      if (!willBeQuiz || willBePayment) {
        changes += 1;
        continue;
      }
      result.push(edge);
      continue;
    }
    if (willBePayment && !wasPayment) {
      if (condition.kind === 'default') {
        if (declineKept) {
          changes += 1;
          continue;
        }
        declineKept = true;
        result.push(edge);
        continue;
      }
      if (condition.kind === 'always') {
        if (declineKept || hasDefault) {
          changes += 1;
          continue;
        }
        declineKept = true;
        changes += 1;
        result.push({ ...edge, condition: { kind: 'default' } });
        continue;
      }
    }
    if (wasPayment && !willBePayment && condition.kind === 'payment_succeeded') {
      changes += 1;
      result.push({ ...edge, condition: { kind: 'always' } });
      continue;
    }
    result.push(edge);
  }
  return { edges: result, changes };
}
