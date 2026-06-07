"use client"

import { useEffect, useState } from "react"
import { IoOpenOutline } from "react-icons/io5"
import { useRouter } from "next/navigation"
import { isInstalledPwa } from "@/lib/pwaDisplayMode"

export default function OpenAppButton() {
  const [installed, setInstalled] = useState(false)
  const [opening, setOpening] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setInstalled(isInstalledPwa())
  }, [])

  if (!installed) return null

  const handleOpen = async () => {
    setOpening(true)
    try {
      const response = await fetch("/api/pwa/access", {
        method: "POST",
        headers: { "x-tvc-pwa-launch": "standalone" },
      })
      if (!response.ok) throw new Error("PWA access failed")
      router.push("/mobile")
    } catch (error) {
      console.error("PWA access failed:", error)
      setOpening(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleOpen}
      disabled={opening}
      className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-red-700 px-6 text-sm font-bold text-white shadow-lg shadow-red-700/20 transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-700/35 disabled:cursor-wait disabled:opacity-70"
    >
      <IoOpenOutline className="h-5 w-5" aria-hidden="true" />
      {opening ? "Opening..." : "Open App"}
    </button>
  )
}
