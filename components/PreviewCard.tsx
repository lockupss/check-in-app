"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { QrCode } from 'lucide-react'

type Entry = { id: string; name: string; type: 'in' | 'out'; time: string; department?: string; laptopBrand?: string }

export default function PreviewCard() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // preload a couple of demo entries (include department & laptopBrand to match landing preview)
    const demo: Entry[] = [
      { id: 'p1', name: 'Demo User', type: 'in', time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), department: 'Engineering', laptopBrand: 'Lenovo' },
      { id: 'p2', name: 'Demo User', type: 'out', time: new Date(Date.now() - 1000 * 60 * 60).toISOString(), department: 'Engineering', laptopBrand: 'Lenovo' },
    ]
    setEntries(demo)
  }, [])

  const push = (type: 'in' | 'out') => {
    setLoading(true)
    setTimeout(() => {
      const e: Entry = { id: Math.random().toString(36).slice(2, 9), name: 'Demo User', type, time: new Date().toISOString() }
      setEntries(prev => [e, ...prev].slice(0, 7))
      setLoading(false)
    }, 500)
  }

  const simulateScan = () => {
    // simulate scan => check in
    push('in')
  }

  return (
    <div className="w-full max-w-md p-4 border border-amber-100 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-amber-700">Preview (demo)</h3>
        <span className="text-xs text-gray-500">Read-only</span>
      </div>
      <p className="mt-0 text-sm text-amber-600 dark:text-gray-400">Interactive preview: try Check In / Check Out and see a live history. Sign in to use your account and full features.</p>

      <div className="mt-4 flex gap-2 justify-center">
        <Button onClick={() => push('in')} disabled={loading} className="px-3 py-2 bg-amber-700 text-white">{loading ? '...' : 'Check In'}</Button>
        <Button onClick={() => push('out')} disabled={loading} className="px-3 py-2 bg-gray-700 text-white">{loading ? '...' : 'Check Out'}</Button>
      </div>

      <div className="mt-3 flex justify-center">
        <Button variant="outline" onClick={simulateScan} className="flex items-center gap-2"><QrCode className="h-4 w-4"/> Simulate Scan</Button>
      </div>

      <div className="mt-4">
        <div className="text-xs text-amber-500 mb-2">Recent</div>
        <ul className="max-h-40 overflow-auto space-y-1">
          {entries.map((e) => (
            <li key={e.id} className="py-2 border-b last:border-b-0">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-amber-900 dark:text-gray-200">{e.name}</div>
                  <div className="text-xs text-gray-500">{e.type.toUpperCase()} • {e.department || 'General'}</div>
                  <div className="text-xs text-gray-500">{e.laptopBrand ? `Laptop: ${e.laptopBrand}` : ''}</div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 text-right">{new Date(e.time).toLocaleDateString()}<br/>{new Date(e.time).toLocaleTimeString()}</div>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-3 text-center">
          <a href="/auth/login" className="inline-block px-4 py-2 bg-amber-700 text-white rounded-md">Sign in to try</a>
        </div>
      </div>
    </div>
  )
}
