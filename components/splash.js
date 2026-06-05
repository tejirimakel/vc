'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Grant access for protected routes on first load
    if (!localStorage.getItem('app_access')) {
      localStorage.setItem('app_access', 'true');
    }

    // Only show once per session and only in standalone (installed) mode
    if (sessionStorage.getItem('splashShown')) return;

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (!isStandalone) return;

    setVisible(true);
    sessionStorage.setItem('splashShown', 'true');

    // Start fade-out after 1.8s, fully hidden after 2.4s
    const fadeTimer = setTimeout(() => setFading(true), 1800);
    const hideTimer = setTimeout(() => setVisible(false), 2400);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 transition-opacity duration-500 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <Image
        src="/VC-2023.jpg"
        width={160}
        height={160}
        alt="TheValueChain"
        priority
        className="rounded-lg"
      />
    </div>
  );
}
