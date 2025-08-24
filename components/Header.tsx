"use client";

import { Button } from '@/components/ui/button';
import { BarChart3 } from 'lucide-react'
import Link from 'next/link';
import { cn } from "@/lib/utils";
import Image from 'next/image';
import { ThemeToggle } from './ThemeToggle';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { LayoutDashboard, Home, ClipboardList, LogIn, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from 'next-auth/react';
import RegisterModal from '@/components/RegisterModal';

export default function Header({
  onOpenRegister
}: {
  onOpenRegister?: () => void
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [initialRegister, setInitialRegister] = useState<any>(null)
  const [originalRegisterId, setOriginalRegisterId] = useState<string | null>(null)

  const isDashboard = pathname.startsWith('/dashboard');
  const isAnalytics = pathname === '/dashboard/analytics';
  const isLanding = pathname === '/';
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';

  const handleNavigation = async (path: string) => {
    // Block navigation for unregistered users
    try {
      const userId = (user?.email || (user as any)?.id || '')?.toString()
      if (user && userId) {
        const registered = typeof window !== 'undefined' ? !!localStorage.getItem(`registered:${userId}`) : false
        if (!registered) {
          toast.error('Please complete registration before continuing')
          setShowRegister(true)
          return
        }
      }
    } catch (e) {}

    if (path === '/dashboard' && !isAdmin) {
      toast.error('Admin access required');
      return;
    }

    setIsLoading(true);
    try {
      await router.push(path);
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = path;
    } finally {
      setIsLoading(false);
    }
  };

  // When a user signs in, check if they already filled the register. If not, prompt them once.
  const [checkedRegistration, setCheckedRegistration] = useState(false);
  useEffect(() => {
    // Listen for a global event to open the register modal (useful for pages that want to force registration)
    const handler = () => setShowRegister(true)
    try {
      window.addEventListener?.('open-register', handler as EventListener)
    } catch (e) {}
    return () => {
      try { window.removeEventListener?.('open-register', handler as EventListener) } catch (e) {}
    }

    let cancelled = false
    const checkRegistration = async () => {
      if (!user || loading) return
      try {
        const userId = (user.email || (user as any).id || '').toString()
        const promptedKey = `register-prompted:${userId}`
        // If we've already prompted this user once, don't auto-open again
        try {
          if (typeof window !== 'undefined' && localStorage.getItem(promptedKey)) {
            setCheckedRegistration(false)
            return
          }
        } catch (e) {
          // ignore storage errors
        }
        // Try server check first
        try {
          const res = await fetch(`/api/register/${encodeURIComponent(userId)}`)
          if (res.ok) {
            // found registration on server; mark as checked and registered so we don't prompt
            try { if (typeof window !== 'undefined') { localStorage.setItem(promptedKey, '1'); localStorage.setItem(`registered:${userId}`, '1') } } catch {}
            setCheckedRegistration(true)
            return
          }
        } catch (e) {
          // ignore server errors and fallback to local storage
        }

        // Check local-registers fallback
        try {
          const local = JSON.parse(localStorage.getItem('local-registers') || '[]') as any[]
          const found = local.find(r => ((r.userId || '').toLowerCase() === userId.toLowerCase()) || ((r.name || '').toLowerCase() === (user.name || '').toLowerCase()))
          if (found) {
            try { if (typeof window !== 'undefined') { localStorage.setItem(promptedKey, '1'); localStorage.setItem(`registered:${userId}`, '1') } } catch {}
            setCheckedRegistration(true)
            return
          }
        } catch (e) {
          // ignore
        }

        if (!cancelled) {
          setShowRegister(true)
          setCheckedRegistration(false)
          // mark that we've prompted this user once so we don't auto-open repeatedly
          try { if (typeof window !== 'undefined') localStorage.setItem(promptedKey, '1') } catch {}
        }
      } catch (e) {
        console.error('Registration check failed', e)
      }
    }

    checkRegistration()
    return () => { cancelled = true }
  }, [user, loading])

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white dark:bg-black border-b border-amber-200 dark:border-gray-700 shadow-sm sticky top-0 z-50">
      {/* Logo and Branding */}
      <div className="flex items-center ml-5 gap-3">
        <button 
          onClick={() => handleNavigation('/')} 
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <Image
            src="/chechin-logo.png"
            alt="Logo"
            width={60}
            height={60}
            className="rounded-full border-2 border-amber-400 dark:border-gray-600"
          />
          <h1 className="text-3xl font-bold text-amber-900 dark:text-gray-100">
            Check-In App
          </h1>
          <div className="flex items-center gap-2">
            {isDashboard && (
              <span className="text-xs bg-amber-600 text-amber-50 dark:bg-gray-800 dark:text-gray-100 px-2 py-1 rounded-full flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Admin
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-2">
        {user && !isDashboard && !checkedRegistration && (
          <Button 
            onClick={() => {
              // prefer the provided callback, otherwise open internal modal
              if (onOpenRegister) return onOpenRegister()
              setShowRegister(true)
            }} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1 border-amber-300 text-amber-800 hover:bg-amber-100 hover:text-amber-900 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-gray-100"
          >
            <ClipboardList className="h-4 w-4" />
            Register User
          </Button>
        )}

        {/* Show Edit button for registered users so they can update their info */}
        {user && !isDashboard && checkedRegistration && (
          <Button
            onClick={async () => {
              // Fetch the existing register record from server, fallback to local-registers
              try {
                const userId = (user.email || (user as any).id || '').toString()
                let rec = null
                try {
                  const res = await fetch(`/api/register/${encodeURIComponent(userId)}`)
                  if (res.ok) rec = await res.json()
                } catch (e) {
                  // ignore
                }
                if (!rec) {
                  try {
                    const local = JSON.parse(localStorage.getItem('local-registers') || '[]')
                    rec = local.find((r: any) => ((r.userId || '').toLowerCase() === userId.toLowerCase()) || ((r.name || '').toLowerCase() === (user.name || '').toLowerCase()))
                  } catch (e) { rec = null }
                }

                if (rec) {
                  setInitialRegister({ name: rec.name, userId: rec.userId, laptopBrand: rec.laptopBrand, department: rec.department })
                  setOriginalRegisterId(rec.id || null)
                } else {
                  setInitialRegister({ name: user.name || '', userId: user.email || '' })
                  setOriginalRegisterId(null)
                }
              } catch (e) {
                setInitialRegister({ name: user.name || '', userId: user.email || '' })
                setOriginalRegisterId(null)
              }
              setShowRegister(true)
            }}
            variant="outline"
            size="sm"
            className="flex items-center gap-1 border-amber-300 text-amber-800 hover:bg-amber-100 hover:text-amber-900 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-gray-100"
          >
            <ClipboardList className="h-4 w-4" />
            Edit
          </Button>
        )}

        {/* Dashboard Toggle - Only show for admin users */}
        {isAdmin && (
          <div className="flex gap-2">
            {isDashboard ? (
              <Button
                onClick={() => handleNavigation('/')}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 border-amber-300 text-amber-800 hover:bg-amber-100 hover:text-amber-900 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-gray-100"
                disabled={isLoading}
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
            ) : (
              <Button
                onClick={() => handleNavigation('/dashboard')}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 border-amber-300 text-amber-800 hover:bg-amber-100 hover:text-amber-900 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-gray-100"
                disabled={isLoading}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            )}
          </div>
        )}

        {/* Analytics Visibility (only show when not on analytics page) */}
        {isDashboard && !isAnalytics && isAdmin && (
          <Button
            onClick={() => handleNavigation('/dashboard/analytics')}
            variant="outline"
            size="sm"
            className="flex items-center gap-1 border-amber-300 text-amber-800 hover:bg-amber-100 hover:text-amber-900 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-gray-100"
          >
            <BarChart3 className="h-4 w-4" />
           Management
          </Button>
        )}

        {/* Back to Dashboard (only if on analytics page) */}
        {isAnalytics && isAdmin && (
          <Button
            onClick={() => handleNavigation('/dashboard')}
            variant="outline"
            size="sm"
            className="flex items-center gap-1 border-amber-300 text-amber-800 hover:bg-amber-100 hover:text-amber-900 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-gray-100"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Button>
        )}

        {/* Auth Buttons */}
        {/* Simple auth UI using localStorage when auth is disabled */}
        {user ? (
          <Button 
            onClick={async () => {
              setIsLoading(true);
              // Clear any local fallback/demo session data first
              try { localStorage.removeItem('local-user'); } catch {}
              try { localStorage.removeItem('user-name'); } catch {}

              // Call NextAuth signOut without forcing a server redirect
              try {
                await signOut({ redirect: false });
              } catch (e) {
                // ignore signOut errors
              }

              // Prefer a client replace (no history entry) then force a hard reload as fallback
              try {
                await router.replace('/')
              } catch (e) {
                try { await router.push('/') } catch {}
              }

              // Hard reload to ensure client hooks and server session are re-evaluated
              try {
                window.location.assign('/')
              } catch (e) {
                // nothing
              }

              setIsLoading(false);
            }}
            variant="outline" 
            size="sm"
            className="flex items-center gap-1 border-amber-300 text-amber-800 hover:bg-amber-100 hover:text-amber-900 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-gray-100"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        ) : (
          // Hide sign in on the landing page when user is not authenticated
          !isLanding && (
            <Button
              onClick={() => router.push('/auth/login')}
              variant="outline" 
              size="sm"
              className="flex items-center gap-1 border-amber-300 text-amber-800 hover:bg-amber-100 hover:text-amber-900 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-gray-100"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
          )
        )} 
        
        <ThemeToggle />
      </div>
      {/* Local register modal when header is used outside the dropdown wrapper */}
      <RegisterModal
        show={showRegister}
        initial={initialRegister}
        originalId={originalRegisterId}
        onClose={() => setShowRegister(false)}
        onRegistered={() => {
          setShowRegister(false)
          setCheckedRegistration(true)
          try {
            const userId = (user?.email || (user as any)?.id || '').toString()
            const promptedKey = `register-prompted:${userId}`
            if (typeof window !== 'undefined') { localStorage.setItem(promptedKey, '1'); localStorage.setItem(`registered:${userId}`, '1') }
          } catch (e) {}
          try { router.refresh() } catch {}
        }}
      />
    </header>
  );
}