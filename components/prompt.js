"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IoClose } from "react-icons/io5"; // Import close icon

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isPromptVisible, setIsPromptVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

    if (isStandalone) {
      router.replace("/mobile"); // Redirect to the mobile app interface if installed
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsPromptVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [router]);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice
        .then((choiceResult) => {
          if (choiceResult.outcome === "accepted") {
            document.cookie = "pwa-installed=true; path=/; max-age=31536000"; // 1-year expiry
            setIsPromptVisible(false);
          }
          setDeferredPrompt(null);
        })
        .catch((err) => {
          console.error("Installation failed", err);
        });
    }
  };

  const handleClose = () => {
    setIsPromptVisible(false);
  };

  return (
    <>
      {isPromptVisible && (
        <div className="fixed bottom-0 left-0 w-full rounded-t-2xl bg-gray-950 dark:bg-neutral-900 text-white px-4 py-6 text-center shadow-md">
          <div className="flex justify-between items-center">
            <p className="flex-grow">Install this app for a better experience!</p>

            {/* Close Button with React Icons */}
            <button onClick={handleClose} className="text-white hover:text-red-500">
              <IoClose className="w-6 h-6" />
            </button>
          </div>

          <button
            onClick={handleInstallClick}
            className="bg-red-700 text-white px-4 py-2 rounded mt-4"
          >
            Install
          </button>
        </div>
      )}
    </>
  );
}
