import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing — Ziada POS Plans & Packages for Tanzania',
  description:
    'Simple, honest pricing billed in TZS. Starter from TZS 25,000/month — includes POS, inventory, and credit tracking. Business and Enterprise plans for growing retail chains. 7-day free trial, no credit card needed.',
  alternates: { canonical: 'https://www.ziadapos.com/pricing' },
  openGraph: {
    title: 'Ziada POS Pricing — Plans from TZS 25,000/month',
    description: 'Affordable POS plans billed in TZS. 7-day free trial · No card · M-Pesa · Tigo · Airtel.',
    url: 'https://www.ziadapos.com/pricing',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
