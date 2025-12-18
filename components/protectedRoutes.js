'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [status, setStatus] = useState('checking'); // 'checking', 'allowed', 'blocked'

  useEffect(() => {
    const isApp = localStorage.getItem('app_access');

    if (isApp) {
      setStatus('allowed');
    } else {
      setStatus('blocked');
      // Optional: redirect after showing message
      setTimeout(() => router.replace('/'), 3000);
    }
  }, [router]);

  if (status === 'checking') {
    // While verifying access, show nothing
    return null;
  }

  if (status === 'blocked') {
    return (
      <main className="flex flex-col justify-center items-center h-screen text-center p-6 bg-gray-50 dark:bg-neutral-900">
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
          Redirecting to the landing page...
        </p>
      </main>
    );
  }

  return <>{children}</>;
}
