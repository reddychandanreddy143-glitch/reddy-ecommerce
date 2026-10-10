import React from 'react';
import { Navbar } from '../../components/layout/Navbar';

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        © 2026 Reddy E-Commerce. Built with NestJS, PostgreSQL & Next.js.
      </footer>
    </div>
  );
}