'use client';

import { useEffect, useState, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { formatTime } from '@/lib/utils';
import RegisterModal from '@/components/RegisterModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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

interface Register {
  name: string;
  userId: string;
  department?: string;
  laptopBrand?: string;
  inTime?: string;
  outTime?: string;
  [key: string]: any;
}

const QrScanner = dynamic(() => import('@/components/QrScanner'), { ssr: false });

export default function Page() {
  const [registers, setRegisters] = useState<Register[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannedUserId, setScannedUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  } | null>(null);

  useEffect(() => {
    reload();
  }, []);

  const reload = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/register/all');
      const data = await res.json();
      setRegisters(data);
      setCurrentPage(1);
    } catch (error: unknown) {
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
    } catch (error: unknown) {
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
      (val: unknown) => 
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
      return <ArrowUpDown className="ml-2 h-4 w-4 text-amber-600 dark:text-gray-400" />;
    }
    return sortConfig.direction === 'ascending' ? (
      <ArrowUpDown className="ml-2 h-4 w-4 rotate-180 text-amber-600 dark:text-gray-400" />
    ) : (
      <ArrowUpDown className="ml-2 h-4 w-4 text-amber-600 dark:text-gray-400" />
    );
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData().slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedData().length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black">
      <Header onOpenRegister={() => setShowModal(true)} />

      <RegisterModal show={showModal} onClose={() => setShowModal(false)} onRegistered={reload} />

      <main className="flex-1 p-4">
        {/* Centered filter bar */}
        <div className="flex justify-center mb-6">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-amber-500 dark:text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Filter records..."
              className="pl-10 pr-10 border-amber-300 bg-white focus:ring-amber-500 focus:border-amber-500 text-amber-900 dark:border-gray-600 dark:bg-black dark:text-gray-300 dark:focus:ring-gray-500 dark:focus:border-gray-500"
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
                <X className="h-5 w-5 text-amber-500 hover:text-amber-700 dark:text-gray-400 dark:hover:text-gray-300" />
              </button>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-amber-200 dark:border-gray-700 shadow-sm overflow-hidden bg-white dark:bg-black mx-4 sm:mx-8 md:mx-12 lg:mx-16 xl:mx-20">
          <Table>
            <TableHeader className="bg-amber-50 dark:bg-gray-900">
              <TableRow>
                <TableHead className="text-amber-900 dark:text-gray-100">
                  <Button
                    variant="ghost"
                    onClick={() => requestSort('name')}
                    className="p-0 hover:bg-amber-200 dark:hover:bg-gray-500 font-semibold text-amber-900 dark:text-gray-100"
                  >
                    Name
                    {getSortIcon('name')}
                  </Button>
                </TableHead>
                <TableHead className="text-amber-900 dark:text-gray-100">
                  <Button
                    variant="ghost"
                    onClick={() => requestSort('userId')}
                    className="p-0 hover:bg-amber-200 dark:hover:bg-gray-500 font-semibold text-amber-900 dark:text-gray-100"
                  >
                    User ID
                    {getSortIcon('userId')}
                  </Button>
                </TableHead>
                <TableHead className="text-amber-900 dark:text-gray-100">
                  <Button
                    variant="ghost"
                    onClick={() => requestSort('department')}
                    className="p-0 hover:bg-amber-200 dark:hover:bg-gray-500 font-semibold text-amber-900 dark:text-gray-100"
                  >
                    Department
                    {getSortIcon('department')}
                  </Button>
                </TableHead>
                <TableHead className="text-amber-900 dark:text-gray-100">
                  <Button
                    variant="ghost"
                    onClick={() => requestSort('laptopBrand')}
                    className="p-0 hover:bg-amber-200 dark:hover:bg-gray-500 font-semibold text-amber-900 dark:text-gray-100"
                  >
                    Laptop Brand
                    {getSortIcon('laptopBrand')}
                  </Button>
                </TableHead>
                <TableHead className="text-amber-900 dark:text-gray-100">
                  <Button
                    variant="ghost"
                    onClick={() => requestSort('inTime')}
                    className="p-0 hover:bg-amber-200 dark:hover:bg-gray-500 font-semibold text-amber-900 dark:text-gray-100"
                  >
                    Check-In
                    {getSortIcon('inTime')}
                  </Button>
                </TableHead>
                <TableHead className="text-amber-900 dark:text-gray-100">
                  <Button
                    variant="ghost"
                    onClick={() => requestSort('outTime')}
                    className="p-0 hover:bg-amber-200 dark:hover:bg-gray-500 font-semibold text-amber-900 dark:text-gray-100"
                  >
                    Check-Out
                    {getSortIcon('outTime')}
                  </Button>
                </TableHead>
                <TableHead className="w-40 font-semibold text-amber-900 dark:text-gray-100">Actions</TableHead>
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
                  <TableCell colSpan={7} className="h-24 text-center text-amber-800 dark:text-gray-300">
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map((r, i) => (
                  <TableRow key={i} className="hover:bg-amber-50 dark:hover:bg-gray-900 border-b border-amber-200 dark:border-gray-700">
                    <TableCell className="text-amber-900 dark:text-gray-100">{r.name}</TableCell>
                    <TableCell className="text-amber-800 dark:text-gray-300">{r.userId}</TableCell>
                    <TableCell className="text-amber-800 dark:text-gray-300">{r.department || 'General'}</TableCell>
                    <TableCell className="text-amber-800 dark:text-gray-300">{r.laptopBrand || '-'}</TableCell>
                    <TableCell className="whitespace-nowrap text-amber-800 dark:text-gray-300">{formatTime(r.inTime)}</TableCell>
                    <TableCell className="whitespace-nowrap text-amber-800 dark:text-gray-300">{formatTime(r.outTime)}</TableCell>
                    <TableCell className="space-x-1">
                      <Button
                        onClick={() => handleCheck(r.userId, 'in')}
                        className='bg-white hover:bg-amber-200 text-amber-700 border-amber-300 border-2 dark:bg-gray-100 dark:hover:bg-gray-500 dark:text-gray-700 dark:border-gray-500'
                        size="sm"
                      >
                        In
                      </Button>
                      <Button
                        onClick={() => handleCheck(r.userId, 'out')}
                        className='bg-white hover:bg-amber-200 text-amber-700 border-amber-300 border-2 dark:bg-gray-100 dark:hover:bg-gray-500 dark:text-gray-700 dark:border-gray-500'
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

        {!loading && sortedData().length > 0 && (
          <div className="mt-4 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer text-amber-800 hover:bg-amber-100 dark:text-gray-500 dark:hover:bg-gray-600"}
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
                        className={`cursor-pointer ${
                          pageNumber === currentPage 
                            ? 'bg-amber-700 text-white hover:bg-amber-800 dark:bg-gray-600 dark:hover:bg-gray-500' 
                            : 'text-amber-800 hover:bg-amber-100 dark:text-gray-500 dark:hover:bg-gray-600'
                        }`}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext 
                    onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer text-amber-800 hover:bg-amber-100 dark:text-gray-700 dark:hover:bg-gray-600"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </main>

      <div className="fixed bottom-6 right-6 group">
        <button
          onClick={() => setScannerOpen(!scannerOpen)}
          className="bg-amber-700 hover:bg-amber-800 text-white p-3 rounded-full shadow-lg transition-all hover:scale-105 dark:bg-gray-600 dark:hover:bg-gray-500"
        >
          <QrCodeIcon className="h-6 w-6" />
        </button>
        <div className="absolute bottom-full right-0 mb-2 w-48 bg-amber-800 text-white text-sm p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none dark:bg-gray-600">
          <p>🔍 Scan a <strong>User ID QR</strong></p>
          <p>📱 Point camera at QR code</p>
          <p>✅ Auto-check-in on scan</p>
        </div>
      </div>

      {scannerOpen && (
        <div className="fixed bottom-24 right-6 w-[330px] bg-amber-50 border border-amber-200 rounded-lg shadow-lg p-4 z-50 dark:bg-gray-700 dark:border-gray-600">
          <h3 className="text-lg font-semibold mb-2 text-amber-900 dark:text-gray-100">QR Scanner</h3>
          <QrScanner
            onScanSuccess={handleScanSuccess}
          />
          {scannedUserId && (
            <div className="mt-3 space-y-2 text-sm text-amber-800 dark:text-gray-300">
              <p>Scanned ID: <strong className="text-amber-900 dark:text-gray-100">{scannedUserId}</strong></p>
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleCheck(scannedUserId, 'in')} 
                  size="sm" 
                  className="bg-amber-700 hover:bg-amber-800 text-white dark:bg-gray-600 dark:hover:bg-gray-500"
                >
                  Check-In
                </Button>
                <Button 
                  onClick={() => handleCheck(scannedUserId, 'out')} 
                  size="sm" 
                  className="bg-amber-600 hover:bg-amber-700 text-white dark:bg-gray-500 dark:hover:bg-gray-400"
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