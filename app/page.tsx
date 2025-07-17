'use client';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Input } from "@/components/ui/input"
import RegisterModal from '@/components/RegisterModal';
import { toast } from "sonner"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button';
console.log('Header typeof:', typeof Header);
console.log('Footer typeof:', typeof Footer);
console.log('RegisterModal typeof:', typeof RegisterModal); 

export default function Page() {
  const [registers, setRegisters] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch('/api/register/all').then(res => res.json()).then(setRegisters);
  }, []);

  const reload = async () => {
    const res = await fetch('/api/register/all');
    setRegisters(await res.json());
  };

  const handleCheck = async (userId: string, type: 'in' | 'out') => {
    await fetch(`/api/${type === 'in' ? 'checkin' : 'checkout'}`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
      headers: { 'Content-Type': 'application/json' },
    });
    reload();
  };

const monthNames = {
  jan: "01", feb: "02", mar: "03", apr: "04",
  may: "05", jun: "06", jul: "07", aug: "08",
  sep: "09", oct: "10", nov: "11", dec: "12"
};

const query = search.toLowerCase().trim();
const matchedMonth = Object.entries(monthNames).find(([key]) => query.includes(key))?.[1];

const formatTime = (t: string) =>
  t?.slice(0, 19).replace("T", " ").toLowerCase() || "";

const filtered = registers.filter((r) => {
  return (
    r.name?.toLowerCase().includes(query) ||
    r.userId?.toLowerCase().includes(query) ||
    r.laptopBrand?.toLowerCase().includes(query) ||
    formatTime(r.inTime).includes(query) ||
    formatTime(r.outTime).includes(query) ||
    (matchedMonth &&
      (r.inTime?.slice(5, 7) === matchedMonth ||
       r.outTime?.slice(5, 7) === matchedMonth))
  );
});


  const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 7;

const totalPages = Math.ceil(filtered.length / itemsPerPage);

const paginatedData = filtered.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);


  return (
  <div>
    <Header onOpenRegister={() => setShowModal(true)} />
    <RegisterModal 
      show={showModal} 
      onClose={() => setShowModal(false)} 
      onRegistered={reload} 
    />

    <div className="p-4">
      <div className="flex justify-center mb-4">
       <Input
    type="text"
    placeholder="Search..."
    className="w-full max-w-md text-left"
    onChange={(e) => setSearch(e.target.value)}
  />
  <Button type="button" variant="outline">
    Search
  </Button>
      </div>

      <Table className="text-sm rounded-lg shadow-md border border-gray-300 overflow-hidden">
        <TableCaption className="text-left px-4 py-2 text-gray-500">
          A list of check-in/check-out records.
        </TableCaption>
        <TableHeader>
          <TableRow className="bg-gray-100 dark:bg-gray-900 transition-colors duration-300 shadow-sm">
            <TableHead>Name</TableHead>
            <TableHead>User ID</TableHead>
            <TableHead>Laptop</TableHead>
            <TableHead>Check-In</TableHead>
            <TableHead>Check-Out</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
          </TableHeader>
          <TableBody>
  {paginatedData.map((r, i) => (
    <TableRow key={i}> {<><TableCell>{r.name}</TableCell><TableCell>{r.userId}</TableCell><TableCell>{r.laptopBrand}</TableCell><TableCell>{r.inTime?.slice(0, 19).replace('T', '')}</TableCell><TableCell>{r.outTime?.slice(0, 19).replace('T', '')}</TableCell><TableCell className="space-x-2">
      <Button
        onClick={() => handleCheck(r.userId, 'in')}
        variant="default"
        className='bg-orange-300 hover:bg-orange-400 text-white'
        size="sm"
      >
        Check-In
      </Button>
      <Button
        onClick={() => handleCheck(r.userId, 'out')}
         className='bg-gray-400 hover:bg-red-400 text-white'
        size="sm"
      >
        Check-Out
      </Button>
    </TableCell></>
} </TableRow>
  ))}
</TableBody>

    
      </Table>
      </div>
      <div className="flex justify-center mt-4">
      <Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious
        href="#"
        onClick={() =>
          currentPage > 1 && setCurrentPage(currentPage - 1)
        }
      />
    </PaginationItem>

    {[...Array(totalPages)].map((_, index) => (
      <PaginationItem key={index}>
        <PaginationLink
          href="#"
          isActive={currentPage === index + 1}
          onClick={() => setCurrentPage(index + 1)}
        >
          {index + 1}
        </PaginationLink>
      </PaginationItem>
    ))}

    <PaginationItem>
      <PaginationNext
        href="#"
        onClick={() =>
          currentPage < totalPages && setCurrentPage(currentPage + 1)
        }
      />
    </PaginationItem>
  </PaginationContent>
</Pagination>

      </div>

    <Footer />
  </div>
)
}
 


