"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MobileRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Check if the app is running as a PWA
    if (window.matchMedia("(display-mode: standalone)").matches) {
      router.push("/mobile"); // Redirect to the mobile-optimized page
    }
  }, [router]);

  return null; // No UI rendered for this component
}
