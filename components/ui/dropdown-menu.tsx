'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RegisterModal from '@/components/RegisterModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { QrCodeIcon } from '@heroicons/react/24/outline';
import { Search, X, ArrowUpDown } from 'lucide-react';
import { Loader2 } from 'lucide-react';
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
import { formatTime } from '@/lib/utils';

const QrScanner = dynamic(() => import('@/components/QrScanner'), { ssr: false });

export default function Page() {
  // Data state
  const [registers, setRegisters] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannedUserId, setScannedUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  } | null>(null);

  // Column visibility with checkboxes
  const [columnVisibility, setColumnVisibility] = useState({
    name: true,
    userId: true,
    department: true,
    laptopBrand: true,
    inTime: true,
    outTime: true,
  });

  const columns = [
    { id: 'name', label: 'Name' },
    { id: 'userId', label: 'User ID' },
    { id: 'department', label: 'Department' },
    { id: 'laptopBrand', label: 'Laptop Brand' },
    { id: 'inTime', label: 'Check-In' },
    { id: 'outTime', label: 'Check-Out' },
  ];

  useEffect(() => {
    reload();
  }, []);

  const reload = async () => {
    try {
      setLoading(true);
      let data: any[] = []
      try {
        const res = await fetch('/api/register/all');
        if (res.ok) data = await res.json();
      } catch (err) {
        console.warn('Failed to fetch server registers, using local fallback if present', err);
        data = [];
      }

      let local: any[] = []
      try { local = JSON.parse(localStorage.getItem('local-registers') || '[]') } catch (e) { local = [] }
      setRegisters([...(data || []), ...local]);
      setCurrentPage(1);
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
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
        toast.success(`✅ ${type} success for ${userId}`);
        reload();
        if (scannerOpen) {
          setScannedUserId('');
          setTimeout(() => {
            setScannerOpen(false);
          }, 2000);
        }
      } else {
        throw new Error(await res.text());
      }
    } catch (error) {
      toast.error(`❌ Failed to ${type} ${userId}`);
      console.error(error);
    }
  };

  const handleScanSuccess = (userId: string) => {
    setScannedUserId(userId);
    toast.success(`QR scanned: ${userId}`);
  };

  const filteredData = registers.filter(r =>
    Object.values(r).some(
      (val: any) => 
        val?.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  const sortedData = useCallback(() => {
    if (!sortConfig) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      if (a[sortConfig.key] === null || a[sortConfig.key] === undefined) return 1;
      if (b[sortConfig.key] === null || b[sortConfig.key] === undefined) return -1;
      
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
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortConfig.direction === 'ascending' ? (
      <ArrowUpDown className="ml-2 h-4 w-4 rotate-180" />
    ) : (
      <ArrowUpDown className="ml-2 h-4 w-4" />
    );
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData().slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedData().length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const visibleColumnsCount = Object.values(columnVisibility).filter(Boolean).length;

  return (
    <div className="min-h-screen flex flex-col">
      <Header onOpenRegister={() => setShowModal(true)} />

      <RegisterModal show={showModal} onClose={() => setShowModal(false)} onRegistered={reload} />

      <main className="flex-1 p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search Filter */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Filter records..."
              className="pl-10 pr-10"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Column Visibility Checkboxes */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 bg-white p-3 rounded-md border shadow-sm">
            {columns.map((column) => (
              <div key={column.id} className="flex items-center space-x-2">
                <Checkbox
                  id={column.id}
                  checked={columnVisibility[column.id as keyof typeof columnVisibility]}
                  onChange={(e) =>
                    setColumnVisibility({ ...columnVisibility, [column.id]: e.target.checked })
                  }
                />
                <label htmlFor={column.id} className="text-sm font-medium leading-none">
                  {column.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border shadow-lg overflow-hidden bg-white">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                {columnVisibility.name && (
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => requestSort('name')}
                      className="p-0 hover:bg-transparent font-semibold"
                    >
                      Name
                      {getSortIcon('name')}
                    </Button>
                  </TableHead>
                )}
                {columnVisibility.userId && (
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => requestSort('userId')}
                      className="p-0 hover:bg-transparent font-semibold"
                    >
                      User ID
                      {getSortIcon('userId')}
                    </Button>
                  </TableHead>
                )}
                {columnVisibility.department && (
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => requestSort('department')}
                      className="p-0 hover:bg-transparent font-semibold"
                    >
                      Department
                      {getSortIcon('department')}
                    </Button>
                  </TableHead>
                )}
                {columnVisibility.laptopBrand && (
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => requestSort('laptopBrand')}
                      className="p-0 hover:bg-transparent font-semibold"
                    >
                      Laptop Brand
                      {getSortIcon('laptopBrand')}
                    </Button>
                  </TableHead>
                )}
                {columnVisibility.inTime && (
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => requestSort('inTime')}
                      className="p-0 hover:bg-transparent font-semibold"
                    >
                      Check-In
                      {getSortIcon('inTime')}
                    </Button>
                  </TableHead>
                )}
                {columnVisibility.outTime && (
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => requestSort('outTime')}
                      className="p-0 hover:bg-transparent font-semibold"
                    >
                      Check-Out
                      {getSortIcon('outTime')}
                    </Button>
                  </TableHead>
                )}
                <TableHead className="w-40 font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={visibleColumnsCount + 1} className="h-24 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : currentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={visibleColumnsCount + 1} className="h-24 text-center">
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map((r, i) => (
                  <TableRow key={i} className="hover:bg-gray-50">
                    {columnVisibility.name && <TableCell>{r.name}</TableCell>}
                    {columnVisibility.userId && <TableCell>{r.userId}</TableCell>}
                    {columnVisibility.department && <TableCell>{r.department || 'General'}</TableCell>}
                    {columnVisibility.laptopBrand && <TableCell>{r.laptopBrand || '-'}</TableCell>}
                    {columnVisibility.inTime && <TableCell className="whitespace-nowrap">{formatTime(r.inTime)}</TableCell>}
                    {columnVisibility.outTime && <TableCell className="whitespace-nowrap">{formatTime(r.outTime)}</TableCell>}
                    <TableCell className="space-x-1">
                      <Button
                        onClick={() => handleCheck(r.userId, 'in')}
                        className='bg-orange-300 hover:bg-orange-400 text-white'
                        size="sm"
                      >
                        In
                      </Button>
                      <Button
                        onClick={() => handleCheck(r.userId, 'out')}
                        className='bg-gray-500 hover:bg-gray-600 text-white'
                        size="sm"
                      >
                        Out
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!loading && sortedData().length > 0 && (
          <div className="mt-4 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
                        className="cursor-pointer"
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext 
                    onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </main>

      {/* QR Scanner Button */}
      <div className="fixed bottom-6 right-6 group">
        <button
          onClick={() => setScannerOpen(!scannerOpen)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all hover:scale-105"
        >
          <QrCodeIcon className="h-6 w-6" />
        </button>
        <div className="absolute bottom-full right-0 mb-2 w-48 bg-gray-800 text-white text-sm p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <p>🔍 Scan a <strong>User ID QR</strong></p>
          <p>📱 Point camera at QR code</p>
          <p>✅ Auto-check-in on scan</p>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {scannerOpen && (
        <div className="fixed bottom-24 right-6 w-[330px] bg-white border rounded-lg shadow-lg p-4 z-50 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-2">QR Scanner</h3>
          <QrScanner
            onScanSuccess={handleScanSuccess}
          />
          {scannedUserId && (
            <div className="mt-3 space-y-2 text-sm">
              <p>Scanned ID: <strong>{scannedUserId}</strong></p>
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleCheck(scannedUserId, 'in')} 
                  size="sm" 
                  className="bg-orange-500 text-white"
                >
                  Check-In
                </Button>
                <Button 
                  onClick={() => handleCheck(scannedUserId, 'out')} 
                  size="sm" 
                  className="bg-gray-600 text-white"
                >
                  Check-Out
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <Footer />
    </div>
  );
}