import Image from "next/image"
import Link from "next/link"
import InstallPrompt from "@/components/prompt"
import MobileRedirect from "@/components/mobileRed"
import OpenAppButton from "@/components/OpenAppBtn"
import CurrentYear from "@/components/CurrentYear"
import {
  IoArrowForward,
  IoCloudOfflineOutline,
  IoDocumentTextOutline,
  IoFlashOutline,
  IoNewspaperOutline,
  IoPhonePortraitOutline,
  IoPlayCircleOutline,
  IoShieldCheckmarkOutline,
} from "react-icons/io5"

// Regenerate daily so the footer year never goes stale between deploys.
export const revalidate = 86400

const appSurfaces = [
  {
    icon: IoNewspaperOutline,
    title: "Daily energy brief",
    text: "A focused mobile feed for oil, gas, power, policy, markets, and company updates.",
  },
  {
    icon: IoDocumentTextOutline,
    title: "E-copy reader",
    text: "Recent editions are organized for quick browsing and comfortable PDF reading.",
  },
  {
    icon: IoPlayCircleOutline,
    title: "Video and live TV",
    text: "Switch from article reading to broadcast content without leaving the app shell.",
  },
]

const installReasons = [
  { icon: IoCloudOfflineOutline, label: "Offline fallback" },
  { icon: IoFlashOutline, label: "Fast relaunch" },
  { icon: IoShieldCheckmarkOutline, label: "Protected app access" },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f5f7fb] text-neutral-950 dark:bg-[#07080c] dark:text-neutral-50">
      <MobileRedirect />

      <section className="relative isolate flex min-h-[86vh] overflow-hidden bg-[#080910] px-5 py-7 text-white sm:min-h-[82vh] sm:px-8">
        <Image
          src="/2.webp"
          alt="TheValueChain app interface"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover opacity-55"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,9,16,0.96)_0%,rgba(8,9,16,0.82)_44%,rgba(8,9,16,0.42)_100%)]" />

        <div className="mx-auto grid w-full max-w-6xl items-center gap-8 md:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="max-w-3xl py-8">
            <Image
              src="/VC-2023.jpg"
              alt="TheValueChain"
              width={220}
              height={64}
              priority
              className="h-auto max-w-[12rem] rounded-lg border border-white/15 bg-white object-contain p-2 shadow-2xl shadow-black/25"
            />

            <p className="mt-8 inline-flex items-center gap-2 rounded-full border border-red-300/30 bg-red-500/10 px-3 py-1 text-xs font-bold uppercase text-red-100">
              <IoPhonePortraitOutline className="h-4 w-4" aria-hidden="true" />
              Mobile-first PWA
            </p>

            <h1 className="mt-5 max-w-2xl text-4xl font-black leading-[1.05] sm:text-6xl">
              TheValueChain
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-200 sm:text-lg">
              Energy news, e-copy editions, video, and live streaming in one installable app for readers who need the industry signal without the browser noise.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <OpenAppButton />
              <a
                href="#install"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 text-sm font-bold text-white backdrop-blur transition-colors hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                Install guide
                <IoArrowForward className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="hidden md:flex md:justify-end">
            <div className="relative w-full max-w-[18rem] overflow-hidden rounded-lg border border-white/15 bg-black shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
              <Image
                src="/26.webp"
                alt="TheValueChain mobile news feed"
                width={782}
                height={1692}
                className="h-auto w-full"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-black/10 bg-white px-5 py-5 dark:border-white/10 dark:bg-[#10131a]">
        <div className="mx-auto grid max-w-6xl gap-3 sm:grid-cols-3">
          {installReasons.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-lg border border-black/10 bg-[#f7f8fb] px-4 py-3 text-sm font-bold text-neutral-700 dark:border-white/10 dark:bg-white/5 dark:text-neutral-200"
            >
              <item.icon className="h-5 w-5 text-red-700 dark:text-red-300" aria-hidden="true" />
              {item.label}
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase text-red-700 dark:text-red-300">
              App surfaces
            </p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              Built around the way energy readers move.
            </h2>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {appSurfaces.map((surface) => (
              <article
                key={surface.title}
                className="rounded-lg border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5"
              >
                <surface.icon className="h-7 w-7 text-red-700 dark:text-red-300" aria-hidden="true" />
                <h3 className="mt-5 text-lg font-bold">{surface.title}</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                  {surface.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="install" className="bg-[#111827] px-5 py-14 text-white sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div>
            <p className="text-sm font-bold uppercase text-red-200">Install</p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              Add it once. Open it like a native app.
            </h2>
            <p className="mt-4 text-sm leading-6 text-neutral-300">
              The install prompt appears when the browser supports PWA installation. On iPhone and iPad, use the share menu and add the app to your home screen.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["01", "Open this page in Chrome, Edge, or Safari."],
              ["02", "Choose install or Add to Home Screen."],
              ["03", "Launch TheValueChain from your device."],
            ].map(([step, text]) => (
              <div key={step} className="rounded-lg border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-black text-red-200">{step}</p>
                <p className="mt-3 text-sm leading-6 text-neutral-200">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <InstallPrompt />

      <footer className="px-5 py-8 text-center text-xs font-medium text-neutral-500 dark:text-neutral-400">
        <nav className="mb-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <Link href="/privacy" className="hover:text-red-700 dark:hover:text-red-400">Privacy</Link>
          <Link href="/terms" className="hover:text-red-700 dark:hover:text-red-400">Terms</Link>
          <Link href="/cookies" className="hover:text-red-700 dark:hover:text-red-400">Cookies</Link>
          <Link href="/editorial" className="hover:text-red-700 dark:hover:text-red-400">Editorial</Link>
          <Link href="/copyright" className="hover:text-red-700 dark:hover:text-red-400">Copyright</Link>
          <Link href="/about" className="hover:text-red-700 dark:hover:text-red-400">About</Link>
        </nav>
        © <CurrentYear /> TheValueChain. All rights reserved.
      </footer>
    </main>
  )
}
