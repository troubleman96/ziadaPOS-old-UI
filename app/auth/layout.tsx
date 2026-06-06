/**
 * app/auth/layout.tsx
 *
 * Standalone layout for public auth pages (login, register).
 * No AppShell, no sidenav — bare HTML with theme support.
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ziada — Sign in',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
