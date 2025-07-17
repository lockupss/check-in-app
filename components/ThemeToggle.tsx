'use client'

import { useEffect, useState } from 'react'

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  // Sync theme on initial load
  useEffect(() => {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const storedTheme = localStorage.getItem('color-theme')

    const activeTheme = storedTheme
      ? (storedTheme as 'light' | 'dark')
      : systemPrefersDark ? 'dark' : 'light'

    setTheme(activeTheme)
    document.documentElement.classList.toggle('dark', activeTheme === 'dark')
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('color-theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  if (!mounted) return null

  return (
    <button
      aria-label="Toggle Dark Mode"
      onClick={toggleTheme}
      className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-grey-700
        focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700
        rounded-lg text-sm p-2.5"
    >
      {theme === 'dark' ? (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" clipRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0
              4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1
              0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0
              11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0
              100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0
              11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1
              1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0
              01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0
              100-2H3a1 1 0 000 2h1z"
          />
        </svg>
      )}
    </button>
  )
}
