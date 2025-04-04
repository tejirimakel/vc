const { optimizeImage } = require('next/dist/server/image-optimizer');

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
  webpack: (config) => {
    config.module.rules.push({
      test: /pdf\.worker\.(min\.)?js/,
      use: "file-loader",
    });

    return config;
  },
  experimental: {
    turbo: {
      enabled: true,
      streaming: true,
      strategy: "async-dom",
      ssr: false,
      minify: true,
      optimizeImage: true,
    },
  },
};

module.exports = withPWA(nextConfig);
