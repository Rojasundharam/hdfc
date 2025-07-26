'use client';

import { Button } from '@/components/ui/button';
import { Receipt } from 'lucide-react';

interface ReceiptDownloadButtonProps {
  orderId?: string;
  transactionId?: string;
}

export function ReceiptDownloadButton({ orderId, transactionId }: ReceiptDownloadButtonProps) {
  const handleDownload = () => {
    if (!orderId) {
      alert('Order ID is required to generate receipt');
      return;
    }

    const params = new URLSearchParams();
    params.append('order_id', orderId);
    if (transactionId) {
      params.append('transaction_id', transactionId);
    }

    // Open receipt in new tab
    window.open(`/api/payment/receipt?${params.toString()}`, '_blank');
  };

  return (
    <Button 
      className="w-full" 
      variant="outline"
      onClick={handleDownload}
      disabled={!orderId}
    >
      <Receipt className="mr-2 h-4 w-4" />
      Download Receipt
    </Button>
  );
} 