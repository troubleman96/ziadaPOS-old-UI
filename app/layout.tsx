import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

export const metadata: Metadata = {
  title: 'Ziada — Duka Kuu',
  description: 'Retail operating system for East African traders. Manage sales, inventory, customers and credits from one place.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  icons: {
    icon: [
      { url: '/ziada.PNG', type: 'image/png' },
    ],
    apple: [
      { url: '/ziada.PNG', type: 'image/png' },
    ],
    shortcut: '/ziada.PNG',
  },
  openGraph: {
    type: 'website',
    title: 'Ziada — Duka Kuu',
    description: 'Retail operating system for East African traders.',
    siteName: 'Ziada',
    images: [
      {
        url: '/ziada.PNG',
        width: 1200,
        height: 1200,
        alt: 'Ziada — retail operating system',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ziada — Duka Kuu',
    description: 'Retail operating system for East African traders.',
    images: ['/ziada.PNG'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        {/* Theme initialiser — runs synchronously before paint to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('ziada-theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${geist.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
