"use client"

import { useEffect, useState } from "react"
import { IoClose } from "react-icons/io5"
import { isInstalledPwa } from "@/lib/pwaDisplayMode"

const COOKIE_FLAGS = "; path=/; max-age=604800; SameSite=Lax; Secure"
const INSTALLED_FLAGS = "; path=/; max-age=31536000; SameSite=Lax; Secure"

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [visible, setVisible] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isIos, setIsIos] = useState(false)

  useEffect(() => {
    const standalone = isInstalledPwa()

    setIsStandalone(standalone)
    if (standalone) return

    if (document.cookie.includes("pwa-install-dismissed=true")) return

    const ios = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase())
    setIsIos(ios)

    if (ios) {
      setVisible(true)
      return
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setVisible(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const choiceResult = await deferredPrompt.userChoice
    if (choiceResult.outcome === "accepted") {
      document.cookie = "pwa-installed=true" + INSTALLED_FLAGS
      await fetch("/api/pwa/access", {
        method: "POST",
        headers: { "x-tvc-pwa-launch": "install-accepted" },
      }).catch((error) => {
        console.error("PWA access failed:", error)
      })
    }
    setDeferredPrompt(null)
    setVisible(false)
  }

  const handleClose = () => {
    document.cookie = "pwa-install-dismissed=true" + COOKIE_FLAGS
    setVisible(false)
  }

  if (!visible || isStandalone) return null

  return (
    <div className="fixed bottom-0 left-0 w-full rounded-t-2xl bg-gray-950 text-white px-4 py-6 shadow-lg z-50">
      <div className="flex justify-between items-center">
        <p className="text-sm">
          Install Thevaluechain for a better reading experience
        </p>
        <button onClick={handleClose} aria-label="Dismiss install prompt">
          <IoClose className="w-6 h-6" aria-hidden="true" />
        </button>
      </div>

      {!isIos && deferredPrompt && (
        <button
          onClick={handleInstall}
          className="mt-4 w-full bg-red-700 py-2 rounded"
        >
          Install App
        </button>
      )}

      {isIos && (
        <p className="mt-3 text-sm text-gray-300">
          Tap the Share icon and select <strong>Add to Home Screen</strong>
        </p>
      )}
    </div>
  )
}
