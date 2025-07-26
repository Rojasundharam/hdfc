import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, Home, Receipt } from 'lucide-react';
import Link from 'next/link';
import { PaymentSuccessHandler } from '@/components/payments/payment-success-handler';
import { ReceiptDownloadButton } from '@/components/payments/receipt-download-button';

interface PaymentSuccessProps {
  searchParams: Promise<{
    order_id?: string;
    transaction_id?: string;
  }>;
}

async function PaymentSuccessContent({ searchParams }: PaymentSuccessProps) {
  const { order_id, transaction_id } = await searchParams;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-600">
            Payment Successful!
          </CardTitle>
          <CardDescription>
            Your payment has been processed successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Details */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h3 className="font-semibold text-gray-900">Payment Details</h3>
            {order_id && (
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono text-sm">{order_id}</span>
              </div>
            )}
            {transaction_id && (
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-mono text-sm">{transaction_id}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="text-green-600 font-semibold">Completed</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center text-gray-600">
            <p>Thank you for your payment. A confirmation email has been sent to your registered email address.</p>
          </div>

          {/* Service Request Handler */}
          {order_id && <PaymentSuccessHandler orderId={order_id} />}

          {/* Action Buttons */}
          <div className="space-y-3">
            <ReceiptDownloadButton 
              orderId={order_id} 
              transactionId={transaction_id} 
            />
            
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" asChild>
                <Link href="/student">
                  <Home className="mr-2 h-4 w-4" />
                  Student Portal
                </Link>
              </Button>
              
              <Button variant="outline" asChild>
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Link>
              </Button>
            </div>
          </div>

          {/* Support Info */}
          <div className="text-center text-sm text-gray-500 border-t pt-4">
            <p>Need help? Contact support with your transaction ID</p>
            <p className="text-xs">Keep this information for your records</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage({ searchParams }: PaymentSuccessProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <PaymentSuccessContent searchParams={searchParams} />
    </Suspense>
  );
} 