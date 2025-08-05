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
  const modalRef = useRef<HTMLDivElement>(null);

  const handleDownloadQR = async () => {
    try {
      if (!qrRef.current) {
        toast.error('QR code element not found');
        return;
      }
      
    
      const dataUrl = await toPng(qrRef.current);
      
      const link = document.createElement('a');
      link.download = `${user.name}-qr.png`;
      link.href = dataUrl;
      link.click();
      toast.success('QR code downloaded successfully!');
    } catch (error) {
      console.error('QR download error:', error);
      toast.error('Failed to download QR code');
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg p-6 shadow-xl w-[400px] max-w-[95vw] max-h-[90vh] overflow-y-auto border border-amber-200"
      >
        <h2 className="text-xl font-semibold text-amber-900">User Details</h2>

        {/* Basic Info */}
        <div className="space-y-1 text-sm text-amber-800 mt-4">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>User ID:</strong> {user.userId}</p>
          <p><strong>Laptop:</strong> {user.laptopBrand || 'N/A'}</p>
          <p><strong>Department:</strong> {user.department || 'N/A'}</p>
        </div>

        {/* QR Code + Download */}
        <div className="mt-4">
          <p className="font-medium text-amber-800">QR Code:</p>
          <div ref={qrRef} className="bg-white p-2 inline-block mt-2">
            <QRCode 
              value={user.userId} 
              size={120}
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>
          <Button 
            onClick={handleDownloadQR}
            className="mt-3 bg-amber-600 hover:bg-amber-700 text-white"
          >
            Download QR Code
          </Button>
        </div>

        {/* History Preview */}
        {user.history && user.history.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold text-sm text-amber-800">📅 History</h3>
            <ul className="text-xs space-y-1 mt-2 max-h-40 overflow-y-auto text-amber-700">
              {user.history.map((entry, i) => (
                <li key={i} className="py-1 border-b border-amber-100 last:border-0">
                  {entry.date}: In – {entry.inTime || '—'} / Out – {entry.outTime || '—'}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-amber-100">
          <Button 
            onClick={onClose}
            variant="outline"
            className="border-amber-600 text-amber-600 hover:bg-amber-50"
            size="sm"
          >
            Close
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}