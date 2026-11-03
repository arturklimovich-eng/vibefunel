import type { ReactNode } from 'react';
import { SCREEN_TYPES } from '@funnel/schema';
import type { ScreenType } from '@funnel/schema';

export type StyleKind = 'text' | 'button' | 'options' | 'box' | 'media' | 'none';

export type CategoryId =
  | 'containers'
  | 'typography'
  | 'media'
  | 'quiz'
  | 'inputs'
  | 'buttons'
  | 'auth'
  | 'loaders'
  | 'paywall'
  | 'engagement';

export interface CatalogEntry {
  type: string;
  label: string;
  category: CategoryId;
  hint: string;
  styleKind: StyleKind;
  screens: readonly ScreenType[];
  hidden?: boolean;
}

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const CATEGORIES: { id: CategoryId; label: string; icon: ReactNode }[] = [
  {
    id: 'containers',
    label: 'Containers',
    icon: (
      <Svg>
        <rect x="3.5" y="3.5" width="17" height="17" rx="2" strokeDasharray="3 2.5" />
      </Svg>
    ),
  },
  {
    id: 'typography',
    label: 'Typography',
    icon: (
      <Svg>
        <path d="M5 6h14M12 6v13M9 19h6" />
      </Svg>
    ),
  },
  {
    id: 'media',
    label: 'Media & Display',
    icon: (
      <Svg>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 16 5-5 4 4 3-3 6 6" />
        <circle cx="15.5" cy="9" r="1.5" />
      </Svg>
    ),
  },
  {
    id: 'quiz',
    label: 'Quiz',
    icon: (
      <Svg>
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="m8 10 2 2 4-4M8 20h8" />
      </Svg>
    ),
  },
  {
    id: 'inputs',
    label: 'Inputs',
    icon: (
      <Svg>
        <rect x="3" y="7" width="18" height="10" rx="2" />
        <path d="M7 10v4" />
      </Svg>
    ),
  },
  {
    id: 'buttons',
    label: 'Buttons',
    icon: (
      <Svg>
        <rect x="3" y="7" width="18" height="10" rx="5" />
        <path d="m13 12 4 3-1.5.5L17 18" />
      </Svg>
    ),
  },
  {
    id: 'auth',
    label: 'Authentication',
    icon: (
      <Svg>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
      </Svg>
    ),
  },
  {
    id: 'loaders',
    label: 'Loaders',
    icon: (
      <Svg>
        <path d="M12 3a9 9 0 1 1-9 9" />
      </Svg>
    ),
  },
  {
    id: 'paywall',
    label: 'Paywall Elements',
    icon: (
      <Svg>
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M3 10h18M7 15h4" />
      </Svg>
    ),
  },
  {
    id: 'engagement',
    label: 'User Engagement',
    icon: (
      <Svg>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M3 20c.8-3.5 3.2-5.5 6-5.5M15 15l2 2 4-4" />
      </Svg>
    ),
  },
];

const ALL = SCREEN_TYPES;
const ASK: readonly ScreenType[] = ['default', 'auth'];
const ENTRY: readonly ScreenType[] = ['default', 'auth', 'finish'];
const SELL: readonly ScreenType[] = ['paywall', 'checkout', 'upsell'];
const PAY: readonly ScreenType[] = ['checkout', 'upsell'];
const LOAD: readonly ScreenType[] = ['default', 'finish'];

type Base = Omit<CatalogEntry, 'category' | 'hint'> & { category?: CategoryId; hint?: string };

