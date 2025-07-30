'use client';
import { useRef } from 'react';
import { createPortal } from 'react-dom';
import QRCode from 'react-qr-code';
import { toPng } from 'html-to-image';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface User {
  name: string;
  userId: string;
  laptopBrand: string;
  department?: string;
  inTime?: string;
  outTime?: string;
  history?: { date: string; inTime?: string; outTime?: string }[];
}

interface Props {
  user: User;
  onClose: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

export default function UserDetailModal({ user, onClose, onDelete, onEdit }: Props) {
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownloadQR = () => {
    if (!qrRef.current) return;
    toPng(qrRef.current).then((dataUrl) => {
      const link = document.createElement('a');
      link.download = `${user.name}-qr.png`;
      link.href = dataUrl;
      link.click();
      toast.success('📥 QR code downloaded!');
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-50 bg:transparent backdrop-blur-sm flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 shadow-xl w-[400px] space-y-4 border border-amber-200">
        <h2 className="text-xl font-semibold text-amber-900">User Details</h2>

        {/* Basic Info */}
        <div className="space-y-1 text-sm text-amber-800">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>User ID:</strong> {user.userId}</p>
          <p><strong>Laptop:</strong> {user.laptopBrand}</p>
          <p><strong>Department:</strong> {user.department}</p>
        </div>

        {/* QR Code + Download */}
        <div>
          <p className="mt-3 font-medium text-amber-800">QR Code:</p>
          <div ref={qrRef} className="bg-white p-2 inline-block">
            <QRCode value={user.userId} size={120} />
          </div>
          <Button 
            onClick={handleDownloadQR} 
            className="mt-2 bg-amber-600 hover:bg-amber-700 text-white"
          >
            Download QR
          </Button>
        </div>

        {/* History Preview */}
        <div>
          <h3 className="mt-4 font-semibold text-sm text-amber-800">📅 History</h3>
          <ul className="text-xs space-y-1 mt-1 max-h-40 overflow-y-auto text-amber-700">
            {user.history?.map((entry, i) => (
              <li key={i}>
                {entry.date}: In – {entry.inTime || '—'} / Out – {entry.outTime || '—'}
              </li>
            )) ?? <li>No history found</li>}
          </ul>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-between mt-4">
          <Button 
            onClick={onClose} 
            variant="outline" 
            className="flex justify-center border-amber-600 text-amber-600 hover:bg-amber-50"
          >
            Close
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}