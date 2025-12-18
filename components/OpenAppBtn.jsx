"use client"

import { useEffect, useState } from "react"
import { IoOpenOutline } from "react-icons/io5"
import { useRouter } from "next/navigation"

export default function OpenAppButton() {
  const [installed, setInstalled] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setInstalled(
      window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true
    )
  }, [])

  if (!installed) return null

  return (
    <button
      onClick={() => router.push("/mobile")}
      className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-white dark:bg-white dark:text-black"
    >
      <IoOpenOutline className="h-5 w-5" />
      Open App
    </button>
  )
}
