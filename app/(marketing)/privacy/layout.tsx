import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — Ziada POS',
  description: 'Ziada Technologies Ltd privacy policy. Your sales, customer and stock data is never used to train AI models. Data stored in Tanzania, encrypted at rest and in transit.',
  alternates: { canonical: 'https://www.ziadapos.com/privacy' },
  robots: { index: true, follow: false },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
