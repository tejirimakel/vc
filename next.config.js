/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  swSrc: "sw.js",
  fallbacks: {
    document: '/offline',
  },
});

const headers = async () => [
  {
    // Global security headers
    source: '/(.*)',
    headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      { key: 'X-DNS-Prefetch-Control', value: 'on' },
    ],
  },
  {
    // Service worker headers
    source: '/service-worker.js',
    headers: [
      { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
      { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
      { key: 'Content-Security-Policy', value: `
        default-src 'self';
        script-src 'self' 'unsafe-eval';
        connect-src 'self' https://thevaluechainng.com https://www.thevaluechainng.com;
        img-src 'self' data: https:;
        style-src 'self' 'unsafe-inline';
      `.replace(/\s{2,}/g, ' ').trim(),
    },
    ],
  },
];

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "thevaluechainng.com",
      },
      {
        protocol: "https",
        hostname: "www.thevaluechainng.com",
      },
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /pdf\.worker\.(min\.)?js$/,
      use: {
        loader: 'file-loader',
      },
    });
    config.resolve.extensions.push('.mjs');
    return config;
  },
  headers,
};

module.exports = withPWA(nextConfig);
