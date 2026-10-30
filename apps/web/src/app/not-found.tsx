import Link from 'next/link';

export default function NotFound() {
  return (
    <main style={{ padding: '3rem 1rem', textAlign: 'center' }}>
      <h1>Not found</h1>
      <p>This funnel does not exist or has not been published yet.</p>
      <Link href="/studio">Go to studio</Link>
    </main>
  );
}
