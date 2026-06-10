import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/pricing', '/about', '/contact', '/privacy', '/terms', '/auth/login', '/auth/register'],
        disallow: [
          '/dashboard', '/pos', '/inventory', '/transactions', '/customers',
          '/credits', '/stores', '/suppliers', '/analytics', '/reports',
          '/settings', '/ai', '/staff', '/notebook', '/help', '/activate', '/api/',
        ],
      },
    ],
    sitemap: 'https://www.ziadapos.com/sitemap.xml',
    host: 'https://www.ziadapos.com',
  };
}
