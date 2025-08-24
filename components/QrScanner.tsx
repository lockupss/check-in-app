'use client';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect } from 'react';
import { toast } from 'sonner'; // For feedback to users

interface QrScannerProps {
  onScanSuccess: (userId: string) => void;
  boxSize?: number;
  className?: string;
}

export default function QrScanner({ onScanSuccess, boxSize = 250, className = '' }: QrScannerProps) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: boxSize },
      false
    );

    scanner.render(
      (decodedText) => {
        toast.success(`QR scanned: ${decodedText}`);
        onScanSuccess(decodedText);
      },
      (error) => {
        // Silent error handling or log if needed
        console.warn('QR scan error:', error);
      }
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [onScanSuccess]);

  return (
    <div className="p-4 border rounded shadow bg-white">
      <h2 className="mb-2 text-lg font-semibold">QR Check-In Scanner</h2>
      <div id="qr-reader" />
    </div>
  );
}
