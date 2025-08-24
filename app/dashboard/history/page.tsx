"use client"

import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import Footer from "@/components/Footer"
import Header from "@/components/Header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast, Toaster } from "sonner"
import { Download, Loader2, Search, X, ArrowUpDown, Filter, Calendar, Clock, Users, TrendingUp } from "lucide-react"
import { formatTime } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface HistoryRecord {
  id: string
  userId: string
  name: string
  department: string
  checkInTime: string
  checkOutTime?: string
  date: string
}

export default function AdminHistoryPage() {
  const [historyData, setHistoryData] = useState<HistoryRecord[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null
    const role = typeof window !== "undefined" ? localStorage.getItem("user-role") : null
    if (!token || role !== "admin") {
      redirect("/auth/login")
      return
    }

    // load sample data
    const dummy: HistoryRecord[] = [
      { id: "1", userId: "EMP001", name: "John Doe", department: "Engineering", checkInTime: "2024-01-09T09:30:00Z", checkOutTime: "2024-01-09T17:30:00Z", date: "2024-01-09" },
      { id: "2", userId: "EMP002", name: "Jane Smith", department: "Design", checkInTime: "2024-01-09T08:45:00Z", checkOutTime: "2024-01-09T16:45:00Z", date: "2024-01-09" },
      { id: "3", userId: "EMP003", name: "Mike Johnson", department: "Marketing", checkInTime: "2024-01-06T09:30:00Z", date: "2024-01-06" },
    ]
    setHistoryData(dummy)
    setLoading(false)
  }, [])

  const filtered = historyData.filter((r) => {
    if (!search) return true
    const q = search.toLowerCase()
    return r.name.toLowerCase().includes(q) || r.userId.toLowerCase().includes(q) || r.department.toLowerCase().includes(q)
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black">
      <Toaster position="top-center" richColors closeButton />
      <Header />
      <div className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-4">Complete History Dashboard</h2>

        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
            <Input placeholder="Search by name, user ID, or department..." className="pl-10" value={search} onChange={(e: any) => { setSearch(e.target.value); setCurrentPage(1) }} />
            {search && <X className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 cursor-pointer" onClick={() => { setSearch(""); setCurrentPage(1) }} />}
          </div>
          <Button onClick={() => { toast.success('Export not implemented in sample') }}><Download className="mr-2 h-4 w-4"/>Export CSV</Button>
        </div>

        <div className="rounded-lg border p-2 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Check-In</TableHead>
                <TableHead>Check-Out</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center"><Loader2 className="animate-spin" /></TableCell></TableRow>
              ) : currentItems.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center">No records found</TableCell></TableRow>
              ) : (
                currentItems.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-mono">{r.userId}</TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.department}</TableCell>
                    <TableCell>{formatTime(r.checkInTime)}</TableCell>
                    <TableCell>{r.checkOutTime ? formatTime(r.checkOutTime) : '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)} />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink onClick={() => setCurrentPage(1)} isActive={currentPage === 1}>1</PaginationLink>
              </PaginationItem>
              {totalPages > 1 && (
                <PaginationItem>
                  <PaginationLink onClick={() => setCurrentPage(totalPages)} isActive={currentPage === totalPages}>{totalPages}</PaginationLink>
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationNext onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
      <Footer />
    </div>
  )
}
