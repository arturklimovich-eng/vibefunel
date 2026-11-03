import type { PuckData, ScreenType } from '@funnel/schema';
import { randomId } from '@/lib/ids';

type PuckItem = PuckData['content'][number];

function uid(prefix: string): string {
  return `${prefix}_${randomId(8)}`;
}

function heading(text: string): PuckItem {
  return { type: 'Text', props: { id: uid('el'), text, variant: 'title' } };
}

function paragraph(text: string): PuckItem {
  return { type: 'Text', props: { id: uid('el'), text, variant: 'paragraph' } };
}

function nextButton(label: string): PuckItem {
  return { type: 'Button', props: { id: uid('b'), label, action: 'next', url: '' } };
}

function priceCard(title: string, price: string, highlighted: boolean): PuckItem {
  return {
    type: 'PriceCard',
    props: {
      id: uid('price'),
      title,
      price,
      period: 'per month',
      features: [{ text: 'Feature one' }, { text: 'Feature two' }],
      highlighted,
    },
  };
}

function skipButton(label: string): PuckItem {
  return { type: 'Button', props: { id: uid('b'), label, action: 'skip', url: '' } };
}

function checkoutBlock(): PuckItem {
  return { type: 'CheckoutBlock', props: { id: uid('pay'), planKey: '' } };
}

function optionList(mode: 'single' | 'multi'): PuckItem {
  return {
    type: 'OptionList',
    props: {
      id: uid('o'),
      mode,
      options: [
        { id: 'option_a', label: 'Option A' },
        { id: 'option_b', label: 'Option B' },
      ],
    },
  };
}

function attached(item: PuckItem): PuckItem {
  return { ...item, props: { ...item.props, style: { position: 'attached' } } };
}

function templateItems(type: ScreenType): PuckItem[] {
  switch (type) {
    case 'default':
      return [heading('New screen'), attached(nextButton('Continue'))];
    case 'auth':
      return [
        heading('Save your progress'),
        paragraph('Enter your email to keep your result.'),
        {
          type: 'EmailInput',
          props: {
            id: uid('e'),
            label: 'Email address',
            placeholder: 'you@example.com',
            required: true,
          },
        },
        attached(nextButton('Continue')),
      ];
    case 'paywall':
      return [
        heading('Choose your plan'),
        priceCard('Monthly', '$19', true),
        attached(nextButton('Continue to checkout')),
      ];
    case 'checkout':
      return [heading('Checkout'), priceCard('Monthly', '$19', false), checkoutBlock()];
    case 'upsell':
      return [
        heading('One more offer'),
        paragraph('Add this before you finish.'),
        priceCard('Add-on', '$9', true),
        checkoutBlock(),
        skipButton('No thanks'),
      ];
    case 'finish':
      return [
        heading('You are all set!'),
        paragraph('Thanks for completing the funnel.'),
        {
          type: 'ResultSummary',
          props: { id: uid('r'), title: 'Your answers', showAnswers: false },
        },
      ];
  }
}

export function createQuizContent(mode: 'single' | 'multi'): PuckData {
  return {
    root: { props: {} },
    content: [
      heading(mode === 'single' ? 'Pick one option' : 'Pick all that apply'),
      optionList(mode),
      attached(nextButton('Continue')),
    ],
  };
}

export function createScreenContent(type: ScreenType): PuckData {
  return { root: { props: {} }, content: templateItems(type) };
}
