// components/AdminLayout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from './Header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();

  useEffect(() => {
    const verifyAccess = async () => {
      try {
        const res = await fetch('/api/admin/available');
        if (!res.ok) {
          router.replace('/');
        }
      } catch (error) {
        router.replace('/');
      }
    };
    verifyAccess();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto p-4">
        {children}
      </main>
    </div>
  );
}