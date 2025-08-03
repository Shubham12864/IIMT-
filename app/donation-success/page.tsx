'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export default function DonationSuccessPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'success' | 'failed' | 'pending'>('pending');
  
  useEffect(() => {
    const paymentStatus = searchParams.get('status');
    const txnId = searchParams.get('txn_id');
    
    console.log('Payment redirect params:', { paymentStatus, txnId });
    
    if (paymentStatus === 'success') {
      setStatus('success');
    } else if (paymentStatus === 'failed') {
      setStatus('failed');
    } else {
      setStatus('pending');
    }
  }, [searchParams]);

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'failed':
        return <XCircle className="w-16 h-16 text-red-500" />;
      default:
        return <Clock className="w-16 h-16 text-yellow-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'success':
        return {
          title: 'Payment Successful!',
          message: 'Thank you for your donation. Your payment has been processed successfully.',
          color: 'text-green-600'
        };
      case 'failed':
        return {
          title: 'Payment Failed',
          message: 'Sorry, your payment could not be processed. Please try again.',
          color: 'text-red-600'
        };
      default:
        return {
          title: 'Payment Pending',
          message: 'Your payment is being processed. Please wait for confirmation.',
          color: 'text-yellow-600'
        };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className={`text-2xl ${statusInfo.color}`}>
            {statusInfo.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">{statusInfo.message}</p>
          
          <div className="space-y-2">
            <Button 
              onClick={() => window.location.href = '/portal'}
              className="w-full"
            >
              Back to Portal
            </Button>
            {status === 'failed' && (
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/donate'}
                className="w-full"
              >
                Try Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
