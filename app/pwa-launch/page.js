"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IoReloadOutline } from "react-icons/io5";
import { isInstalledPwa } from "@/lib/pwaDisplayMode";
import { requestPwaAccess } from "@/lib/pwaClient";

export default function PwaLaunchPage() {
  const router = useRouter();
  const retryTimer = useRef(null);
  const attempts = useRef(0);
  const [failureMessage, setFailureMessage] = useState("");
  const [retrying, setRetrying] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function launch() {
      attempts.current += 1;
      setRetrying(true);
      setFailureMessage("");

      if (!isInstalledPwa()) {
        router.replace("/");
        return;
      }

      try {
        await requestPwaAccess("standalone");
        if (!cancelled) router.replace("/mobile");
      } catch (error) {
        console.error("PWA launch failed:", error);
        if (!cancelled) {
          const message = error.message || "PWA access failed";
          const permanentFailure =
            message === "PWA access secret is not configured" ||
            message === "Unauthorized";
          const shouldRetry = !permanentFailure && attempts.current < 3;

          setFailureMessage(
            message === "PWA access secret is not configured"
              ? "App access is not configured on this deployment."
              : "Unable to restore app access."
          );
          setRetrying(shouldRetry);

          if (shouldRetry) {
            retryTimer.current = setTimeout(launch, 2500);
          }
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
        <div className="mt-8 flex min-h-12 items-center justify-center gap-3 text-sm font-bold text-neutral-200">
          <IoReloadOutline className={`h-5 w-5 text-red-300 ${retrying ? "animate-spin" : ""}`} aria-hidden="true" />
          {retrying ? "Opening app..." : "Could not open app"}
        </div>
        {failureMessage && (
          <p className="mt-4 text-sm leading-6 text-neutral-400">
            {failureMessage}
          </p>
        )}
      </section>
    </main>
  );
}
