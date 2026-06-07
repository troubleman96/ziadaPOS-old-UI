import type { Metadata } from 'next';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { LangProvider } from '@/components/LangContext';

export const metadata: Metadata = {
  title: {
    template: '%s · Ziada',
    default: 'Ziada — The operating system for your shop',
  },
  description:
    'POS, inventory, credit, analytics and an AI that knows your store. Works offline. Built in Tanzania for East African retail.',
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
