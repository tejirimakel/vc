"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MobileRedirect() {
  const router = useRouter();

  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

    if (isStandalone) {
      router.replace("/mobile"); // Redirect to mobile PWA view
    } else {
      router.replace("/"); // Ensure browser users stay on main index page
    }
  }, [router]);

  return null; // No UI rendered for this component
}
