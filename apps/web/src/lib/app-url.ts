export function requireAppUrlInProduction(): void {
  if (process.env.NODE_ENV === 'production' && !process.env.APP_URL) {
    throw new Error(
      'APP_URL must be set in production (public origin used for payment return URLs).',
    );
  }
}
