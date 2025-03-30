/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  swSrc: "service-worker.js",
});

const nextConfig = {
  reactStrictMode: true, // Enable strict mode for React
  images: {
    remotePatterns:[
      {
        protocol: 'https',
        hostname: 'thevaluechainng.com',
    
      },
      {
        protocol: 'https',
        hostname: 'www.thevaluechainng.com',
       
      },
    ]
  },
  experimental: {
    turbo:{
      enabled: true,
      streaming: true,
      strategy: 'async-dom',
      ssr: false,
      minify: true,
      lazy: true,
      prefetch: true,
      optimizeImages: true,
      optimizeCss: true,
      optimizeFonts: true,
      minifyHtml: true,
      minifyJs: true,
      minifyJson: true,
      minifySvg: true,
      minifyCSS: true,
      minifyUrls: true,
      minifyManifest: true,
      minifyWebManifest: true,
      minifyPreload: true,
      minifyServiceWorker: true,
      minifyWorker: true,
      minifyStreaming: true,
      minifyPwaManifest: true,
      minifyPwaUpdateManifest: true,
      minifyPwaIcons: true,
      minifyPwaSplashScreen: true,
      minifyPwaSplashScreenIos: true,
    } 
},
};

module.exports = withPWA(nextConfig);
