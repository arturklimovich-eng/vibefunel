import { CURRENT_SCHEMA_VERSION } from './schema';
import type { Edge, FunnelDefinition, PuckData, Screen } from './schema';

type PuckItem = PuckData['content'][number];

function heading(id: string, text: string): PuckItem {
  return { type: 'Heading', props: { id, text, level: '1' } };
}
function paragraph(id: string, text: string): PuckItem {
  return { type: 'Paragraph', props: { id, text } };
}
function button(id: string, label: string): PuckItem {
  return { type: 'Button', props: { id, label, action: 'next', url: '' } };
}
function skipButton(id: string, label: string): PuckItem {
  return { type: 'Button', props: { id, label, action: 'skip', url: '' } };
}
function options(
  id: string,
  mode: 'single' | 'multi',
  items: { id: string; label: string }[],
): PuckItem {
  return { type: 'OptionList', props: { id, mode, options: items } };
}
function puck(content: PuckItem[]): PuckData {
  return { root: { props: {} }, content };
}

export function createSeedFunnel(): FunnelDefinition {
  const screens: Screen[] = [
    {
      id: 'welcome',
      type: 'welcome',
      title: 'Welcome',
      content: puck([
        heading('welcome-h', 'Find your perfect plan'),
        paragraph('welcome-p', 'Answer a few quick questions to get started.'),
        button('welcome-b', 'Start'),
      ]),
      animation: { preset: 'fade' },
      position: { x: 0, y: 200 },
    },
    {
      id: 'goal',
      type: 'quiz_single',
      title: 'Your goal',
      content: puck([
        heading('goal-h', 'What is your main goal?'),
        options('goal-o', 'single', [
          { id: 'lose_weight', label: 'Lose weight' },
          { id: 'build_muscle', label: 'Build muscle' },
        ]),
        button('goal-b', 'Continue'),
      ]),
      animation: { preset: 'slide_left' },
      position: { x: 260, y: 200 },
    },
    {
      id: 'content_lose',
      type: 'content',
      title: 'Lose weight plan',
      content: puck([
        heading('lose-h', 'A plan to lose weight'),
        paragraph('lose-p', 'Small, steady changes add up.'),
        button('lose-b', 'Continue'),
      ]),
      animation: { preset: 'slide_up' },
      position: { x: 520, y: 80 },
    },
    {
      id: 'content_muscle',
      type: 'content',
      title: 'Build muscle plan',
      content: puck([
        heading('muscle-h', 'A plan to build muscle'),
        paragraph('muscle-p', 'Progressive overload and good sleep.'),
        button('muscle-b', 'Continue'),
      ]),
      animation: { preset: 'slide_up' },
      position: { x: 520, y: 320 },
    },
    {
      id: 'focus',
      type: 'quiz_multi',
      title: 'Focus areas',
      content: puck([
        heading('focus-h', 'What do you want to focus on?'),
        paragraph('focus-p', 'Pick everything that applies.'),
        options('focus-o', 'multi', [
          { id: 'cardio', label: 'Cardio' },
          { id: 'strength', label: 'Strength' },
          { id: 'nutrition', label: 'Nutrition' },
        ]),
        button('focus-b', 'Continue'),
      ]),
      animation: { preset: 'slide_left' },
      position: { x: 780, y: 200 },
    },
    {
      id: 'content_nutrition',
      type: 'content',
      title: 'Nutrition tips',
      content: puck([
        heading('nutrition-h', 'Nutrition matters'),
        paragraph('nutrition-p', 'We will include a simple meal framework in your plan.'),
        button('nutrition-b', 'Continue'),
      ]),
      animation: { preset: 'slide_up' },
      position: { x: 1040, y: 320 },
    },
    {
      id: 'email',
      type: 'email_capture',
      title: 'Your email',
      content: puck([
        heading('email-h', 'Where should we send your plan?'),
        {
          type: 'EmailInput',
          props: {
            id: 'email-i',
            label: 'Email address',
            placeholder: 'you@example.com',
            required: true,
          },
        },
        button('email-b', 'Continue'),
      ]),
      animation: { preset: 'fade' },
      position: { x: 1040, y: 80 },
    },
    {
      id: 'paywall',
      type: 'paywall',
      title: 'Plans',
      content: puck([
        heading('paywall-h', 'Choose your plan'),
        {
          type: 'PriceCard',
          props: {
            id: 'paywall-c',
            title: 'Monthly',
            price: '$19',
            period: 'per month',
            features: [{ text: 'Personal plan' }, { text: 'Weekly check-ins' }],
            highlighted: true,
          },
        },
        button('paywall-b', 'Continue to checkout'),
        skipButton('paywall-s', 'Stay on the free plan'),
      ]),
      animation: { preset: 'slide_up' },
      position: { x: 1300, y: 80 },
    },
    {
      id: 'checkout',
      type: 'checkout',
      title: 'Checkout',
      content: puck([
        heading('checkout-h', 'Checkout'),
        { type: 'CheckoutBlock', props: { id: 'checkout-p', planKey: 'starter_onetime' } },
      ]),
      animation: { preset: 'slide_left' },
      position: { x: 1560, y: 80 },
    },
    {
      id: 'success',
      type: 'success',
      title: 'Done',
      content: puck([
        heading('success-h', 'You are all set!'),
        paragraph('success-p', 'Thanks for completing the funnel.'),
        {
          type: 'ResultSummary',
          props: { id: 'success-r', title: 'Your answers', showAnswers: false },
        },
      ]),
      animation: { preset: 'fade' },
      position: { x: 1820, y: 80 },
    },
  ];
  const edges: Edge[] = [
    { id: 'e1', sourceScreenId: 'welcome', targetScreenId: 'goal', condition: { kind: 'always' } },
    {
      id: 'e2',
      sourceScreenId: 'goal',
      targetScreenId: 'content_lose',
      condition: { kind: 'answer_equals', screenId: 'goal', optionId: 'lose_weight' },
    },
    {
      id: 'e3',
      sourceScreenId: 'goal',
      targetScreenId: 'content_muscle',
      condition: { kind: 'answer_equals', screenId: 'goal', optionId: 'build_muscle' },
    },
    {
      id: 'e6',
      sourceScreenId: 'goal',
      targetScreenId: 'content_lose',
      condition: { kind: 'default' },
    },
    {
      id: 'e4',
      sourceScreenId: 'content_lose',
      targetScreenId: 'focus',
      condition: { kind: 'always' },
    },
    {
      id: 'e5',
      sourceScreenId: 'content_muscle',
      targetScreenId: 'focus',
      condition: { kind: 'always' },
    },
    {
      id: 'e7',
      sourceScreenId: 'focus',
      targetScreenId: 'content_nutrition',
      condition: { kind: 'answer_includes', screenId: 'focus', optionId: 'nutrition' },
    },
    {
      id: 'e8',
      sourceScreenId: 'focus',
      targetScreenId: 'email',
      condition: { kind: 'default' },
    },
    {
      id: 'e9',
      sourceScreenId: 'content_nutrition',
      targetScreenId: 'email',
      condition: { kind: 'always' },
    },
    {
      id: 'e10',
      sourceScreenId: 'email',
      targetScreenId: 'paywall',
      condition: { kind: 'always' },
    },
    {
      id: 'e11',
      sourceScreenId: 'paywall',
      targetScreenId: 'checkout',
      condition: { kind: 'always' },
    },
    {
      id: 'e12',
      sourceScreenId: 'checkout',
      targetScreenId: 'success',
      condition: { kind: 'payment_succeeded', screenId: 'checkout' },
    },
    {
      id: 'e13',
      sourceScreenId: 'paywall',
      targetScreenId: 'success',
      condition: { kind: 'default' },
    },
  ];
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    startScreenId: 'welcome',
    screens,
    edges,
    theme: { primaryColor: '#4f46e5', backgroundColor: '#ffffff', textColor: '#111827' },
  };
}
