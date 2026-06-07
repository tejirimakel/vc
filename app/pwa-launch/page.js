"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IoReloadOutline } from "react-icons/io5";
import { isInstalledPwa } from "@/lib/pwaDisplayMode";

export default function PwaLaunchPage() {
  const router = useRouter();
  const retryTimer = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function launch() {
      setFailed(false);

      if (!isInstalledPwa()) {
        router.replace("/");
        return;
      }

      try {
        const response = await fetch("/api/pwa/access", {
          method: "POST",
          headers: { "x-tvc-pwa-launch": "standalone" },
        });

        if (!response.ok) throw new Error("PWA access failed");
        if (!cancelled) router.replace("/mobile");
      } catch (error) {
        console.error("PWA launch failed:", error);
        if (!cancelled) {
          setFailed(true);
          retryTimer.current = setTimeout(launch, 2500);
        }
      }
    }

    launch();

    return () => {
      cancelled = true;
      clearTimeout(retryTimer.current);
    };
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07080c] px-6 text-center text-white">
      <section className="flex w-full max-w-sm flex-col items-center">
        <Image
          src="/VC-2023.jpg"
          alt="TheValueChain"
          width={180}
          height={60}
          priority
          className="h-auto rounded-lg bg-white p-2"
        />
        <div className="mt-8 flex h-12 items-center justify-center gap-3 text-sm font-bold text-neutral-200">
          <IoReloadOutline className="h-5 w-5 animate-spin text-red-300" aria-hidden="true" />
          Opening app...
        </div>
        {failed && (
          <p className="mt-4 text-sm leading-6 text-neutral-400">
            Still opening. Keep this screen active while access is restored.
          </p>
        )}
      </section>
    </main>
  );
}
