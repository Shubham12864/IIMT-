"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Smartphone, CheckCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import QRCodeSVG to avoid SSR issues
const QRCodeSVG = dynamic(() => import('qrcode.react').then(mod => ({ default: mod.QRCodeSVG })), {
  ssr: false,
  loading: () => <div className="w-64 h-64 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">Loading QR...</div>
});

interface CustomPaymentPageProps {
  params: Promise<{ orderId: string }>
}

interface PaymentDetails {
  orderId: string;
  amount: number;
  name: string;
  email: string;
  phone: string;
  purpose: string;
  donationType: string;
  status: string;
  createdAt: string;
}

export default function CustomPaymentPage({ params }: CustomPaymentPageProps) {
  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [orderId, setOrderId] = useState<string>('');
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [showWaitingMessage, setShowWaitingMessage] = useState(false);

  const merchantUPI = "shubham.217@ptsbi";
  const merchantName = "IIMT Group of Colleges";

  useEffect(() => {
    const initializePage = async () => {
      const resolvedParams = await params;
      setOrderId(resolvedParams.orderId);
      await fetchPaymentDetails(resolvedParams.orderId);
    };
    initializePage();
  }, [params]);

  const fetchPaymentDetails = async (orderIdParam: string) => {
    try {
      const response = await fetch(`/api/custom-payments/${orderIdParam}`);
      if (response.ok) {
        const data = await response.json();
        setPayment(data);
      } else {
        setError('Payment not found');
      }
    } catch (err) {
      setError('Failed to load payment details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const generateDynamicUPILink = () => {
    if (!payment) return '';
    
    const upiParams = new URLSearchParams({
      pa: merchantUPI,                                    
      pn: merchantName,                                   
      am: payment.amount.toString(),                      
      cu: 'INR',                                         
      tn: `IIMT Donation - ${payment.name} - Order ${payment.orderId}`, 
      tr: payment.orderId                                
    });
    
    return `upi://pay?${upiParams.toString()}`;
  };

  const handleUPIAppClick = (app: string) => {
    if (!payment) return;
    
    const baseUPILink = generateDynamicUPILink();
    let appSpecificLink = '';
    
    switch (app) {
      case 'paytm':
        appSpecificLink = baseUPILink.replace('upi://', 'paytmmp://');
        break;
      case 'phonepe':
        appSpecificLink = baseUPILink.replace('upi://', 'phonepe://');
        break;
      case 'googlepay':
        appSpecificLink = baseUPILink.replace('upi://', 'tez://upi/');
        break;
      case 'bhim':
        appSpecificLink = baseUPILink.replace('upi://', 'bhim://');
        break;
      case 'amazonpay':
        appSpecificLink = baseUPILink.replace('upi://', 'amazonpay://');
        break;
      case 'mobikwik':
        appSpecificLink = baseUPILink.replace('upi://', 'mobikwik://');
        break;
      case 'freecharge':
        appSpecificLink = baseUPILink.replace('upi://', 'freecharge://');
        break;
      default:
        appSpecificLink = baseUPILink;
    }
    
    try {
      window.location.href = appSpecificLink;
      
      setTimeout(() => {
        if (document.hasFocus()) {
          window.location.href = baseUPILink;
        }
      }, 2000);
    } catch (error) {
      console.error(`Failed to open ${app}:`, error);
      window.location.href = baseUPILink;
    }
  };

  const handlePaymentConfirmation = async () => {
    setConfirmingPayment(true);
    setShowWaitingMessage(true);
    
    try {
      // Mark payment as pending approval instead of paid
      const response = await fetch(`/api/custom-payments/${orderId}/mark-pending-approval`, {
        method: 'POST',
      });
      
      if (response.ok) {
        // Don't set paymentConfirmed=true immediately
        // Instead, keep showing waiting message for support team approval
        setConfirmingPayment(false);
        // showWaitingMessage stays true to show waiting for approval
      } else {
        setError('Failed to submit payment confirmation. Please try again.');
        setConfirmingPayment(false);
        setShowWaitingMessage(false);
      }
    } catch (err) {
      setError('Failed to submit payment confirmation. Please try again.');
      setConfirmingPayment(false);
      setShowWaitingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p>Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If payment is completed, show success message
  if (payment?.status === 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">
              Your payment of ₹{payment?.amount?.toLocaleString('en-IN')} has been successfully processed and approved.
            </p>
            <p className="text-sm text-green-700 mb-4">
              Order ID: {payment.orderId}
            </p>
            {payment.approvedAt && (
              <p className="text-xs text-gray-500 mb-4">
                Approved on: {new Date(payment.approvedAt).toLocaleString()}
              </p>
            )}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-green-600">
                ✅ Thank you for your donation to IIMT Group of Colleges!
              </p>
            </div>
            <Button onClick={() => window.location.href = '/'} className="bg-green-600 hover:bg-green-700">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentConfirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Submitted!</h2>
            <p className="text-gray-600 mb-4">
              Your payment of ₹{payment?.amount} is being verified. You will receive confirmation once it's approved.
            </p>
            <Button onClick={() => window.location.href = '/'}>Return to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showWaitingMessage && confirmingPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Submitting Confirmation</h2>
            <p className="text-gray-600 mb-4">
              Submitting your payment confirmation...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showWaitingMessage && !confirmingPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <Clock className="w-12 h-12 text-blue-600 mx-auto animate-pulse" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Waiting for Payment Review</h2>
            <p className="text-gray-600 mb-4">
              Your payment confirmation has been submitted for ₹{payment?.amount?.toLocaleString('en-IN')}.
            </p>
            <p className="text-sm text-blue-700 mb-4">
              We will review your payment and approve it shortly. Please wait for the confirmation.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-600">
                💡 This process usually takes a few minutes. You will be notified once approved.
              </p>
            </div>
            <Button onClick={() => window.location.href = '/'} variant="outline">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!payment) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white p-4">
      <div className="max-w-md mx-auto">
        <Card className="shadow-xl mb-6">
          <CardHeader className="text-center bg-orange-600 text-white rounded-t-lg">
            <div className="flex justify-center mb-2">
              <img
                src="/images/iimt-university-logo.png"
                alt="IIMT Group of Colleges"
                className="h-12 w-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <CardTitle className="flex items-center justify-center gap-2">
              <Clock className="w-5 h-5" />
              Complete Your Payment
            </CardTitle>
            <div className="text-3xl font-bold mt-2">₹{payment.amount.toLocaleString('en-IN')}</div>
            <div className="text-orange-100 font-mono text-lg">
              Time remaining: {formatTime(timeLeft)}
            </div>
          </CardHeader>
        </Card>

        {timeLeft <= 0 ? (
          <Card className="shadow-xl">
            <CardContent className="text-center py-8">
              <p className="text-red-600 mb-4">Payment session expired</p>
              <Button onClick={() => window.history.back()}>Go Back</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="shadow-xl mb-6">
              <CardContent className="p-6">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-orange-800 mb-3 text-center">Payment Details</h4>
                  <div className="text-sm space-y-3">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-600 font-medium">Order ID:</span>
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{orderId}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-600 font-medium">Amount:</span>
                      <span className="font-bold text-xl text-green-600">₹{payment.amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="border-t border-orange-200 pt-2">
                      <div className="flex justify-between items-start py-1">
                        <span className="text-gray-600 font-medium">Donor:</span>
                        <span className="font-semibold text-right max-w-[200px]">{payment.name}</span>
                      </div>
                      <div className="flex justify-between items-start py-1">
                        <span className="text-gray-600 font-medium">Phone:</span>
                        <span className="text-right">{payment.phone}</span>
                      </div>
                      {payment.email && (
                        <div className="flex justify-between items-start py-1">
                          <span className="text-gray-600 font-medium">Email:</span>
                          <span className="text-right text-sm max-w-[200px] break-words">{payment.email}</span>
                        </div>
                      )}
                    </div>
                    <div className="border-t border-orange-200 pt-2">
                      <div className="flex justify-between items-start py-1">
                        <span className="text-gray-600 font-medium">Purpose:</span>
                        <span className="text-right text-sm max-w-[200px] font-medium text-blue-700">{payment.purpose}</span>
                      </div>
                      <div className="flex justify-between items-start py-1">
                        <span className="text-gray-600 font-medium">Type:</span>
                        <span className="text-right text-sm text-green-700">{payment.donationType}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl mb-6">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-4">
                  📱 Scan QR Code to Pay ₹{payment.amount.toLocaleString('en-IN')}
                </h3>
                
                <div className="bg-white p-4 rounded-lg shadow-inner border-2 border-gray-200 mb-4">
                  <QRCodeSVG 
                    value={generateDynamicUPILink()}
                    size={200}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="M"
                    includeMargin={true}
                    className="mx-auto"
                  />
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="font-semibold text-green-800">✅ Amount Pre-filled: ₹{payment.amount.toLocaleString('en-IN')}</p>
                    <p className="text-green-700">No need to enter amount manually!</p>
                  </div>
                  <p className="text-gray-600">📱 Scan with any UPI app</p>
                  <p className="text-gray-600">💰 Pay to: {merchantUPI}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-center">
                  💳 Or Pay ₹{payment.amount.toLocaleString('en-IN')} with UPI Apps
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={() => handleUPIAppClick('paytm')}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-4 text-sm flex flex-col items-center gap-2 h-auto shadow-md"
                  >
                    <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-lg">₽</span>
                    </div>
                    Paytm
                  </Button>
                  
                  <Button 
                    onClick={() => handleUPIAppClick('phonepe')}
                    className="bg-purple-500 hover:bg-purple-600 text-white py-4 text-sm flex flex-col items-center gap-2 h-auto shadow-md"
                  >
                    <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                      <span className="text-purple-600 font-bold text-lg">☎</span>
                    </div>
                    PhonePe
                  </Button>
                  
                  <Button 
                    onClick={() => handleUPIAppClick('googlepay')}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-4 text-sm flex flex-col items-center gap-2 h-auto shadow-md"
                  >
                    <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-lg">G</span>
                    </div>
                    Google Pay
                  </Button>
                  
                  <Button 
                    onClick={() => handleUPIAppClick('bhim')}
                    className="bg-orange-500 hover:bg-orange-600 text-white py-4 text-sm flex flex-col items-center gap-2 h-auto shadow-md"
                  >
                    <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                      <span className="text-orange-600 font-bold text-lg">₹</span>
                    </div>
                    BHIM
                  </Button>
                  
                  <Button 
                    onClick={() => handleUPIAppClick('amazonpay')}
                    className="bg-orange-400 hover:bg-orange-500 text-white py-4 text-sm flex flex-col items-center gap-2 h-auto shadow-md"
                  >
                    <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                      <span className="text-orange-600 font-bold text-lg">📦</span>
                    </div>
                    Amazon Pay
                  </Button>
                  
                  <Button 
                    onClick={() => handleUPIAppClick('mobikwik')}
                    className="bg-blue-700 hover:bg-blue-800 text-white py-4 text-sm flex flex-col items-center gap-2 h-auto shadow-md"
                  >
                    <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                      <span className="text-blue-700 font-bold text-lg">M</span>
                    </div>
                    MobiKwik
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <Button 
                    onClick={() => handleUPIAppClick('freecharge')}
                    className="bg-blue-400 hover:bg-blue-500 text-white py-4 text-sm flex flex-col items-center gap-2 h-auto shadow-md"
                  >
                    <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-lg">⚡</span>
                    </div>
                    Freecharge
                  </Button>
                  
                  <Button 
                    onClick={() => handleUPIAppClick('generic')}
                    variant="outline"
                    className="py-4 text-sm flex flex-col items-center border-2 border-dashed gap-2 h-auto shadow-md hover:bg-gray-50"
                  >
                    <Smartphone className="w-6 h-6" />
                    Other UPI Apps
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl">
              <CardContent className="p-6">
                <div className="border-t pt-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-blue-800 mb-2">📋 Payment Instructions:</h4>
                    <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                      <li>QR code contains pre-filled amount of ₹{payment.amount.toLocaleString('en-IN')}</li>
                      <li>UPI app buttons will open with exact amount</li>
                      <li>Verify the amount before confirming payment</li>
                      <li>Complete the payment in your UPI app</li>
                      <li>Click "I have completed the payment" only after successful payment</li>
                    </ol>
                  </div>
                  
                  <p className="text-center text-sm text-gray-600 mb-4">
                    After completing payment of ₹{payment.amount.toLocaleString('en-IN')}, click below to confirm:
                  </p>
                  <Button 
                    onClick={handlePaymentConfirmation}
                    disabled={confirmingPayment}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
                  >
                    {confirmingPayment ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Confirming...
                      </div>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        I have completed the payment of ₹{payment.amount.toLocaleString('en-IN')}
                      </>
                    )}
                  </Button>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    This payment link will expire in {formatTime(timeLeft)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}