"use client";
import { useEffect, useState } from "react";
import InstallPrompt from "@/components/prompt";
import MobileRedirect from "@/components/mobileRed";
import { IoDownload } from "react-icons/io5"; // Download icon
import Image from "next/image"; // For any illustrative images

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Treat screens below 768px as mobile
    };

    handleResize(); // Check on mount
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-white">

      {/* 📱 Mobile View */}
      {isMobile ? (
        <div className="container mx-auto py-8">
          <h1 className="text-3xl font-bold text-center mb-4">Welcome to the Valuechain news & streaming app</h1>
          <p className="text-center">
          Get instant access without needing to visit the website every time. Just follow these steps:
          </p>
          <div className="max-w-3xl mx-auto grid gap-6 sm:grid-cols-3">
            {/* Step 1: Open in Browser */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <Image
                src="/vc-2023.jpg"
                alt="Open in browser"
                width={100}
                height={100}
                className="mx-auto"
              />
              <h2 className="text-xl font-semibold mt-2">Step 1</h2>
              <p>Open this website in Chrome or Edge.</p>
            </div>

            {/* Step 2: Click Install */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <Image
                src="/vc-2023.jpg"
                alt="Install Button"
                width={100}
                height={100}
                className="mx-auto"
              />
              <h2 className="text-xl font-semibold mt-2">Step 2</h2>
              <p>Look for the Install button in the address bar.</p>
            </div>

            {/* Step 3: Enjoy */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <IoDownload className="text-gray-300 w-12 h-12 mx-auto" />
              <h2 className="text-xl font-semibold mt-2">Step 3</h2>
              <p>Tap Install and enjoy seamless browsing!</p>
            </div>
          </div>
          <MobileRedirect />
          <InstallPrompt />
        </div>
      ) : (
        /* 💻 Desktop View */
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl font-bold mb-6">Install Our PWA for a Better Experience!</h1>
          <p className="mb-8 text-lg">
            Get instant access without needing to visit the website every time. Just follow these steps:
          </p>

          <div className="max-w-3xl mx-auto grid gap-6 sm:grid-cols-3">
            {/* Step 1: Open in Browser */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <Image
                src="/vc-2023.jpg"
                alt="Open in browser"
                width={100}
                height={100}
                className="mx-auto"
              />
              <h2 className="text-xl font-semibold mt-2">Step 1</h2>
              <p>Open this website in Chrome or Edge.</p>
            </div>

            {/* Step 2: Click Install */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <Image
                src="/vc-2023.jpg"
                alt="Install Button"
                width={100}
                height={100}
                className="mx-auto"
              />
              <h2 className="text-xl font-semibold mt-2">Step 2</h2>
              <p>Look for the Install button in the address bar.</p>
            </div>

            {/* Step 3: Enjoy */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <IoDownload className="text-gray-300 w-12 h-12 mx-auto" />
              <h2 className="text-xl font-semibold mt-2">Step 3</h2>
              <p>Tap Install and enjoy seamless browsing!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
