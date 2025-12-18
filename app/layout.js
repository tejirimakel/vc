import React from "react";
import "./globals.css";
import { Poppins } from "next/font/google";
import { AppReadyProvider } from "@/components/appReady";
// import { Analytics } from "@vercel/analytics/next";
// import { SpeedInsights } from '@vercel/speed-insights/next';

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  style: "normal",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false, // Prevents hydration mismatch
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const bodyColor = {
  light: "bg-gray-50",
  dark: "bg-neutral-950",
};

export const metadata = {
  title: "Thevaluechain",
  description: "Thevaluechain live news & streaming app",
  manifest: "/manifest.json",
  keywords: [
    "live news",
    "streaming",
    "Thevaluechain",
    "breaking news",
    "latest news updates",
  ],
  authors: [{ name: "Thevaluechain Team" }],
  robots: "index, follow",

  metadataBase: new URL("https://thevaluechainng.com"),

  openGraph: {
    title: "Thevaluechain Live News & Streaming",
    description:
      "Stay updated with TheValueChain live news & streaming service.",
    url: "https://thevaluechainng.com",
    siteName: "TheValueChain",
    images: [
      {
        url: "/VC-2023.jpg", 
        width: 1200,
        height: 630,
        alt: "TheValueChain",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Thevaluechain Live News & Streaming",
    description:
      "Watch live news and stay informed with Thevaluechain streaming service.",
    images: ["/VC-2023.jpg"],
  },
};



export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${poppins.className} antialiased`}>
      <body className={`${bodyColor.light} dark:${bodyColor.dark} antialiased`}>
        {/* <Analytics /> */}
        <AppReadyProvider>{children}</AppReadyProvider>
        {/* <SpeedInsights /> */}
      </body>
    </html>
  );
}
