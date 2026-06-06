import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Ziada',
    short_name: 'Ziada',
    description: 'Retail operating system for East African traders',
    start_url: '/dashboard',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0f0f10',
    theme_color: '#4f46e5',
    categories: ['business', 'finance', 'productivity'],
    icons: [
      { src: '/ziadaposicon.jpeg', sizes: '1080x1080', type: 'image/jpeg', purpose: 'maskable' },
    ],
    shortcuts: [
      {
        name: 'Point of Sale',
        short_name: 'POS',
        url: '/pos',
        icons: [{ src: '/ziadaposicon.jpeg', sizes: '1080x1080', type: 'image/jpeg' }],
      },
      {
        name: 'Dashboard',
        short_name: 'Dashboard',
        url: '/dashboard',
        icons: [{ src: '/ziadaposicon.jpeg', sizes: '1080x1080', type: 'image/jpeg' }],
      },
    ],
  };
}
