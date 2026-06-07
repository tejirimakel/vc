'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { isInstalledPwa } from '@/lib/pwaDisplayMode';

export default function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('splashShown')) return;
    if (!isInstalledPwa()) return;

    setVisible(true);
    sessionStorage.setItem('splashShown', 'true');

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
