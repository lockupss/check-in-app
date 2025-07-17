'use client';
import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

export default function Header({ onOpenRegister }: { onOpenRegister: () => void }) {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-gray-900 border-b shadow-sm">
      <div className="flex items-center gap-3">
        <img
          src="/chechin-logo.png"
          alt="Check-In App Logo"
          className="h-10 w-10 rounded-full object-cover border-2 border-gray-600"
        />
        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
          Check-In App
        </h1>
        <button
          onClick={onOpenRegister}
          className="ml-2 text-blue-500 dark:text-blue-400 underline text-sm hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
        >
          Register?
        </button>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/admin"
          className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white text-sm font-medium transition-colors"
        >
          Admin
        </Link>
        <button
          className="text-sm text-white bg-orange-300 dark:bg-orange-500 hover:bg-orange-400 dark:hover:bg-orange-600 font-medium px-3 py-1 rounded-md transition-colors"
        >
          <svg
            className="w-6 h-6 text-gray-800 dark:text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M20 12H8m12 0-4 4m4-4-4-4M9 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h2"
            />
          </svg>
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
