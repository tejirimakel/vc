/** @type {import('next').NextConfig} */

const appCSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https: blob:",
  "media-src 'self' blob: https:",
  "connect-src 'self' https://thevaluechainng.com https://www.thevaluechainng.com https://www.youtube.com",
  "frame-src https://www.youtube.com https://youtube.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
].join('; ');

const swCSP = [
  "default-src 'self'",
  "script-src 'self'",
  "connect-src 'self' https://thevaluechainng.com https://www.thevaluechainng.com",
  "img-src 'self' data: https:",
  "style-src 'self' 'unsafe-inline'",
].join('; ');

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "thevaluechainng.com" },
      { protocol: "https", hostname: "www.thevaluechainng.com" },
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /pdf\.worker\.(min\.)?js$/,
      type: 'asset/resource',
    });
    config.resolve.extensions.push('.mjs');
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Content-Security-Policy', value: appCSP },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Content-Security-Policy', value: swCSP },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
