import type { Metadata } from 'next';
import { LangProvider } from '@/components/LangContext';

export const metadata: Metadata = {
  title: {
    default: 'Sign in — Ziada POS',
    template: '%s | Ziada POS',
  },
  description: 'Sign in to your Ziada POS account. Manage your duka from anywhere — sales, inventory, credits and AI insights.',
  robots: { index: true, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <LangProvider>{children}</LangProvider>;
}
