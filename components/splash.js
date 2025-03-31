"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function SplashScreen({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete(); // Notify parent when animation completes
    }, 3000); // Show splash for 3 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-white dark:bg-black transition-opacity duration-700 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <Image
        src="/VC-2023.jpg" // Update to your logo path
        width={200}
        height={200}
        alt="App Logo"
        className="animate-pulse"
      />
    </div>
  );
}
