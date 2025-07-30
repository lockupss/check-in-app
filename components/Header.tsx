'use client';

import { Button } from '@/components/ui/button';
import { BarChart3 } from 'lucide-react'
import Link from 'next/link';
import { cn } from "@/lib/utils";
import Image from 'next/image';
import { ThemeToggle } from './ThemeToggle';
import { usePathname, useRouter } from 'next/navigation';
import { Children, useCallback, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { LayoutDashboard, Home, ClipboardList, LogIn, LogOut, Shield } from 'lucide-react';

export default function Header({
  onOpenRegister
}: {
  onOpenRegister?: () => void
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  
  const isDashboard = pathname.startsWith('/dashboard');
  const isAnalytics = pathname === '/dashboard/analytics';
  const isAdmin = session?.user?.role?.toUpperCase() === 'ADMIN';

  const handleNavigation = async (path: string) => {
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
        {!isDashboard && (
          <Button 
            onClick={onOpenRegister} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1 border-amber-300 text-amber-800 hover:bg-amber-100 hover:text-amber-900 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-gray-100"
          >
            <ClipboardList className="h-4 w-4" />
            Register User
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
            Analytics
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
        {session ? (
          <Button 
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            variant="outline" 
            size="sm"
            className="flex items-center gap-1 border-amber-300 text-amber-800 hover:bg-amber-100 hover:text-amber-900 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-gray-100"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        ) : (
          <Button
            onClick={() => router.push('/auth/login')}
            variant="outline" 
            size="sm"
            className="flex items-center gap-1 border-amber-300 text-amber-800 hover:bg-amber-100 hover:text-amber-900 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-gray-100"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </Button>
        )} 
        
        <ThemeToggle />
      </div>
    </header>
  );
}