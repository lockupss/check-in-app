'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Download, Loader2, Search, X, ArrowUpDown, Eye, Edit, Trash2, LogIn, LogOut, MoreHorizontal, CalendarDays, Filter } from 'lucide-react';
import { formatTime } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import QRCode from 'react-qr-code';
import EditUserModal from '@/components/EditUserModal';
import UserDetailModal from '@/components/UserDetailModal';
import * as Menubar from '@radix-ui/react-menubar';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [registers, setRegisters] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);
  const [dateFilterApplied, setDateFilterApplied] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/login?callbackUrl=/dashboard');
    } else if (status === 'authenticated') {
      if (session?.user?.role?.toUpperCase() === 'ADMIN') {
        setAuthChecked(true);
      } else {
        redirect('/');
      }
    }
  }, [status, session]);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (authChecked) {
      reload();
    }
  }, [authChecked]);

  const reload = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/register/all');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setRegisters(data);
    } catch (error) {
      toast.error('Failed to load data');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: registers.length,
    checkedInToday: registers.filter(r => r.inTime?.startsWith(today)).length,
    checkedOutToday: registers.filter(r => r.outTime?.startsWith(today)).length,
    activeNow: registers.filter(r => r.inTime && !r.outTime).length,
  };

  const filterByDateRange = (user: any) => {
    if (!dateFilterApplied) return true;
    
    const startDate = new Date(dateRange[0].startDate);
    const endDate = new Date(dateRange[0].endDate);
    endDate.setHours(23, 59, 59, 999);
    
    const userInDate = user.inTime ? new Date(user.inTime) : null;
    const userOutDate = user.outTime ? new Date(user.outTime) : null;
    
    return (
      (userInDate && userInDate >= startDate && userInDate <= endDate) ||
      (userOutDate && userOutDate >= startDate && userOutDate <= endDate) ||
      (userInDate && userOutDate && userInDate <= startDate && userOutDate >= endDate)
    );
  };

  const filteredData = registers.filter(r =>
    filterByDateRange(r) &&
    Object.values(r).some(
      (val: any) => val?.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  const sortedData = useCallback(() => {
    if (!sortConfig) return filteredData;
    return [...filteredData].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig?.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown className="ml-1 h-3 w-3 text-amber-600 dark:text-gray-400" />;
    return sortConfig.direction === 'ascending' ? (
      <ArrowUpDown className="ml-1 h-3 w-3 rotate-180 text-amber-600 dark:text-gray-400" />
    ) : (
      <ArrowUpDown className="ml-1 h-3 w-3 text-amber-600 dark:text-gray-400" />
    );
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData().slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedData().length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const applyDateFilter = () => {
    setDateFilterApplied(true);
    setShowDatePicker(false);
    setCurrentPage(1);
  };

  const clearDateFilter = () => {
    setDateFilterApplied(false);
    setCurrentPage(1);
  };

  const exportToCSV = async () => {
    try {
      setExporting(true);
      const headers = ['Name', 'User ID', 'Department', 'Laptop Brand', 'Check-In', 'Check-Out'].join(',');
      
      const rows = filteredData.map(item => 
        [item.name, item.userId, item.department || 'General', item.laptopBrand || '-', 
         formatTime(item.inTime), formatTime(item.outTime)]
        .map(field => `"${field || ''}"`)
        .join(',')
      ).join('\n');
      
      const csvContent = `${headers}\n${rows}`;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `users_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Export completed');
    } catch (error) {
      toast.error('Export failed');
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  const handleCheck = async (userId: string, type: 'in' | 'out') => {
    try {
      const res = await fetch(`/api/${type === 'in' ? 'checkin' : 'checkout'}`, {
        method: 'POST',
        body: JSON.stringify({ userId }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        toast.success(`✅ ${type === 'in' ? 'Check-in' : 'Check-out'} successful`);
        reload();
      } else {
        throw new Error(await res.text());
      }
    } catch (error) {
      toast.error(`❌ Failed to ${type === 'in' ? 'check-in' : 'check-out'}`);
      console.error(error);
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      const response = await fetch(`/api/register/${userId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        toast.success('User deleted');
        reload();
      }
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const downloadQRCode = (userId: string) => {
    const svg = document.getElementById(`qr-code-${userId}`);
    const svgData = new XMLSerializer().serializeToString(svg!);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `${userId}-qrcode.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  const getStatusBadge = (user: any) => {
    if (!user.inTime) return (
      <div className="inline-flex items-center rounded-full border border-amber-200 dark:border-gray-300 px-2.5 py-0.5 text-xs font-semibold bg-amber-50 dark:bg-gray-100 text-amber-800 dark:text-gray-800">
        Not Checked In
      </div>
    );
    if (user.inTime && !user.outTime) return (
      <div className="inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold bg-amber-700 dark:bg-gray-600 text-white">
        Checked In
      </div>
    );
    return (
      <div className="inline-flex items-center rounded-full border border-amber-200 dark:border-gray-300 px-2.5 py-0.5 text-xs font-semibold bg-amber-50 dark:bg-gray-100 text-amber-800 dark:text-gray-800">
        Checked Out
      </div>
    );
  };

 if (status === 'loading' || !authChecked) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-black">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600 dark:text-gray-500" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black">
      <Header />
      
      <div className="flex-1 p-6">
        <div className="flex justify-center items-center mb-6">
          <div className="border border-amber-300 dark:border-gray-300 rounded-md px-6 py-4 shadow-sm dark:shadow-gray-200 bg-white dark:bg-gray-900">
            <h2 className="text-3xl font-bold text-amber-900 dark:text-gray-300 text-center">
              Welcome, {session?.user?.name || session?.user?.email}
            </h2>
          </div>
        </div>

        {/* Search, Filter and Export */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mx-4 sm:mx-8 md:mx-12 lg:mx-16 xl:mx-20 mb-8">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500 dark:text-gray-500" />
            <Input
              placeholder="Filter records..."
              className="pl-10 border-amber-300 dark:border-gray-300 bg-white dark:bg-gray-900 focus-visible:ring-amber-400 dark:focus-visible:ring-gray-400 text-amber-900 dark:text-gray-300"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
            {search && (
              <X 
                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 cursor-pointer text-amber-500 dark:text-gray-500 hover:text-amber-700 dark:hover:text-gray-400"
                onClick={() => setSearch('')}
              />
            )}
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <Button 
                variant="outline" 
                onClick={() => setShowDatePicker(!showDatePicker)}
                className={`flex items-center gap-2 border-amber-300 dark:border-gray-300 text-amber-800 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-gray-800 ${dateFilterApplied ? 'bg-amber-50 dark:bg-gray-800' : ''}`}
              >
                <Filter className="h-4 w-4 text-amber-600 dark:text-gray-400" />
                {dateFilterApplied ? 
                  `${dateRange[0].startDate.toLocaleDateString()} - ${dateRange[0].endDate.toLocaleDateString()}` : 
                  'Filter by Date'}
              </Button>
              
              {showDatePicker && (
                <div className="absolute right-0 mt-2 z-10 shadow-lg bg-white dark:bg-gray-900 border border-amber-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <DateRange
                    editableDateInputs={true}
                    onChange={item => setDateRange([item.selection])}
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
              {exporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
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
                  <Button variant="ghost" className="text-amber-900 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-gray-700" onClick={() => requestSort('name')}>
                    Name {getSortIcon('name')}
                  </Button>
                </TableHead>
                <TableHead className="text-amber-900 dark:text-gray-300">
                  <Button variant="ghost" className="text-amber-900 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-gray-700" onClick={() => requestSort('userId')}>
                    User ID {getSortIcon('userId')}
                  </Button>
                </TableHead>
                <TableHead className="text-amber-900 dark:text-gray-300">
                  <Button variant="ghost" className="text-amber-900 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-gray-700" onClick={() => requestSort('department')}>
                    Department {getSortIcon('department')}
                  </Button>
                </TableHead>
                <TableHead className="text-amber-900 dark:text-gray-300">Status</TableHead>
                <TableHead className="text-amber-900 dark:text-gray-300">
                  <Button variant="ghost" className="text-amber-900 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-gray-700" onClick={() => requestSort('inTime')}>
                    Check-In {getSortIcon('inTime')}
                  </Button>
                </TableHead>
                <TableHead className="text-amber-900 dark:text-gray-300">
                  <Button variant="ghost" className="text-amber-900 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-gray-700" onClick={() => requestSort('outTime')}>
                    Check-Out {getSortIcon('outTime')}
                  </Button>
                </TableHead>
                <TableHead className="text-amber-900 dark:text-gray-300 w-40">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-amber-600 dark:text-gray-500" />
                  </TableCell>
                </TableRow>
              ) : currentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-amber-800 dark:text-gray-400">
                    {dateFilterApplied ? 
                      'No records found for the selected date range' : 
                      'No records found'}
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map((user) => (
                  <TableRow key={user.userId} className="hover:bg-amber-50 dark:hover:bg-gray-800/50 border-b border-amber-200 dark:border-gray-700">
                    <TableCell className="font-medium text-amber-900 dark:text-gray-300">{user.name}</TableCell>
                    <TableCell className="text-amber-800 dark:text-gray-400">{user.userId}</TableCell>
                    <TableCell className="text-amber-800 dark:text-gray-400">{user.department || 'General'}</TableCell>
                    <TableCell>{getStatusBadge(user)}</TableCell>
                    <TableCell className="whitespace-nowrap text-amber-800 dark:text-gray-400">{formatTime(user.inTime)}</TableCell>
                    <TableCell className="whitespace-nowrap text-amber-800 dark:text-gray-400">{formatTime(user.outTime)}</TableCell>
                    <TableCell className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-amber-300 dark:border-gray-600 text-amber-800 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-gray-700 hover:text-amber-900 dark:hover:text-gray-200"
                        onClick={() => {
                          setSelectedUser(user);
                          setDetailModalOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {detailModalOpen && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setDetailModalOpen(false)}
          onDelete={() => {
            handleDelete(selectedUser.userId);
            setDetailModalOpen(false);
          }}
          onEdit={() => {
            setEditModalOpen(true);
            setDetailModalOpen(false);
          }}
        />
      )}
                      
                      <Menubar.Root>
                        <Menubar.Menu>
                          <Menubar.Trigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-amber-300 dark:border-gray-600 text-amber-800 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-gray-700 hover:text-amber-900 dark:hover:text-gray-200"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </Menubar.Trigger>
                          <Menubar.Portal>
                            <Menubar.Content className="min-w-[220px] bg-white dark:bg-gray-900 rounded-md shadow-lg p-1 z-50 border border-amber-200 dark:border-gray-700">
                              <Menubar.Item 
                                className="flex items-center px-2 py-1.5 text-sm rounded hover:bg-amber-100 dark:hover:bg-gray-800 cursor-pointer text-amber-900 dark:text-gray-300"
                                onClick={() => handleCheck(user.userId, 'in')}
                              >
                                <LogIn className="mr-2 h-4 w-4 text-amber-700 dark:text-gray-400" />
                                Check In
                              </Menubar.Item>
                              <Menubar.Item 
                                className="flex items-center px-2 py-1.5 text-sm rounded hover:bg-amber-100 dark:hover:bg-gray-800 cursor-pointer text-amber-900 dark:text-gray-300"
                                onClick={() => handleCheck(user.userId, 'out')}
                              >
                                <LogOut className="mr-2 h-4 w-4 text-amber-700 dark:text-gray-400" />
                                Check Out
                              </Menubar.Item>
                              <Menubar.Separator className="h-px bg-amber-200 dark:bg-gray-700 m-1" />
                              <Menubar.Item 
                                className="flex items-center px-2 py-1.5 text-sm rounded hover:bg-amber-100 dark:hover:bg-gray-800 cursor-pointer text-amber-900 dark:text-gray-300"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setEditModalOpen(true);
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4 text-amber-700 dark:text-gray-400" />
                                Edit
                              </Menubar.Item>
                              <Menubar.Item 
                                className="flex items-center px-2 py-1.5 text-sm rounded hover:bg-amber-100 dark:hover:bg-gray-800 cursor-pointer text-red-600 hover:text-red-700"
                                onClick={() => handleDelete(user.userId)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </Menubar.Item>
                            </Menubar.Content>
                          </Menubar.Portal>
                        </Menubar.Menu>
                      </Menubar.Root>
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
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer text-amber-800 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-gray-800"}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }
                  
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        onClick={() => paginate(pageNumber)}
                        isActive={pageNumber === currentPage}
                        className={`cursor-pointer ${pageNumber === currentPage ? 'bg-amber-700 dark:bg-gray-700 text-white hover:bg-amber-800 dark:hover:bg-gray-600' : 'text-amber-800 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-gray-800'}`}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext 
                    onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer text-amber-800 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-gray-800"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
      {/* Edit User Modal */}
    {selectedUser && editModalOpen && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedUser(null);
          }}
          onSave={async (updatedUser) => {
            try {
              const res = await fetch('/api/register/update', {
                method: 'PUT',
                headers:{ 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedUser),
              });

              if (res.ok) {
                toast.success('✅ User updated successfully');
                reload();
              } else {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to update user');
              }
            } catch (err) {
              console.error('Update error:', err);
              toast.error(`❌ ${err instanceof Error ? err.message : 'Failed to update user'}`);
            } finally {
              setEditModalOpen(false);
              setSelectedUser(null);
            }
          }}
        />
      )}
      
      <Footer />
    </div>
  );
}