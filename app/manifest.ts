import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Ziada POS',
    short_name: 'Ziada',
    description: 'Retail operating system for East African traders',
    start_url: '/dashboard',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0f0f10',
    theme_color: '#4f46e5',
    categories: ['business', 'finance', 'productivity'],
    icons: [
      { src: '/icons/icon-48x48.png',   sizes: '48x48',   type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-72x72.png',   sizes: '72x72',   type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-96x96.png',   sizes: '96x96',   type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon-384x384.png', sizes: '384x384', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      {
        name: 'Point of Sale',
        short_name: 'POS',
        url: '/pos',
        icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }],
      },
      {
        name: 'Dashboard',
        short_name: 'Dashboard',
        url: '/dashboard',
        icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }],
      },
    ],
  };
}
