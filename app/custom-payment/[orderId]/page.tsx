"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Smartphone, CheckCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

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

  const merchantUPI = "paytm.s1ok3sz@pty";
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
      const response = await fetch(`/api/custom-payments/${orderId}/mark-paid`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setPaymentConfirmed(true);
      } else {
        setError('Failed to confirm payment');
      }
    } catch (err) {
      setError('Failed to confirm payment');
    } finally {
      setConfirmingPayment(false);
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Please Wait</h2>
            <p className="text-gray-600 mb-4">
              Taking time to confirm payment of ₹{payment?.amount}...
            </p>
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
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-mono text-sm">{orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-semibold text-lg text-green-600">₹{payment.amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Donor:</span>
                      <span>{payment.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Purpose:</span>
                      <span>{payment.purpose}</span>
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
                    className="bg-blue-600 hover:bg-blue-700 text-white py-3 text-sm flex flex-col items-center"
                  >
                    <div className="w-6 h-6 bg-white rounded mb-1 flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-xs">P</span>
                    </div>
                    Paytm
                  </Button>
                  
                  <Button 
                    onClick={() => handleUPIAppClick('phonepe')}
                    className="bg-purple-600 hover:bg-purple-700 text-white py-3 text-sm flex flex-col items-center"
                  >
                    <div className="w-6 h-6 bg-white rounded mb-1 flex items-center justify-center">
                      <span className="text-purple-600 font-bold text-xs">Pe</span>
                    </div>
                    PhonePe
                  </Button>
                  
                  <Button 
                    onClick={() => handleUPIAppClick('googlepay')}
                    className="bg-green-600 hover:bg-green-700 text-white py-3 text-sm flex flex-col items-center"
                  >
                    <div className="w-6 h-6 bg-white rounded mb-1 flex items-center justify-center">
                      <span className="text-green-600 font-bold text-xs">G</span>
                    </div>
                    Google Pay
                  </Button>
                  
                  <Button 
                    onClick={() => handleUPIAppClick('bhim')}
                    className="bg-orange-600 hover:bg-orange-700 text-white py-3 text-sm flex flex-col items-center"
                  >
                    <div className="w-6 h-6 bg-white rounded mb-1 flex items-center justify-center">
                      <span className="text-orange-600 font-bold text-xs">B</span>
                    </div>
                    BHIM
                  </Button>
                  
                  <Button 
                    onClick={() => handleUPIAppClick('amazonpay')}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white py-3 text-sm flex flex-col items-center"
                  >
                    <div className="w-6 h-6 bg-white rounded mb-1 flex items-center justify-center">
                      <span className="text-yellow-600 font-bold text-xs">A</span>
                    </div>
                    Amazon Pay
                  </Button>
                  
                  <Button 
                    onClick={() => handleUPIAppClick('mobikwik')}
                    className="bg-red-600 hover:bg-red-700 text-white py-3 text-sm flex flex-col items-center"
                  >
                    <div className="w-6 h-6 bg-white rounded mb-1 flex items-center justify-center">
                      <span className="text-red-600 font-bold text-xs">M</span>
                    </div>
                    MobiKwik
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <Button 
                    onClick={() => handleUPIAppClick('freecharge')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-sm flex flex-col items-center"
                  >
                    <div className="w-6 h-6 bg-white rounded mb-1 flex items-center justify-center">
                      <span className="text-indigo-600 font-bold text-xs">F</span>
                    </div>
                    Freecharge
                  </Button>
                  
                  <Button 
                    onClick={() => handleUPIAppClick('generic')}
                    variant="outline"
                    className="py-3 text-sm flex flex-col items-center border-2 border-dashed"
                  >
                    <Smartphone className="w-4 h-4 mb-1" />
                    Other UPI
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