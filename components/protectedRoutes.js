'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [status, setStatus] = useState('checking'); // 'checking', 'allowed', 'blocked'

  useEffect(() => {
    let isAllowed = false;

    try {
      // Check for app_access flag in localStorage
      const appAccess =
        typeof window !== 'undefined' ? localStorage.getItem('app_access') : null;

      // Detect standalone PWA mode
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches || // modern browsers
        (navigator.standalone === true) || // iOS Safari
        window.location.search.includes('standalone=true'); // optional query param fallback

      if (appAccess || isStandalone) {
        isAllowed = true;
      }
    } catch (err) {
      console.warn('Access check failed:', err);
    }

    if (isAllowed) {
      setStatus('allowed');
    } else {
      setStatus('blocked');
      // Redirect to landing page after short delay
      setTimeout(() => router.replace('/'), 2000);
    }
  }, [router]);

  if (status === 'checking') {
    return null; // or a loading spinner
  }

  if (status === 'blocked') {
    return (
      <main className="flex flex-col justify-center items-center h-screen text-center bg-neutral-950">
        <Image
          src="/VC-2023.jpg"
          alt="Access Restricted"
          width={150}
          height={150}
          className="animate-pulse mb-6"
        />
        <h1 className="text-2xl font-bold dark:text-neutral-200 mb-2">
          Access Restricted
        </h1>
        <p className="text-gray-500 dark:text-neutral-500 text-sm">
          Redirecting to landing page...
        </p>
      </main>
    );
  }

  return <>{children}</>;
}
