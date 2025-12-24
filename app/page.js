"use client"

import Image from "next/image"
import InstallPrompt from "@/components/prompt"
import MobileRedirect from "@/components/mobileRed"
import { IoDownload, IoNotifications, IoCloudOffline } from "react-icons/io5"
import OpenAppButton from "@/components/OpenAppBtn"

export default function Home() {
  return (
    <main className="min-h-screen bg-inherit text-gray-900 dark:text-white">
      {/* Redirect installed users immediately */}
      <MobileRedirect />

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <div className="mx-auto mb-6 flex justify-center">
            <Image
              src="/VC-2023.jpg"
              alt="TheValueChain App"
              width={180}
              height={96}
              priority
              className="rounded-sm shadow-lg"
            />
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            TheValueChain News & Streaming App
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            Get breaking energy news, live streaming, and full e-copies —
            faster, offline, and distraction-free.
          </p>

          <div className="mt-8 flex justify-center ">
                    <OpenAppButton />
          </div>


        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 sm:grid-cols-3">
          <Feature
            icon={<IoNotifications className="h-7 w-7" />}
            title="Breaking Alerts"
            text="Get instant push notifications when major stories break."
          />
          <Feature
            icon={<IoCloudOffline className="h-7 w-7" />}
            title="Offline Reading"
            text="Read saved stories and PDFs even without internet."
          />
          <Feature
            icon={<IoDownload className="h-7 w-7" />}
            title="App-Like Experience"
            text="No browser bar. No distractions. Just the news."
          />
        </div>
      </section>

      {/* ================= HOW TO INSTALL ================= */}
      <section className="bg-gray-50 dark:bg-neutral-900">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Install in 3 Easy Steps
          </h2>

          <div className="grid gap-10 sm:grid-cols-3">
            <Step
              step="01"
              title="Open in your browser"
              text="Visit this page using Chrome, Edge, or Safari on your phone."
            />
            <Step
              step="02"
              title="Tap Install / Add to Home Screen"
              text="Use the browser install button or share menu."
            />
            <Step
              step="03"
              title="Launch like an app"
              text="Open TheValueChain from your home screen anytime."
            />
          </div>
        </div>
      </section>

      {/* ================= INSTALL PROMPT ================= */}
      <InstallPrompt />

      {/* ================= FOOTER ================= */}
      <footer className="py-10 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} TheValueChain | All rights reserved.
      </footer>
    </main>
  )
}

/* ---------- Components ---------- */

function Feature({ icon, title, text }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-md dark:bg-neutral-800">
      <div className="mb-4 text-gray-900 dark:text-white">{icon}</div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{text}</p>
    </div>
  )
}

function Step({ step, title, text }) {
  return (
    <div className="relative rounded-2xl bg-white p-6 shadow-md dark:bg-neutral-800">
      <span className="absolute -top-4 left-6 rounded-full bg-black px-3 py-1 text-sm font-bold text-white dark:bg-white dark:text-black">
        {step}
      </span>
      <h3 className="mt-4 text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-gray-600 dark:text-gray-300">{text}</p>
    </div>
  )
}
