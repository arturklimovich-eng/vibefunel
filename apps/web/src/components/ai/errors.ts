export const ERROR_TEXT: Record<string, string> = {
  ai_not_configured: 'AI generation is not configured on this server.',
  budget_exhausted: 'The daily AI budget for this project is used up. Try again tomorrow.',
  rate_limited: 'Too many AI requests. Wait a little and try again.',
  quota_exhausted:
    'The AI provider quota for this key is used up. Check the plan and billing of the API key.',
  refusal: 'The model declined this request. Rephrase it and try again.',
  invalid_output: 'The model returned something unusable. Try again.',
  truncated: 'The answer was cut off. Try a smaller request.',
  provider_error: 'The AI provider is not responding. Try again later.',
};

export function errorText(code: string, fallback?: string): string {
  return ERROR_TEXT[code] ?? fallback ?? `Request failed (${code}).`;
}
