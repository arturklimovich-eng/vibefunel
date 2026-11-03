'use client';

import { useEffect } from 'react';

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error.message);
  }, [error]);
  return (
    <main style={{ padding: '3rem 1rem', textAlign: 'center' }} role="alert">
      <h1>Something went wrong</h1>
      <p>An unexpected error occurred. Please try again.</p>
      {error.digest ? <p>Error reference: {error.digest}</p> : null}
      <button type="button" onClick={retry}>
        Try again
      </button>
    </main>
  );
}
