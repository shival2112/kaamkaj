/** @type {import('next').NextConfig} */
const nextConfig = {
  // In development only: tell browsers and Next.js internal cache never to
  // serve stale responses. Has no effect in production (NODE_ENV === 'production').
  ...(process.env.NODE_ENV === 'development' && {
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
            { key: 'Pragma',        value: 'no-cache' },
            { key: 'Expires',       value: '0' },
          ],
        },
      ];
    },
  }),
};

export default nextConfig;
