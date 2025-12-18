"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

export default function MobileRedirect() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true

    // Already on correct route → do nothing
    if (isStandalone && pathname === "/mobile") return
    if (!isStandalone && pathname === "/") return

    if (isStandalone) {
      router.replace("/mobile")
    } else {
      router.replace("/")
    }
  }, [router, pathname])

  return null
}
