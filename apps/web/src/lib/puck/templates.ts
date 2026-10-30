import type { PuckData, ScreenType } from '@funnel/schema';
import { randomId } from '@/lib/ids';

type PuckItem = PuckData['content'][number];

function uid(prefix: string): string {
  return `${prefix}_${randomId(8)}`;
}

function heading(text: string): PuckItem {
  return { type: 'Heading', props: { id: uid('h'), text, level: '1' } };
}

function paragraph(text: string): PuckItem {
  return { type: 'Paragraph', props: { id: uid('p'), text } };
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

function templateItems(type: ScreenType): PuckItem[] {
  switch (type) {
    case 'welcome':
      return [heading('Welcome'), paragraph('Tell visitors what to expect.'), nextButton('Start')];
    case 'quiz_single':
      return [heading('Pick one option'), optionList('single'), nextButton('Continue')];
    case 'quiz_multi':
      return [heading('Pick all that apply'), optionList('multi'), nextButton('Continue')];
    case 'content':
      return [
        heading('Did you know?'),
        paragraph('Share something useful.'),
        nextButton('Continue'),
      ];
    case 'email_capture':
      return [
        heading('Where should we send your result?'),
        {
          type: 'EmailInput',
          props: {
            id: uid('e'),
            label: 'Email address',
            placeholder: 'you@example.com',
            required: true,
          },
        },
        nextButton('Continue'),
      ];
    case 'paywall':
      return [
        heading('Choose your plan'),
        priceCard('Monthly', '$19', true),
        nextButton('Continue to checkout'),
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
    case 'success':
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

export function createScreenContent(type: ScreenType): PuckData {
  return { root: { props: {} }, content: templateItems(type) };
}
