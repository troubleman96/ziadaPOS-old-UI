import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Ziada — Built in Tanzania for East African Retail',
  description:
    'Ziada Technologies Ltd is building the retail operating system for East Africa. Founded in Dar es Salaam, our mission is to give every duka — from a roadside kiosk to a multi-branch chain — the tools to thrive.',
  alternates: { canonical: 'https://www.ziadapos.com/about' },
  openGraph: {
    title: 'About Ziada POS — Built in Dar es Salaam for East African Traders',
    description: 'Our mission: give every duka the tools to thrive. POS, inventory, credit, AI — one calm platform.',
    url: 'https://www.ziadapos.com/about',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
