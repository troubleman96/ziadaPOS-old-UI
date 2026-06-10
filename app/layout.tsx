import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Ziada',
  description: 'Retail operating system for East African traders. Manage sales, inventory, customers and credits from one place.',
  applicationName: 'Ziada',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.ziadapos.com'),
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Ziada',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [
      { url: '/ziadaposicon.jpeg', sizes: '1080x1080', type: 'image/jpeg' },
    ],
    apple: [
      { url: '/ziadaposicon.jpeg', sizes: '1080x1080', type: 'image/jpeg' },
    ],
    shortcut: '/ziadaposicon.jpeg',
  },
  openGraph: {
    type: 'website',
    title: 'Ziada',
    description: 'Retail operating system for East African traders.',
    siteName: 'Ziada',
    images: [{ url: '/ziadaposicon.jpeg', width: 1200, height: 1200, alt: 'Ziada' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ziada',
    description: 'Retail operating system for East African traders.',
    images: ['/ziadaposicon.jpeg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        {/* Theme initialiser — runs before paint to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('ziada-theme');document.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light');}catch(e){}})();`,
          }}
        />
        {/* Service worker registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js');})}`,
          }}
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileImage" content="/ziadaposicon.jpeg" />
        <meta name="msapplication-TileColor" content="#4f46e5" />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
