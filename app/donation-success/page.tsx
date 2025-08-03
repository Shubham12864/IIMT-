'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import Image from 'next/image';

function DonationSuccessContent() {
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
          message: 'Thank you for your donation to IIMT Group of Colleges. Your contribution will help us continue our educational mission.',
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
            <Image
              src="/images/iimt-university-logo.png"
              alt="IIMT Group of Colleges Logo"
              width={150}
              height={60}
              className="object-contain"
              priority
            />
          </div>
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

export default function DonationSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Clock className="w-16 h-16 text-yellow-500" />
            </div>
            <CardTitle className="text-2xl">Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <DonationSuccessContent />
    </Suspense>
  );
}
