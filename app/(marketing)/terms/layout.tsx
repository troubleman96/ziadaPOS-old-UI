import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — Ziada POS',
  description: 'Ziada Technologies Ltd terms of service. Governing law: United Republic of Tanzania. No lock-in contracts — cancel anytime from Settings → Billing.',
  alternates: { canonical: 'https://www.ziadapos.com/terms' },
  robots: { index: true, follow: false },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
