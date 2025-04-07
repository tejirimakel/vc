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

    // If the app is already installed, redirect to the mobile interface
    if (isStandalone) {
      router.replace("/mobile");
      return;
    }

    // iOS detection for custom prompt (iOS does not support beforeinstallprompt)
    const isIos = /iphone|ipod|ipad/.test(window.navigator.userAgent.toLowerCase());

    if (isIos) {
      // Show custom prompt for iOS users asking them to add to home screen
      setIsPromptVisible(true);
    } else {
      // Handle the beforeinstallprompt event for other browsers
      const handleBeforeInstallPrompt = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setIsPromptVisible(true);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    }
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
            <p className="flex-grow">
              {window.matchMedia("(display-mode: standalone)").matches
                ? "Install this app for a better experience!"
                : "Add this app to your home screen for a better experience!"}
            </p>

            {/* Close Button */}
            <button onClick={handleClose} className="text-white hover:text-red-500">
              <IoClose className="w-6 h-6" />
            </button>
          </div>

          {window.matchMedia("(display-mode: standalone)").matches ? (
            <button
              onClick={handleInstallClick}
              className="bg-red-700 text-white px-4 py-2 rounded mt-4"
            >
              Install
            </button>
          ) : (
            <p className="mt-2">Tap the Share icon and then select Add to Home Screen.</p>
          )}
        </div>
      )}
    </>
  );
}
