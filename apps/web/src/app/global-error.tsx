'use client';

export default function GlobalError({ retry }: { error: Error; retry: () => void }) {
  return (
    <html lang="en">
      <body>
        <main style={{ padding: '3rem 1rem', textAlign: 'center' }} role="alert">
          <h1>Something went wrong</h1>
          <button type="button" onClick={retry}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
