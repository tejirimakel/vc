/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  swSrc: "service-worker.js",
});

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
};

module.exports = withPWA(nextConfig);
