"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { isInstalledPwa } from "@/lib/pwaDisplayMode"
import { requestPwaAccess } from "@/lib/pwaClient"

export default function MobileRedirect() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    let cancelled = false

    const installedPwa = isInstalledPwa()

    if (!installedPwa && pathname === "/") return

    if (installedPwa) {
      requestPwaAccess("standalone")
        .then(() => {
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