const BASE: Base[] = [
  { type: 'Columns', label: 'Columns', styleKind: 'box', screens: ALL },
  { type: 'Rows', label: 'Rows', styleKind: 'box', screens: ALL },
  { type: 'Carousel', label: 'Carousel', styleKind: 'box', screens: ALL },
  { type: 'Popup', label: 'Popup', styleKind: 'box', screens: ALL },
  { type: 'Text', label: 'Text', styleKind: 'text', screens: ALL },
  { type: 'List', label: 'List', styleKind: 'text', screens: ALL },
  { type: 'Faq', label: 'FAQ', styleKind: 'box', screens: ALL },
  { type: 'Divider', label: 'Divider', styleKind: 'none', screens: ALL },
  { type: 'RawHtml', label: 'Raw HTML', styleKind: 'none', screens: ALL },
  { type: 'Image', label: 'Image', styleKind: 'media', screens: ALL },
  { type: 'Video', label: 'Video', styleKind: 'media', screens: ALL },
  { type: 'Lottie', label: 'Lottie', styleKind: 'media', screens: ALL },
  { type: 'Chart', label: 'Chart', styleKind: 'box', screens: ALL },
  { type: 'Badge', label: 'Badge', styleKind: 'button', screens: ALL },
  { type: 'OptionList', label: 'Options', styleKind: 'options', screens: ASK },
  { type: 'Rating', label: 'Rating', styleKind: 'options', screens: ASK },
  { type: 'Slider', label: 'Slider', styleKind: 'box', screens: ASK },
  { type: 'TextInput', label: 'Input', styleKind: 'box', screens: ASK },
  { type: 'DatePicker', label: 'Date Picker', styleKind: 'box', screens: ASK },
  { type: 'EmailInput', label: 'Email Form', styleKind: 'box', screens: ENTRY },
  { type: 'Checkbox', label: 'Checkbox', styleKind: 'box', screens: ALL },
  { type: 'Button', label: 'Button', styleKind: 'button', screens: ALL },
  { type: 'WalletButton', label: 'Wallet Button', styleKind: 'button', screens: PAY },
  { type: 'EmailOAuth', label: 'Email + OAuth', styleKind: 'box', screens: ENTRY },
  { type: 'OAuthButton', label: 'OAuth Button', styleKind: 'button', screens: ENTRY },
  { type: 'OAuthButtons', label: 'OAuth Buttons', styleKind: 'button', screens: ENTRY },
  { type: 'Loader', label: 'Loader', styleKind: 'box', screens: LOAD },
  { type: 'Spinner', label: 'Spinner', styleKind: 'text', screens: LOAD },
  { type: 'Processing', label: 'Processing', styleKind: 'box', screens: LOAD },
  { type: 'BillingPlanPicker', label: 'Billing Plan Picker', styleKind: 'options', screens: SELL },
  {
    type: 'PlanPicker',
    label: 'Subscription Plan Picker (simple)',
    styleKind: 'options',
    screens: SELL,
  },
  {
    type: 'PlanPickerComposite',
    label: 'Subscription Plan Picker (composite)',
    styleKind: 'options',
    screens: SELL,
  },
  { type: 'TrialPicker', label: 'Trial Price Picker', styleKind: 'options', screens: SELL },
  { type: 'PriceCard', label: 'Price Card', styleKind: 'box', screens: SELL },
  { type: 'Totals', label: 'Totals', styleKind: 'box', screens: SELL },
  { type: 'CheckoutBlock', label: 'Checkout', styleKind: 'none', screens: PAY },
  { type: 'Timer', label: 'Timer', styleKind: 'box', screens: ALL },
  { type: 'Reviews', label: 'Reviews', styleKind: 'box', screens: ALL },
  { type: 'CustomerCarousel', label: 'Customer Carousel', styleKind: 'box', screens: ALL },
  {
    type: 'ResultSummary',
    label: 'Result Summary',
    styleKind: 'text',
    screens: ['default', 'finish'],
  },
  { type: 'CookieConsent', label: 'Cookie Consent', styleKind: 'box', screens: ALL },
  { type: 'Heading', label: 'Title (legacy)', styleKind: 'text', screens: ALL, hidden: true },
  { type: 'Paragraph', label: 'Text (legacy)', styleKind: 'text', screens: ALL, hidden: true },
  {
    type: 'PaymentPlaceholder',
    label: 'Checkout (legacy)',
    styleKind: 'none',
    screens: PAY,
    hidden: true,
  },
];

