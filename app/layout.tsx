import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.ziadapos.com';

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: 'Ziada POS — Point of Sale & Retail Management System for Tanzania',
    template: '%s | Ziada POS Tanzania',
  },
  description:
    "Tanzania's leading Point of Sale (POS) and retail management platform. Ring up sales, track inventory, manage customer credit, and get AI-powered insights — all offline-first. Supports M-Pesa, Tigo Pesa, Airtel Money. Built in Dar es Salaam for East African traders and dukas.",

  keywords: [
    'POS Tanzania', 'point of sale Tanzania', 'duka software', 'retail POS Tanzania',
    'M-Pesa POS system', 'inventory management Tanzania', 'credit management duka',
    'biashara software Tanzania', 'Ziada POS', 'retail management Tanzania',
    'offline POS Tanzania', 'AI retail assistant Tanzania', 'supermarket software Tanzania',
    'duka management system', 'East Africa retail software', 'Tanzania retail technology',
    'mfumo wa biashara', 'mauzo Tanzania', 'hifadhi ya bidhaa Tanzania',
    'POS system Dar es Salaam', 'POS Arusha', 'POS Mwanza',
    'retail software East Africa', 'small business POS Africa',
  ],

  applicationName: 'Ziada',
  authors: [{ name: 'Ziada Technologies Ltd', url: SITE_URL }],
  creator: 'Ziada Technologies Ltd',
  publisher: 'Ziada Technologies Ltd',
  category: 'Business Software',

  alternates: {
    canonical: SITE_URL,
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  icons: {
    icon: [{ url: '/ziada-app.PNG', sizes: '512x512', type: 'image/png' }],
    apple: [{ url: '/ziada-app.PNG', sizes: '512x512', type: 'image/png' }],
    shortcut: '/ziada-app.PNG',
  },

  manifest: '/manifest.webmanifest',

  appleWebApp: {
    capable: true,
    title: 'Ziada',
    statusBarStyle: 'black-translucent',
  },

  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: 'Ziada POS — Point of Sale & Retail Management for Tanzania',
    description:
      "Tanzania's #1 POS platform. Sales, inventory, credits, AI assistant. Works offline. Supports M-Pesa, Tigo, Airtel. Trusted by 1,247+ stores.",
    siteName: 'Ziada POS',
    locale: 'en_TZ',
    images: [{ url: '/ziada-app.PNG', width: 1200, height: 1200, alt: 'Ziada POS — Retail Management System Tanzania' }],
  },

  twitter: {
    card: 'summary_large_image',
    site: '@ziadapos',
    creator: '@ziadapos',
    title: 'Ziada POS — Retail Management System for Tanzania',
    description:
      "Tanzania's #1 POS. Sales, inventory, credits & AI — offline-first. M-Pesa · Tigo · Airtel. 1,247+ stores.",
    images: ['/ziada-app.PNG'],
  },
};

const GTAG_ID = 'G-36RDC9JCFY';

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Ziada Technologies Ltd',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/ziada-app.PNG`,
        width: 512,
        height: 512,
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+255-692-069-230',
        contactType: 'customer support',
        areaServed: 'TZ',
        availableLanguage: ['Swahili', 'English'],
      },
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Dar es Salaam',
        addressCountry: 'TZ',
      },
      sameAs: ['https://wa.me/255692069230'],
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${SITE_URL}/#app`,
      name: 'Ziada POS',
      alternateName: 'Ziada Retail OS',
      applicationCategory: 'BusinessApplication',
      applicationSubCategory: 'Point of Sale',
      operatingSystem: 'Web, PWA, Android, iOS',
      url: SITE_URL,
      description:
        "Tanzania's leading point-of-sale and retail management platform. Supports offline-first operation, M-Pesa, Tigo Pesa, Airtel Money, multi-store management, AI-powered insights, credit tracking, inventory management, and analytics.",
      inLanguage: ['sw', 'en'],
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'TZS',
        lowPrice: '25000',
        highPrice: '150000',
        offerCount: '3',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        reviewCount: '1247',
        bestRating: '5',
      },
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Ziada POS',
      description: 'Retail operating system for East African traders.',
      publisher: { '@id': `${SITE_URL}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/?s={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
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
        {/* Service worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js');})}`,
          }}
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileImage" content="/ziada-app.PNG" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="geo.region" content="TZ" />
        <meta name="geo.placename" content="Dar es Salaam, Tanzania" />
        <meta name="language" content="English, Swahili" />
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable}`}>
        {children}
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GTAG_ID}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GTAG_ID}', { page_path: window.location.pathname });
          `}
        </Script>
      </body>
    </html>
  );
}
