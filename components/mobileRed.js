"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

export default function MobileRedirect() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    let cancelled = false

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true

    if (!isStandalone && pathname === "/") return

    if (isStandalone) {
      fetch("/api/pwa/access", {
        method: "POST",
        headers: { "x-tvc-pwa-launch": "standalone" },
      })
        .then((response) => {
          if (!response.ok) throw new Error("PWA access failed")
          if (!cancelled && pathname !== "/mobile") router.replace("/mobile")
        })
        .catch((error) => {
          console.error("PWA access failed:", error)
          if (!cancelled && pathname !== "/") router.replace("/")
        })
    } else {
      router.replace("/")
    }

    return () => {
      cancelled = true
    }
  }, [router, pathname])

  return null
}