export const CATALOG: CatalogEntry[] = BASE.map((b) => ({
  ...b,
  category: b.category ?? 'containers',
  hint: b.hint ?? '',
}));

export const CATALOG_BY_TYPE: ReadonlyMap<string, CatalogEntry> = new Map(
  CATALOG.map((e) => [e.type, e]),
);

export function allowedTypesFor(screen: ScreenType): string[] {
  return CATALOG.filter((e) => e.screens.includes(screen)).map((e) => e.type);
}

export interface Preset {
  id: string;
  label: string;
  category: CategoryId;
  type: string;
  props?: Record<string, unknown>;
}

const opts = (labels: string[], extra: (i: number) => Record<string, unknown> = () => ({})) =>
  labels.map((label, i) => ({ id: `option_${i + 1}`, label, ...extra(i) }));

const pulse = { style: { effect: 'pulse' } };

export const PRESETS: Preset[] = [
  { id: 'columns', label: 'Columns', category: 'containers', type: 'Columns' },
  { id: 'rows', label: 'Rows', category: 'containers', type: 'Rows' },
  { id: 'carousel', label: 'Carousel', category: 'containers', type: 'Carousel' },
  { id: 'popup', label: 'Popup', category: 'containers', type: 'Popup' },

  {
    id: 'title',
    label: 'Title (H1)',
    category: 'typography',
    type: 'Text',
    props: { variant: 'title', text: 'Title' },
  },
  {
    id: 'subtitle',
    label: 'Subtitle (H2)',
    category: 'typography',
    type: 'Text',
    props: { variant: 'subtitle', text: 'Subtitle' },
  },
  {
    id: 'text',
    label: 'Text',
    category: 'typography',
    type: 'Text',
    props: { variant: 'paragraph', text: 'Some text' },
  },
  {
    id: 'rich-text',
    label: 'Rich Text',
    category: 'typography',
    type: 'Text',
    props: {
      variant: 'paragraph',
      text: 'Text with **bold**, *italic* and a [link](https://example.com).',
    },
  },
  {
    id: 'numbered-list',
    label: 'Numbered List',
    category: 'typography',
    type: 'List',
    props: { marker: 'number' },
  },
  {
    id: 'bullet-list',
    label: 'Bullet List',
    category: 'typography',
    type: 'List',
    props: { marker: 'bullet' },
  },
  { id: 'divider', label: 'Divider', category: 'typography', type: 'Divider' },

  { id: 'image', label: 'Image', category: 'media', type: 'Image' },
  { id: 'video', label: 'Video', category: 'media', type: 'Video' },
  { id: 'lottie', label: 'Lottie', category: 'media', type: 'Lottie' },
  { id: 'chart', label: 'Chart', category: 'media', type: 'Chart' },
  { id: 'raw-html', label: 'Raw HTML', category: 'media', type: 'RawHtml' },
  { id: 'badge', label: 'Badge', category: 'media', type: 'Badge' },

  {
    id: 'quiz-simple',
    label: 'Simple',
    category: 'quiz',
    type: 'OptionList',
    props: { mode: 'single', layout: 'list', options: opts(['Option 1', 'Option 2', 'Option 3']) },
  },
  {
    id: 'quiz-multi',
    label: 'Multiple Choice',
    category: 'quiz',
    type: 'OptionList',
    props: { mode: 'multi', layout: 'list', options: opts(['Option 1', 'Option 2', 'Option 3']) },
  },
  {
    id: 'quiz-emoji',
    label: 'Emoji',
    category: 'quiz',
    type: 'OptionList',
    props: {
      mode: 'single',
      layout: 'list',
      options: opts(['Option 1', 'Option 2', 'Option 3'], (i) => ({
        emoji: ['🔥', '❤️', '🎁'][i],
      })),
    },
  },
  {
    id: 'quiz-image',
    label: 'Image Picker',
    category: 'quiz',
    type: 'OptionList',
    props: { mode: 'single', layout: 'cards', options: opts(['Option 1', 'Option 2']) },
  },
  {
    id: 'quiz-icons',
    label: 'Icons',
    category: 'quiz',
    type: 'OptionList',
    props: {
      mode: 'single',
      layout: 'grid',
      options: opts(['Morning', 'Afternoon', 'Evening', 'Night'], (i) => ({
        emoji: ['🌅', '☀️', '🌇', '🌙'][i],
      })),
    },
  },
  {
    id: 'quiz-cover',
    label: 'Cover Images',
    category: 'quiz',
    type: 'OptionList',
    props: { mode: 'single', layout: 'cover', options: opts(['Option 1', 'Option 2']) },
  },
  {
    id: 'quiz-rating',
    label: 'Rating',
    category: 'quiz',
    type: 'Rating',
    props: { label: '', variant: 'numbers', max: 5, minLabel: 'Not at all', maxLabel: 'Totally' },
  },
  {
    id: 'quiz-popup',
    label: 'Popup question',
    category: 'quiz',
    type: 'OptionList',
    props: {
      mode: 'single',
      layout: 'popup',
      question: 'Are you ready to start?',
      options: opts(['Yes', 'No']),
    },
  },
  { id: 'slider', label: 'Slider', category: 'quiz', type: 'Slider' },

  {
    id: 'input-text',
    label: 'Text',
    category: 'inputs',
    type: 'TextInput',
    props: { label: 'Your name', placeholder: 'Name', inputType: 'name', unit: '' },
  },
  { id: 'input-date', label: 'Date', category: 'inputs', type: 'DatePicker' },
  {
    id: 'input-number',
    label: 'Number',
    category: 'inputs',
    type: 'TextInput',
    props: { label: 'Your age', placeholder: '30', inputType: 'number', unit: '' },
  },
  {
    id: 'input-phone',
    label: 'Phone',
    category: 'inputs',
    type: 'TextInput',
    props: { label: 'Phone number', placeholder: '+1 555 000 0000', inputType: 'tel', unit: '' },
  },
  { id: 'input-email', label: 'Email', category: 'inputs', type: 'EmailInput' },
  {
    id: 'input-password',
    label: 'Password Input',
    category: 'inputs',
    type: 'TextInput',
    props: {
      label: 'Password',
      placeholder: 'At least 8 characters',
      inputType: 'password',
      unit: '',
    },
  },
  { id: 'checkbox', label: 'Checkbox', category: 'inputs', type: 'Checkbox' },

  { id: 'button', label: 'Button', category: 'buttons', type: 'Button' },
  { id: 'pulse-button', label: 'Pulse Button', category: 'buttons', type: 'Button', props: pulse },
  {
    id: 'countdown-button',
    label: 'Countdown Button',
    category: 'buttons',
    type: 'Button',
    props: { label: 'Get my plan', countdown: 10 },
  },
  { id: 'wallet-button', label: 'Wallet Button', category: 'buttons', type: 'WalletButton' },
  { id: 'oauth-button-b', label: 'OAuth Button', category: 'buttons', type: 'OAuthButton' },

  { id: 'email-form', label: 'Email Form', category: 'auth', type: 'EmailInput' },
  { id: 'email-oauth', label: 'Email + OAuth', category: 'auth', type: 'EmailOAuth' },
  { id: 'oauth-button', label: 'OAuth Button', category: 'auth', type: 'OAuthButton' },
  { id: 'oauth-buttons', label: 'OAuth Buttons', category: 'auth', type: 'OAuthButtons' },

  { id: 'spinner', label: 'Spinner', category: 'loaders', type: 'Spinner' },
  {
    id: 'loading-text',
    label: 'Loading Text',
    category: 'loaders',
    type: 'Spinner',
    props: { variant: 'dots', text: 'Analyzing your answers' },
  },
  { id: 'loader', label: 'Loader', category: 'loaders', type: 'Loader' },
  {
    id: 'loader-circular',
    label: 'Loader Circular',
    category: 'loaders',
    type: 'Loader',
    props: { variant: 'circle' },
  },
  {
    id: 'loader-set',
    label: 'Loader Set',
    category: 'loaders',
    type: 'Processing',
    props: { variant: 'bars' },
  },
  {
    id: 'loaders-popup',
    label: 'Loaders + Popup',
    category: 'loaders',
    type: 'Processing',
    props: { variant: 'bars', question: 'Do you usually eat late at night?' },
  },

  {
    id: 'billing-picker',
    label: 'Billing Plan Picker',
    category: 'paywall',
    type: 'BillingPlanPicker',
  },
  {
    id: 'plans-composite',
    label: 'Subscription Plan Picker (composite)',
    category: 'paywall',
    type: 'PlanPickerComposite',
  },
  {
    id: 'plans-simple',
    label: 'Subscription Plan Picker (simple)',
    category: 'paywall',
    type: 'PlanPicker',
  },
  { id: 'trial-picker', label: 'Trial Price Picker', category: 'paywall', type: 'TrialPicker' },
  { id: 'checkout', label: 'Checkout', category: 'paywall', type: 'CheckoutBlock' },
  { id: 'wallet', label: 'Wallet Button', category: 'paywall', type: 'WalletButton' },
  { id: 'totals', label: 'Totals', category: 'paywall', type: 'Totals' },
  {
    id: 'limited-offer',
    label: 'Limited Offer',
    category: 'paywall',
    type: 'Timer',
    props: { variant: 'pill', label: 'Offer ends in' },
  },
  { id: 'price-card', label: 'Price Card', category: 'paywall', type: 'PriceCard' },
  { id: 'customers-p', label: 'Customer Carousel', category: 'paywall', type: 'CustomerCarousel' },
  { id: 'faq-p', label: 'FAQ', category: 'paywall', type: 'Faq' },
  {
    id: 'review-p',
    label: 'Review',
    category: 'paywall',
    type: 'Reviews',
    props: {
      layout: 'list',
      items: [
        {
          name: 'Emma',
          rating: 5,
          text: 'Down 6 kg in two months without feeling hungry.',
          avatar: '',
        },
      ],
    },
  },

  {
    id: 'countdown-button-e',
    label: 'Countdown Button',
    category: 'engagement',
    type: 'Button',
    props: { label: 'Get my plan', countdown: 10 },
  },
  {
    id: 'countdown-timer-button',
    label: 'Countdown Timer with Button',
    category: 'engagement',
    type: 'Timer',
    props: { variant: 'button', label: 'Discount reserved for', buttonLabel: 'Get my plan' },
  },
  { id: 'customers', label: 'Customer Carousel', category: 'engagement', type: 'CustomerCarousel' },
  {
    id: 'review',
    label: 'Review',
    category: 'engagement',
    type: 'Reviews',
    props: {
      layout: 'list',
      items: [
        {
          name: 'Emma',
          rating: 5,
          text: 'Down 6 kg in two months without feeling hungry.',
          avatar: '',
        },
      ],
    },
  },
  {
    id: 'reviews-carousel',
    label: 'Reviews Carousel',
    category: 'engagement',
    type: 'Reviews',
    props: { layout: 'carousel' },
  },
  { id: 'faq', label: 'FAQ', category: 'engagement', type: 'Faq' },
  { id: 'cookie', label: 'Cookie Consent', category: 'engagement', type: 'CookieConsent' },
  { id: 'result-summary', label: 'Result Summary', category: 'engagement', type: 'ResultSummary' },
  { id: 'timer', label: 'Timer', category: 'engagement', type: 'Timer' },
];

export const PRESETS_BY_ID: ReadonlyMap<string, Preset> = new Map(PRESETS.map((p) => [p.id, p]));

export const SLOT_CHILDREN = [
  'Text',
  'Heading',
  'Paragraph',
  'List',
  'Faq',
  'Divider',
  'Image',
  'Video',
  'Lottie',
  'Chart',
  'Badge',
  'Button',
  'Rows',
  'Columns',
  'Reviews',
  'Timer',
  'Spinner',
];

export { PLAN_PICKER_TYPES } from './element-schemas';
