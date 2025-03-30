import React from "react";
import "./globals.css";
import { Poppins } from "next/font/google";
// import { Analytics } from "@vercel/analytics/next";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  style: "normal",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false, // Prevents hydration mismatch
});

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
  themeColor: "#000000",
};

export const metadata = {
  title: "Thevaluechain",
  description: "Thevaluechain live news & streaming app",
  keywords: "live news, streaming, Thevaluechain, breaking news, latest news updates",
  author: "Thevaluechain Team",
  robots: "index, follow",
  og: {
    title: "Thevaluechain Live News & Streaming",
    description: "Stay updated with TheValueChain live news & streaming service.",
    type: "website",
    url: "https://thevaluechainng.com",
    image: "/img/VC-2023.jpg",
    site_name: "TheValueChain",
  },
  twitter: {
    card: "summary_large_image",
    title: "Thevaluechain Live News & Streaming",
    description: "Watch live news and stay informed with Thevaluechain streaming service.",
    image: "/img/VC-2023.jpg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.className}>
      <head>
        <meta charSet="utf-8" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Valuechain" />
        <meta name="title" content={metadata.title} />
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords} />
        <meta name="author" content={metadata.author} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content={metadata.robots} />
        <meta property="og:title" content={metadata.og.title} />
        <meta property="og:description" content={metadata.og.description} />
        <meta property="og:type" content={metadata.og.type} />
        <meta property="og:url" content={metadata.og.url} />
        <meta property="og:image" content={metadata.og.image} />
        <meta property="og:site_name" content={metadata.og.site_name} />
        <meta name="twitter:card" content={metadata.twitter.card} />
        <meta name="twitter:title" content={metadata.twitter.title} />
        <meta name="twitter:description" content={metadata.twitter.description} />
        <meta name="twitter:image" content={metadata.twitter.image} />
        <link rel="apple-touch-icon" href="/web-app-manifest-192x192.png" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" href="/apple-icon.png" />
        <link rel="android-chrome" href="/web-app-manifest-512x512.png" />
      </head>
      <body className="bg-gray-50/90 dark:bg-slate-900">
        {/* <Analytics /> */}
        {children}
      </body>
    </html>
  );
}
