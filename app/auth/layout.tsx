/**
 * app/auth/layout.tsx
 *
 * Standalone layout for public auth pages (login, register).
 * No AppShell, no sidenav — bare HTML with theme support.
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Sign in — Ziada POS',
    template: '%s | Ziada POS',
  },
  description: 'Sign in to your Ziada POS account. Manage your duka from anywhere — sales, inventory, credits and AI insights.',
  robots: { index: true, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
