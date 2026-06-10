import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Ziada POS — Talk to the Team in Tanzania',
  description:
    'Get in touch with the Ziada team in Dar es Salaam. WhatsApp, email, or phone — we respond fast. Demo requests, sales inquiries, and support.',
  alternates: { canonical: 'https://www.ziadapos.com/contact' },
  openGraph: {
    title: 'Contact Ziada POS — We Respond Fast',
    description: 'WhatsApp, email or phone. Dar es Salaam-based team, available for demos, sales and support.',
    url: 'https://www.ziadapos.com/contact',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
