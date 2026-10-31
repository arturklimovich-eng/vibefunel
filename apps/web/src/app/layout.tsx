import type { Metadata, Viewport } from 'next';
import { connection } from 'next/server';
import type { ReactNode } from 'react';
import './globals.css';

const ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23111827'/%3E%3Cpath d='M8 9h16l-6 8v6l-4 2v-8z' fill='%23fff'/%3E%3C/svg%3E";

export const metadata: Metadata = { title: 'Funnel Platform', icons: { icon: ICON } };
export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default async function RootLayout({ children }: { children: ReactNode }) {
  await connection();
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
