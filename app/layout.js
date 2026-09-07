import React from "react";
import "./globals.css";
import { Poppins } from "next/font/google";
import ServiceWorkerRegistration from "@/components/swRegister";
import { ConsentProvider } from "@/components/consent/ConsentProvider";
import CookieBanner from "@/components/consent/CookieBanner";
import NetworkStatus from "@/components/networkStatus";
import ChunkErrorGuard from "@/components/chunkErrorGuard";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  style: "normal",
  subsets: ["latin"],
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
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
      <body className="bg-gray-50 dark:bg-neutral-950 antialiased">
        <ChunkErrorGuard />
        <ServiceWorkerRegistration />
        <NetworkStatus />
        <ConsentProvider>
          {children}
          <CookieBanner />
        </ConsentProvider>
      </body>
    </html>
  );
}
