'use client'
import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const showToast = (type: 'success' | 'error'|'info', message: string) => {
    const toastOptions = {
      style: {
        background: type === 'success' ? '#78350f' : '#7f1d1d',
        color: '#fef3c7',
        border: '1px solid #f59e0b',
        borderRadius: '8px',
        padding: '16px 24px',
        fontSize: '16px',
        fontWeight: '500',
      },
      icon: type === 'success' ? '✅' : '❌',
      duration: 4000,
      position: 'top-center' as const,
    }

    if (type === 'success') {
      toast.success(message, toastOptions)
    } else {
      toast.error(message, toastOptions)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.email || !formData.password || (!isLogin && !formData.name)) {
      showToast('error', 'Please fill in all fields')
      return
    }

    if (!isLogin && formData.password.length < 6) {
      showToast('error', 'Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
          callbackUrl
        })

        if (result?.error) {
          throw new Error(result.error === 'CredentialsSignin' 
            ? 'Invalid email or password' 
            : result.error)
        }

        showToast('success', 'Logged in successfully!')
        router.push(callbackUrl)
        router.refresh()
      } else {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Signup failed')
        }

        showToast('success', 'Account created successfully! Please login')
        setIsLogin(true)
        setFormData(prev => ({ ...prev, password: '' }))
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      showToast('error', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Toaster 
        toastOptions={{
          className: '',
          style: {
            zIndex: 99999,
          },
        }}
      />
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="bg-amber-100 p-8 rounded-lg shadow-lg w-full max-w-md border border-amber-200">
          <h1 className="text-3xl font-bold mb-6 text-center text-amber-900">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-center text-amber-700 mb-6">
            {isLogin ? 'Sign in to continue' : 'Join us today'}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-amber-200 text-amber-900 rounded-md text-center border border-amber-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-amber-800 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-amber-50 text-amber-900 placeholder-amber-400"
                  required
                  autoComplete="name"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-amber-800 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-amber-50 text-amber-900 placeholder-amber-400"
                required
                autoComplete="email"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-amber-800 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-amber-50 text-amber-900 placeholder-amber-400"
                required
                minLength={6}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg shadow-sm text-lg font-medium text-white bg-amber-700 hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 transition-colors duration-200 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading
                ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                )
                : isLogin
                ? 'Sign In'
                : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-amber-200">
            <p className="text-center text-sm text-amber-700">
              {isLogin ? (
                <>
                  New here?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(false)
                      showToast('info', 'Please fill in your details to sign up')
                    }}
                    className="font-medium text-amber-800 hover:text-amber-900 underline underline-offset-2"
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(true)
                      showToast('info', 'Please enter your credentials to sign in')
                    }}
                    className="font-medium text-amber-800 hover:text-amber-900 underline underline-offset-2"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-amber-50">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}