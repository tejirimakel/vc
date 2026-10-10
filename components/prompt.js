"use client"

import { useEffect, useState } from "react"
import { IoClose } from "react-icons/io5"
import { isInstalledPwa } from "@/lib/pwaDisplayMode"
import { requestPwaAccess } from "@/lib/pwaClient"
import { useConsent } from "@/components/consent/ConsentProvider"

const DISMISSED_KEY = "pwa-install-dismissed"
const DISMISS_MS = 7 * 24 * 60 * 60 * 1000

function wasDismissedRecently() {
  try {
    const dismissedAt = Number(localStorage.getItem(DISMISSED_KEY))
    return dismissedAt > 0 && Date.now() - dismissedAt < DISMISS_MS
  } catch {
    // Storage blocked: treat as not dismissed.
    return false
  }
}

function rememberDismissed() {
  try {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()))
  } catch {
    // Best effort; the prompt is still hidden for this page view.
  }
}

export default function InstallPrompt() {
  const { status, ready } = useConsent()
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [visible, setVisible] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isIos, setIsIos] = useState(false)

  useEffect(() => {
    const standalone = isInstalledPwa()

    setIsStandalone(standalone)
    if (standalone) return

    if (wasDismissedRecently()) return

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
      await requestPwaAccess("install-accepted").catch((error) => {
        console.error("PWA access failed:", error)
      })
    }
    setDeferredPrompt(null)
    setVisible(false)
  }

  const handleClose = () => {
    rememberDismissed()
    setVisible(false)
  }

  // Wait until the visitor has answered the cookie banner: both sit at the
  // bottom of the screen, and the banner would cover this prompt.
  const consentAnswered = ready && status !== null

  if (!visible || isStandalone || !consentAnswered) return null

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
