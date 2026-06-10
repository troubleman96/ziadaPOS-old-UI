import type { Metadata } from 'next';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { LangProvider } from '@/components/LangContext';

export const metadata: Metadata = {
  title: {
    default: 'Ziada POS — Point of Sale & Retail Management System for Tanzania',
    template: '%s | Ziada POS Tanzania',
  },
  description:
    "Tanzania's leading POS and retail management platform. Manage sales, inventory, customer credit and get AI insights — offline-first. Supports M-Pesa, Tigo Pesa, Airtel Money. Built in Dar es Salaam for East African dukas and retail chains.",
  alternates: {
    canonical: 'https://www.ziadapos.com',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.ziadapos.com',
    siteName: 'Ziada POS',
    locale: 'en_TZ',
    images: [{ url: '/ziada-final.jpeg', width: 1200, height: 1200, alt: 'Ziada POS — Retail Management Tanzania' }],
  },
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <LangProvider>
      <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--fg)', fontFamily: 'var(--sans)', WebkitFontSmoothing: 'antialiased' as const }}>
        <MarketingNav />
        <main>{children}</main>
        <MarketingFooter />
      </div>
    </LangProvider>
  );
}
