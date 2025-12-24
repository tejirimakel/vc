"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useAppReady } from "@/components/AppReadyProvider"

export default function SplashScreen({ onComplete }) {
  const appReady = useAppReady()
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    // Only set when app loads normally
    if (!localStorage.getItem('app_access')) {
      localStorage.setItem('app_access', 'true');
    }
  }, []);
  

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true

    const isMobile =
      /iphone|ipad|ipod|android/i.test(navigator.userAgent)

    const alreadyShown = sessionStorage.getItem("pwa-splash-shown")

    if (!isStandalone || !isMobile || alreadyShown) {
      setVisible(false)
      onComplete && onComplete()
      return
    }

    if (appReady) {
      sessionStorage.setItem("pwa-splash-shown", "true")

      // Start fade-out
      setFading(true)

      const timer = setTimeout(() => {
        setVisible(false)
        onComplete && onComplete()
      }, 600) // must match CSS duration

      return () => clearTimeout(timer)
    }
  }, [appReady, onComplete])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-neutral-50 dark:bg-neutral-950
      transition-opacity duration-500
      ${fading ? "opacity-0" : "opacity-100"}`}
    >
      <Image
        src="/VC-2023.jpg"
        width={200}
        height={200}
        alt="Thevaluechain App Logo"
        priority
        className="animate-pulse motion-reduce:animate-none"
      />
    </div>
  )
}
