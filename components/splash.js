"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function SplashScreen({ onComplete }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Function to detect if running as a PWA (standalone mode)
    const isPWAStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone;

    // Function to detect if the device is mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isPWAStandalone && isMobile) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete(); // Notify parent when animation completes
      }, 5000); // Show splash for 3 seconds

      return () => clearTimeout(timer);
    } else {
      onComplete(); // Skip splash if not standalone/mobile
    }
  }, [onComplete]);

  if (!isVisible) return null; // Hide if not visible

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-inherit transition-opacity duration-700 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <Image
        src="/VC-2023.jpg" 
        width={200}
        height={200}
        alt="App Logo"
        className="animate-pulse"
      />
    </div>
  );
}
