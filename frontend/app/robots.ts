import type { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kaamkaaj.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow:     '/',
        disallow: [
          '/dashboard/',
          '/employer/',
          '/api/',
          '/auth/',
          '/forgot-password',
          '/update-password',
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
