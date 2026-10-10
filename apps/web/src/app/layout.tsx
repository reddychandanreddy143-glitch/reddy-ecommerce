import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '../lib/providers';

export const metadata: Metadata = {
  title: 'Reddy E-Commerce',
  description: 'Modern Full-Stack E-Commerce Experience',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}