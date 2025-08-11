"use client"

import { useState, useEffect } from "react"
import { redirect } from "next/navigation"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
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
import { DateRange } from "react-date-range"
import "react-date-range/dist/styles.css"
import "react-date-range/dist/theme/default.css"

interface HistoryRecord {
  id: string
  userId: string
  name: string
  department: string
  checkInTime: string
  checkOutTime?: string
  date: string
  workingHours?: string
}

export default function AdminHistoryPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userName, setUserName] = useState("")
  const [historyData, setHistoryData] = useState<HistoryRecord[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "ascending" | "descending" } | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)

  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      endDate: new Date(),
      key: "selection",
    } as any,
  ])
  const [dateFilterApplied, setDateFilterApplied] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("auth-token")
    const name = localStorage.getItem("user-name")
    const role = localStorage.getItem("user-role")

    if (!token || role !== "admin") {
      redirect("/auth/login")
    } else {
      setIsAuthenticated(true)
      setUserName(name || "")
      setAuthChecked(true)
    }
  }, [])

  useEffect(() => {
    if (authChecked) {
      loadHistoryData()
    }
  }, [authChecked])

  const loadHistoryData = async () => {
    try {
      setLoading(true)
      // Simulate API call with comprehensive dummy data
      const dummyHistory: HistoryRecord[] = [
        {
          id: "1",
          userId: "EMP001",
          name: "John Doe",
          department: "Engineering",
          checkInTime: "2024-01-09T09:30:00Z",
          checkOutTime: "2024-01-09T17:30:00Z",
          date: "2024-01-09",
          workingHours: "8h 0m",
        },
        {
          id: "2",
          userId: "EMP002",
          name: "Jane Smith",
          department: "Design",
          checkInTime: "2024-01-09T08:45:00Z",
          checkOutTime: "2024-01-09T16:45:00Z",
          date: "2024-01-09",
          workingHours: "8h 0m",
        },
        {
          id: "3",
          userId: "EMP001",
          name: "John Doe",
          department: "Engineering",
          checkInTime: "2024-01-08T09:15:00Z",
          checkOutTime: "2024-01-08T18:00:00Z",
          date: "2024-01-08",
          workingHours: "8h 45m",
        },
        {
          id: "4",
          userId: "EMP003",
          name: "Mike Johnson",
          department: "Marketing",
          checkInTime: "2024-01-08T10:00:00Z",
          checkOutTime: "2024-01-08T17:00:00Z",
          date: "2024-01-08",
          workingHours: "7h 0m",
        },
        {
          id: "5",
          userId: "EMP002",
          name: "Jane Smith",
          department: "Design",
          checkInTime: "2024-01-07T09:00:00Z",
          checkOutTime: "2024-01-07T17:30:00Z",
          date: "2024-01-07",
          workingHours: "8h 30m",
        },
        {
          id: "6",
          userId: "EMP004",
          name: "Sarah Wilson",
          department: "HR",
          checkInTime: "2024-01-07T08:30:00Z",
          checkOutTime: "2024-01-07T16:30:00Z",
          date: "2024-01-07",
          workingHours: "8h 0m",
        },
        {
          id: "7",
          userId: "EMP001",
          name: "John Doe",
          department: "Engineering",
          checkInTime: "2024-01-06T09:45:00Z",
          checkOutTime: "2024-01-06T18:15:00Z",
          date: "2024-01-06",
          workingHours: "8h 30m",
        },
        {
          id: "8",
          userId: "EMP003",
          name: "Mike Johnson",
          department: "Marketing",
          checkInTime: "2024-01-06T09:30:00Z",
          date: "2024-01-06",
          workingHours: "Still working",
        },
      ]
      setHistoryData(dummyHistory)
    } catch (error) {
      toast.error("Failed to load history data")
      console.error("Fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateWorkingHours = (checkIn: string, checkOut?: string) => {
    if (!checkOut) return "Still working"

    const checkInTime = new Date(checkIn)
    const checkOutTime = new Date(checkOut)
    const diffMs = checkOutTime.getTime() - checkInTime.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    return `${diffHours}h ${diffMinutes}m`
  }

  const filterByDateRange = (record: HistoryRecord) => {
    if (!dateFilterApplied) return true

    const startDate = new Date(dateRange[0].startDate)
    const endDate = new Date(dateRange[0].endDate)
    endDate.setHours(23, 59, 59, 999)

    const recordDate = new Date(record.date)
    return recordDate >= startDate && recordDate <= endDate
  }

  const filteredData = historyData.filter(
    (record) =>
      filterByDateRange(record) &&
      (record.name.toLowerCase().includes(search.toLowerCase()) ||
        record.userId.toLowerCase().includes(search.toLowerCase()) ||
        record.department.toLowerCase().includes(search.toLowerCase())),
  )

  const sortedData = () => {
    if (!sortConfig) return filteredData
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof HistoryRecord] || ""
      const bValue = b[sortConfig.key as keyof HistoryRecord] || ""
      if (sortConfig.direction === "ascending") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
  }

  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending"
    if (sortConfig?.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key)
      return <ArrowUpDown className="ml-1 h-3 w-3 text-amber-600 dark:text-gray-400" />
    return sortConfig.direction === "ascending" ? (
      <ArrowUpDown className="ml-1 h-3 w-3 rotate-180 text-amber-600 dark:text-gray-400" />
    ) : (
      <ArrowUpDown className="ml-1 h-3 w-3 text-amber-600 dark:text-gray-400" />
    )
  }

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = sortedData().slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(sortedData().length / itemsPerPage)

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  const applyDateFilter = () => {
    setDateFilterApplied(true)
    setShowDatePicker(false)
    setCurrentPage(1)
    toast.success(
      `Filter applied from ${dateRange[0].startDate.toLocaleDateString()} to ${dateRange[0].endDate.toLocaleDateString()}`,
    )
  }

  const clearDateFilter = () => {
    setDateFilterApplied(false)
    setCurrentPage(1)
    toast.success("Date filter cleared")
  }

  const exportToCSV = async () => {
    try {
      setExporting(true)
      toast.loading("Preparing export...")
      const headers = ["Date", "User ID", "Name", "Department", "Check-In", "Check-Out", "Working Hours"].join(",")

      const rows = sortedData()
        .map((item) =>
          [
            item.date,
            item.userId,
            item.name,
            item.department,
            formatTime(item.checkInTime),
            item.checkOutTime ? formatTime(item.checkOutTime) : "Not checked out",
            calculateWorkingHours(item.checkInTime, item.checkOutTime),
          ]
            .map((field) => `"${field || ""}"`)
            .join(","),
        )
        .join("\n")

      const csvContent = `${headers}\n${rows}`
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `admin_history_${new Date().toISOString().slice(0, 10)}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success("Export completed successfully")
    } catch (error) {
      toast.error("Export failed")
      console.error(error)
    } finally {
      setExporting(false)
    }
  }

  // Statistics
  const stats = {
    totalRecords: filteredData.length,
    uniqueUsers: new Set(filteredData.map((r) => r.userId)).size,
    completedSessions: filteredData.filter((r) => r.checkOutTime).length,
    activeSessions: filteredData.filter((r) => !r.checkOutTime).length,
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-black">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600 dark:text-gray-500" />
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black">
      <Toaster position="top-center" richColors closeButton />
      <Header />

      <div className="flex-1 p-6">
        <div className="flex justify-center items-center mb-6">
          <div className="border border-amber-300 dark:border-gray-300 rounded-md px-6 py-4 shadow-sm dark:shadow-gray-200 bg-white dark:bg-gray-900">
            <h2 className="text-3xl font-bold text-amber-900 dark:text-gray-300 text-center">
              Complete History Dashboard
            </h2>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mx-4 sm:mx-8 md:mx-12 lg:mx-16 xl:mx-20">
          <Card className="border border-amber-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-800 dark:text-gray-300">Total Records</CardTitle>
              <Calendar className="h-4 w-4 text-amber-600 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-amber-900 dark:text-gray-300">{stats.totalRecords}</div>
              <p className="text-xs text-amber-600 dark:text-gray-400">Check-in/out records</p>
            </CardContent>
          </Card>

          <Card className="border border-amber-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-800 dark:text-gray-300">Unique Users</CardTitle>
              <Users className="h-4 w-4 text-amber-600 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-amber-900 dark:text-gray-300">{stats.uniqueUsers}</div>
              <p className="text-xs text-amber-600 dark:text-gray-400">Active employees</p>
            </CardContent>
          </Card>

          <Card className="border border-amber-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-800 dark:text-gray-300">Completed</CardTitle>
              <TrendingUp className="h-4 w-4 text-amber-600 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-amber-900 dark:text-gray-300">{stats.completedSessions}</div>
              <p className="text-xs text-amber-600 dark:text-gray-400">Full work sessions</p>
            </CardContent>
          </Card>

          <Card className="border border-amber-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-800 dark:text-gray-300">Active Now</CardTitle>
              <Clock className="h-4 w-4 text-amber-600 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-amber-900 dark:text-gray-300">{stats.activeSessions}</div>
              <p className="text-xs text-amber-600 dark:text-gray-400">Currently working</p>
            </CardContent>
          </Card>
        </div>

        {/* Search, Filter and Export */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mx-4 sm:mx-8 md:mx-12 lg:mx-16 xl:mx-20 mb-8">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500 dark:text-gray-500" />
            <Input
              placeholder="Search by name, user ID, or department..."
              className="pl-10 border-amber-300 dark:border-gray-300 bg-white dark:bg-gray-900 focus-visible:ring-amber-400 dark:focus-visible:ring-gray-400 text-amber-900 dark:text-gray-300"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
            />
            {search && (
              <X
                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 cursor-pointer text-amber-500 dark:text-gray-500 hover:text-amber-700 dark:hover:text-gray-400"
                onClick={() => {
                  setSearch("")
                  setCurrentPage(1)
                }}
              />
            )}
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setShowDatePicker(!showDatePicker)}
                className={`flex items-center gap-2 border-amber-300 dark:border-gray-300 text-amber-800 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-gray-800 ${dateFilterApplied ? "bg-amber-50 dark:bg-gray-800" : ""}`}
              >
                <Filter className="h-4 w-4 text-amber-600 dark:text-gray-400" />
                {dateFilterApplied
                  ? `${dateRange[0].startDate.toLocaleDateString()} - ${dateRange[0].endDate.toLocaleDateString()}`
                  : "Filter by Date"}
              </Button>

              {showDatePicker && (
                <div className="absolute right-0 mt-2 z-10 shadow-lg bg-white dark:bg-gray-900 border border-amber-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <DateRange
                    editableDateInputs={true}
                    onChange={(item) => {
                      if (item.selection.startDate && item.selection.endDate) {
                        setDateRange([item.selection])
                      }
                    }}
                    moveRangeOnFirstSelection={false}
                    ranges={dateRange}
                  />
                  <div className="p-2 flex justify-between border-t border-amber-100 dark:border-gray-700">
                    <Button
                      variant="ghost"
                      onClick={clearDateFilter}
                      className="text-amber-700 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-gray-800"
                      disabled={!dateFilterApplied}
                    >
                      Clear
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => setShowDatePicker(false)}
                        className="text-amber-700 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-gray-800"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={applyDateFilter}
                        className="bg-amber-700 dark:bg-gray-700 hover:bg-amber-800 dark:hover:bg-gray-600 text-white"
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button
              className="bg-amber-700 dark:bg-gray-700 hover:bg-amber-800 dark:hover:bg-gray-600 text-white shadow hover:shadow-md transition-all"
              onClick={exportToCSV}
              disabled={exporting}
            >
              {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Export CSV
            </Button>
          </div>
        </div>

        {/* Main Table */}
        <div className="rounded-lg border border-amber-200 dark:border-gray-700 shadow-sm overflow-hidden bg-white dark:bg-gray-900 mx-4 sm:mx-8 md:mx-12 lg:mx-16 xl:mx-20">
          <Table>
            <TableHeader className="bg-amber-50 dark:bg-gray-800">
              <TableRow>
                <TableHead className="text-amber-900 dark:text-gray-300">
                  <Button
                    variant="ghost"
                    className="text-amber-900 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-gray-700"
                    onClick={() => requestSort("date")}
                  >
                    Date {getSortIcon("date")}
                  </Button>
                </TableHead>
                <TableHead className="text-amber-900 dark:text-gray-300">
                  <Button
                    variant="ghost"
                    className="text-amber-900 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-gray-700"
                    onClick={() => requestSort("userId")}
                  >
                    User ID {getSortIcon("userId")}
                  </Button>
                </TableHead>
                <TableHead className="text-amber-900 dark:text-gray-300">
                  <Button
                    variant="ghost"
                    className="text-amber-900 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-gray-700"
                    onClick={() => requestSort("name")}
                  >
                    Name {getSortIcon("name")}
                  </Button>
                </TableHead>
                <TableHead className="text-amber-900 dark:text-gray-300">
                  <Button
                    variant="ghost"
                    className="text-amber-900 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-gray-700"
                    onClick={() => requestSort("department")}
                  >
                    Department {getSortIcon("department")}
                  </Button>
                </TableHead>
                <TableHead className="text-amber-900 dark:text-gray-300">
                  <Button
                    variant="ghost"
                    className="text-amber-900 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-gray-700"
                    onClick={() => requestSort("checkInTime")}
                  >
                    Check-In {getSortIcon("checkInTime")}
                  </Button>
                </TableHead>
                <TableHead className="text-amber-900 dark:text-gray-300">
                  <Button
                    variant="ghost"
                    className="text-amber-900 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-gray-700"
                    onClick={() => requestSort("checkOutTime")}
                  >
                    Check-Out {getSortIcon("checkOutTime")}
                  </Button>
                </TableHead>
                <TableHead className="text-amber-900 dark:text-gray-300">Working Hours</TableHead>
                <TableHead className="text-amber-900 dark:text-gray-300">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-amber-600 dark:text-gray-500" />
                  </TableCell>
                </TableRow>
              ) : currentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-amber-800 dark:text-gray-400">
                    {dateFilterApplied ? "No records found for the selected date range" : "No records found"}
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map((record) => (
                  <TableRow
                    key={record.id}
                    className="hover:bg-amber-50 dark:hover:bg-gray-800/50 border-b border-amber-200 dark:border-gray-700"
                  >
                    <TableCell className="font-medium text-amber-900 dark:text-gray-300">
                      {new Date(record.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-amber-800 dark:text-gray-400 font-mono">{record.userId}</TableCell>
                    <TableCell className="text-amber-800 dark:text-gray-400 font-medium">{record.name}</TableCell>
                    <TableCell className="text-amber-800 dark:text-gray-400">{record.department}</TableCell>
                    <TableCell className="whitespace-nowrap text-amber-800 dark:text-gray-400">
                      {formatTime(record.checkInTime)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-amber-800 dark:text-gray-400">
                      {record.checkOutTime ? formatTime(record.checkOutTime) : "-"}
                    </TableCell>
                    <TableCell className="text-amber-800 dark:text-gray-400 font-medium">
                      {calculateWorkingHours(record.checkInTime, record.checkOutTime)}
                    </TableCell>
                    <TableCell>
                      {record.checkOutTime ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                          Complete
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">Active</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!loading && sortedData().length > 0 && (
          <div className="mt-6 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer text-amber-800 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-gray-800"
                    }
                  />
                </PaginationItem>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber
                  if (totalPages <= 5) {
                    pageNumber = i + 1
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i
                  } else {
                    pageNumber = currentPage - 2 + i
                  }

                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        onClick={() => paginate(pageNumber)}
                        isActive={pageNumber === currentPage}
                        className={`cursor-pointer ${pageNumber === currentPage ? "bg-amber-700 dark:bg-gray-700 text-white hover:bg-amber-800 dark:hover:bg-gray-600" : "text-amber-800 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-gray-800"}`}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer text-amber-800 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-gray-800"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
