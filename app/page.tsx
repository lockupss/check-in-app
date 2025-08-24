"use client"
import QrScanner from '@/components/QrScanner';
import { QrCode, Users, Clock, Filter, ArrowUpDown } from 'lucide-react';

import { useEffect, useState } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { toast, Toaster } from "sonner"
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import PreviewCard from '@/components/PreviewCard'

type HistEntry = { id: string; userId: string; name: string; type: 'in' | 'out'; time: string }

export default function HomePage() {
  const { user: authUser, loading: authLoading } = useAuth()
  const [history, setHistory] = useState<HistEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 7;
  const [showScanner, setShowScanner] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    try {
      const rawHist = localStorage.getItem('local-history')
      if (rawHist) setHistory(JSON.parse(rawHist))
    } catch {
      setHistory([])
    }
  }, [])

  // Filter history by date
  const filteredHistory = history.filter(h => {
    // If user is signed in, only show their own records
    if (authUser) {
      try {
        const userEmail = authUser.email?.toLowerCase?.() || ''
        const userName = authUser.name?.toLowerCase?.() || ''
        const userId = (authUser as any).id || ''

        const hUserId = (h.userId || '').toLowerCase()
        const hName = (h.name || '').toLowerCase()

        // local fallback ids/names (optional)
        const localUserId = typeof window !== 'undefined' ? (localStorage.getItem('user-id') || '') : ''
        const localUserName = typeof window !== 'undefined' ? (localStorage.getItem('user-name') || '') : ''

        if (userEmail && hUserId === userEmail) return true
        if (userId && String(hUserId) === String(userId)) return true
        if (userName && hName === userName) return true
        if (localUserId && hUserId === localUserId.toLowerCase()) return true
        if (localUserName && hName === localUserName.toLowerCase()) return true

        return false
      } catch (e) {
        return false
      }
    }

    // If not signed in, fall back to date-only filter (landing not signed-in path shows preview)
    if (!dateFilter.from && !dateFilter.to) return true;
    const t = new Date(h.time).getTime();
    const from = dateFilter.from ? new Date(dateFilter.from).getTime() : -Infinity;
    const to = dateFilter.to ? new Date(dateFilter.to).getTime() : Infinity;
    return t >= from && t <= to;
  });

  // Build sessions by pairing in/out events so each row shows check-in and check-out together
  const buildSessions = (entries: HistEntry[]) => {
    if (!entries || entries.length === 0) return []
    const asc = [...entries].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
    const openByUser: Record<string, HistEntry> = {}
    const sessions: any[] = []

    for (const e of asc) {
      const uid = (e.userId || '').toLowerCase()
      if (e.type === 'in') {
        openByUser[uid] = e
      } else {
        const open = openByUser[uid]
        if (open) {
          sessions.push({
            id: `${open.id}-${e.id}`,
            userId: e.userId,
            name: open.name || e.name || e.userId,
            checkInTime: open.time,
            checkOutTime: e.time,
          })
          delete openByUser[uid]
        } else {
          sessions.push({ id: `out-${e.id}`, userId: e.userId, name: e.name || e.userId, checkInTime: undefined, checkOutTime: e.time })
        }
      }
    }

    // any remaining open ins become sessions without checkout
    for (const k of Object.keys(openByUser)) {
      const o = openByUser[k]
      sessions.push({ id: o.id, userId: o.userId, name: o.name || o.userId, checkInTime: o.time, checkOutTime: undefined })
    }

    // enrich from local-registers if available
    try {
      const regs = JSON.parse(localStorage.getItem('local-registers') || '[]')
      sessions.forEach(s => {
        const match = regs.find((r: any) => (r.userId || '').toLowerCase() === (s.userId || '').toLowerCase() || (r.name || '') === s.name)
        s.department = match ? (match.department || 'General') : 'General'
        s.laptopBrand = match ? (match.laptopBrand || '-') : '-'
      })
    } catch (e) {
      sessions.forEach(s => { s.department = 'General'; s.laptopBrand = '-' })
    }

    return sessions.reverse()
  }

  const sessions = buildSessions(filteredHistory)
  const totalPages = Math.ceil(sessions.length / itemsPerPage)
  const paginatedSessions = sessions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Client-side sorting for the sessions table
  const requestSort = (key: string) => {
    setSortConfig(prev => {
      if (!prev || prev.key !== key) return { key, direction: 'asc' }
      return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
    })
  }

  const sortedSessions = (() => {
    if (!sortConfig) return sessions
    const s = [...sessions]
    s.sort((a: any, b: any) => {
      const k = sortConfig.key
      const va = (a[k] || '')
      const vb = (b[k] || '')
      // For dates, compare timestamps
      if (k === 'checkInTime' || k === 'checkOutTime') {
        const ta = va ? new Date(va).getTime() : 0
        const tb = vb ? new Date(vb).getTime() : 0
        return sortConfig.direction === 'asc' ? ta - tb : tb - ta
      }
      // String compare
      const aa = String(va).toLowerCase()
      const bb = String(vb).toLowerCase()
      if (aa < bb) return sortConfig.direction === 'asc' ? -1 : 1
      if (aa > bb) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
    return s
  })()

  const paginatedSortedSessions = sortedSessions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const pushLocalHistory = (entry: HistEntry) => {
    const next = [entry, ...history].slice(0, 200)
    setHistory(next)
    try {
      localStorage.setItem('local-history', JSON.stringify(next))
    } catch {}
  }
  // Check whether a given userId is currently checked in according to local history
  const isUserCheckedIn = (userId?: string) => {
    if (!userId) return false
    const id = userId.toLowerCase()
    // find most recent entry for the user
    for (const e of history) {
      if ((e.userId || '').toLowerCase() === id) {
        return e.type === 'in'
      }
    }
    return false
  }

  // Perform checkin/checkout for an arbitrary userId (falls back to authUser.email)
  const actionForUser = async (type: 'in' | 'out', targetUserId?: string, targetName?: string) => {
    const userId = (targetUserId || authUser?.email)
    if (!userId) return toast.error('No target user specified')

    // Prevent double check-in or check-out mismatch
    const currentlyIn = isUserCheckedIn(userId)
    if (type === 'in' && currentlyIn) return toast.error('User already checked in. Please check out before checking in again.')
    if (type === 'out' && !currentlyIn) return toast.error('User is not checked in.')

    if (!authUser) return toast.error('You must be signed in to perform this action')
    setLoading(true)
    const url = type === 'in' ? '/api/checkin' : '/api/checkout'
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      if (res.ok) {
        const json = await res.json().catch(() => null)
        const entry: HistEntry = { id: Math.random().toString(36).slice(2, 9), userId, name: targetName || userId, type, time: new Date().toISOString() }
        pushLocalHistory(entry)
        toast.success(type === 'in' ? 'Checked in' : 'Checked out')
        return json
      }

      // server responded non-OK; fallback to local-only entry
      try {
        const bodyText = await res.text()
        toast.error(`Server: ${bodyText} — saved locally`)
      } catch {
        toast.error('Server error — saved locally')
      }
      const entry: HistEntry = { id: Math.random().toString(36).slice(2, 9), userId, name: targetName || userId, type, time: new Date().toISOString() }
      pushLocalHistory(entry)
      return null
    } catch (err) {
      console.error(err)
      toast.error('Network error — saved locally')
      const entry: HistEntry = { id: Math.random().toString(36).slice(2, 9), userId, name: targetName || userId, type, time: new Date().toISOString() }
      pushLocalHistory(entry)
    } finally {
      setLoading(false)
    }
  }

  // Convenience for current auth user
  const postAction = (type: 'in' | 'out') => actionForUser(type, authUser?.email, authUser?.name)

  // Whether the currently signed-in user is checked in (used to show only the correct primary action)
  const userCheckedIn = isUserCheckedIn(authUser?.email)

  if (!authUser) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-black">
        <Header />
        <main className="flex-1 flex items-center justify-center py-20 px-4">
          <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <section className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-extrabold text-amber-900 dark:text-gray-100">Fast, reliable check-ins for your team</h1>
              <p className="text-lg text-amber-700 dark:text-gray-300 max-w-xl">A lightweight attendance and check-in system with QR scanning, per-user history, and analytics. Secure sign-in ensures only authorized staff can view their records.</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                <div className="flex items-start gap-3 p-3 border border-amber-100 dark:border-gray-800 rounded-lg bg-amber-50 dark:bg-gray-900">
                  <QrCode className="h-6 w-6 text-amber-700" />
                  <div>
                    <div className="font-medium text-amber-900 dark:text-gray-100">QR Scanner</div>
                    <div className="text-sm text-amber-700 dark:text-gray-400">Instant check-in/out with a QR code.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 border border-amber-100 dark:border-gray-800 rounded-lg bg-amber-50 dark:bg-gray-900">
                  <Users className="h-6 w-6 text-amber-700" />
                  <div>
                    <div className="font-medium text-amber-900 dark:text-gray-100">User History</div>
                    <div className="text-sm text-amber-700 dark:text-gray-400">Per-user check-in/out logs and time tracking.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 border border-amber-100 dark:border-gray-800 rounded-lg bg-amber-50 dark:bg-gray-900">
                  <Clock className="h-6 w-6 text-amber-700" />
                  <div>
                    <div className="font-medium text-amber-900 dark:text-gray-100">Reports</div>
                    <div className="text-sm text-amber-700 dark:text-gray-400">Export CSV and view analytics.</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <Button asChild>
                  <a href="/auth/login" className="px-5 py-3">Sign in</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/auth/login?signup=true" className="px-4 py-2">Get started</a>
                </Button>
              </div>
            </section>

            <aside className="flex items-center justify-center">
              {/* Real interactive preview for the landing page */}
              <div className="w-full flex justify-center">
                <PreviewCard />
              </div>
            </aside>
          </div>
        </main>
        <Footer />
      </div>
    )
  }
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black">
      <Header />
      <Toaster position="top-center" richColors closeButton />
      {/* Page-specific amber background only for this page */}
      <main className="flex-1 p-6 bg-amber-100 dark:bg-amber-900">
        {/* Centered content area (relative so scanner can be positioned) */}
        <div className="relative max-w-4xl mx-auto text-center min-h-[75vh] flex flex-col items-center justify-center">
          {/* Title (in-flow to prevent overlap when history opens) */}
          <div className="w-full max-w-2xl mx-auto text-center pt-10 pb-6">
            <h1 className="text-6xl md:text-7xl font-extrabold text-amber-900 dark:text-amber-100 drop-shadow-md">Quick Check-In</h1>
            <p className="mt-2 text-base md:text-lg text-amber-800 dark:text-amber-200 max-w-xl mx-auto">Fast QR check-ins and per-user history — simple and focused.</p>
          </div>

          {/* Large centered buttons */}
          <div className="flex flex-col gap-6 items-center mb-6 mt-2">
            <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
              {/* Show only the appropriate action to avoid user confusion */}
              {!userCheckedIn ? (
                <Button onClick={() => postAction('in')} disabled={loading} className="w-[320px] md:w-[430px] px-10 py-7 bg-amber-700 hover:bg-amber-800 text-white rounded-2xl text-2xl shadow-lg border-4 border-amber-600">
                  {loading ? 'Working...' : 'CHECK IN'}
                </Button>
              ) : (
                <Button onClick={() => postAction('out')} disabled={loading} className="w-[320px] md:w-[430px] px-10 py-7 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-2xl shadow-lg border-2 border-amber-400">
                  {loading ? 'Working...' : 'CHECK OUT'}
                </Button>
              )}
            </div>

            <div className="flex gap-4 mt-4">
              <Button variant="outline" onClick={() => setShowHistory((s) => !s)} className="w-[220px] px-5 py-3 text-lg">
                <Users className="mr-2 h-5 w-5 inline" />
                {showHistory ? 'Hide History' : 'History'}
              </Button>
              <Button variant="ghost" onClick={() => setShowScanner((prev) => !prev)} className="w-[220px] px-5 py-3 text-lg">
                <QrCode className="mr-2 h-5 w-5" />
                {showScanner ? "Hide Scanner" : "Show Scanner"}
              </Button>
            </div>
          </div>

          {/* History area (togglable) */}
          {showHistory && (
            <div className="w-full px-4">
              <h2 className="text-xl font-semibold mb-2">Your History</h2>
              <div className="flex gap-2 justify-center mb-4 items-center">
                <button onClick={() => setShowFilters(s => !s)} className="flex items-center gap-2 text-amber-800 hover:text-amber-900">
                  <Filter className="h-4 w-4" />
                  <span className="text-sm">Filter</span>
                </button>
                {showFilters && (
                  <>
                    <input
                      type="date"
                      value={dateFilter.from}
                      onChange={e => { setDateFilter(f => ({ ...f, from: e.target.value })); setCurrentPage(1) }}
                      className="border rounded px-2 py-1"
                    />
                    <span className="mx-2">to</span>
                    <input
                      type="date"
                      value={dateFilter.to}
                      onChange={e => { setDateFilter(f => ({ ...f, to: e.target.value })); setCurrentPage(1) }}
                      className="border rounded px-2 py-1"
                    />
                    <Button variant="ghost" onClick={() => { setDateFilter({ from: '', to: '' }); setCurrentPage(1); setShowFilters(false) }}>Clear</Button>
                  </>
                )}
                
              </div>
              <div className="bg-white dark:bg-gray-900 border rounded p-4 text-left">
                {paginatedSortedSessions.length === 0 && <p className="text-sm text-gray-500">No records yet.</p>}
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-sm text-amber-800">
                        <th className="px-2 py-2">Name <button onClick={() => requestSort('name')} className="inline ml-2"><ArrowUpDown className="h-4 w-4" /></button></th>
                        <th className="px-2 py-2">Department <button onClick={() => requestSort('department')} className="inline ml-2"><ArrowUpDown className="h-4 w-4" /></button></th>
                        <th className="px-2 py-2">Laptop <button onClick={() => requestSort('laptopBrand')} className="inline ml-2"><ArrowUpDown className="h-4 w-4" /></button></th>
                        <th className="px-2 py-2">Check-In <button onClick={() => requestSort('checkInTime')} className="inline ml-2"><ArrowUpDown className="h-4 w-4" /></button></th>
                        <th className="px-2 py-2">Check-Out <button onClick={() => requestSort('checkOutTime')} className="inline ml-2"><ArrowUpDown className="h-4 w-4" /></button></th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedSortedSessions.map((s) => {
                        const inWhen = s.checkInTime ? new Date(s.checkInTime) : null
                        const outWhen = s.checkOutTime ? new Date(s.checkOutTime) : null
                        return (
                          <tr key={s.id} className="border-t last:border-b-0">
                            <td className="px-2 py-3">
                              <div className="font-medium text-amber-900 dark:text-gray-300">{s.name}</div>
                              <div className="text-xs text-gray-500">{s.userId}</div>
                            </td>
                            <td className="px-2 py-3 text-sm text-gray-700">{s.department || 'General'}</td>
                            <td className="px-2 py-3 text-sm text-gray-700">{s.laptopBrand || '-'}</td>
                            <td className="px-2 py-3 text-sm text-gray-700">{inWhen ? `${inWhen.toLocaleDateString()} ${inWhen.toLocaleTimeString()}` : '-'}</td>
                            <td className="px-2 py-3 text-sm text-gray-700">{outWhen ? `${outWhen.toLocaleDateString()} ${outWhen.toLocaleTimeString()}` : '-'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-4 gap-2">
                    <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>Previous</Button>
                    <span className="px-3 py-2">Page {currentPage} of {totalPages}</span>
                    <Button variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>Next</Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Floating scanner panel at bottom-right of this page area */}
          {showScanner && (
            <div className="fixed right-6 bottom-6 z-50">
              <div className="w-44 rounded-lg overflow-hidden shadow-lg border border-amber-200 bg-white dark:bg-gray-900">
                <div className="p-1">
                  {/* pass boxSize half of default to make scanner 2x smaller */}
                  <QrScanner boxSize={125} onScanSuccess={async (userId) => {
                    // On scan, determine whether to check in or out for the scanned user
                    try {
                      const isIn = isUserCheckedIn(userId)
                      await actionForUser(isIn ? 'out' : 'in', userId)
                    } catch (e) {
                      console.error(e)
                      toast.error('Scanner error')
                    }
                  }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

