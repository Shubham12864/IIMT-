'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Heart, Shield, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { createCustomDonation } from '@/app/actions/custom-donation-actions';
import Image from 'next/image';

const PRESET_AMOUNTS = [5000, 10000, 20000, 50000];

export default function DonatePage() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAmountConfirmation, setShowAmountConfirmation] = useState(false);

  const finalAmount = selectedAmount || (customAmount ? parseFloat(customAmount) : 0);
  const isFormValid = finalAmount >= 10 && name.trim() && phoneNumber.length === 10;

  // Reset error when form changes
  const resetState = () => {
    setError('');
    setSuccess('');
  };

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
    resetState();
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    if (value) {
      setSelectedAmount(null);
    }
    resetState();
  };

  const handlePhoneChange = (value: string) => {
    // Only allow digits and limit to 10 characters
    const digits = value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(digits);
    resetState();
  };

  const validateForm = () => {
    if (finalAmount < 10) {
      setError('Minimum donation amount is ₹10');
      return false;
    }

    if (!name.trim()) {
      setError('Please enter your full name');
      return false;
    }

    if (phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return false;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Show amount confirmation dialog
    setShowAmountConfirmation(true);
  };

  const confirmAndProceed = async () => {
    setShowAmountConfirmation(false);
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('amount', finalAmount.toString());
      formData.append('name', name.trim());
      formData.append('phone', phoneNumber);
      formData.append('email', email.trim());

      console.log('🚀 Submitting custom donation form with data:', {
        amount: finalAmount,
        name: name.trim(),
        phone: phoneNumber,
        email: email.trim()
      });

      // Use custom donation system instead of UPI Gateway
      await createCustomDonation(formData);
      
      // The function will redirect automatically, so no need for additional handling

    } catch (error: any) {
      console.error('❌ Custom donation creation failed:', error);
      
      // Don't show redirect errors as they are expected behavior
      if (error?.digest?.startsWith('NEXT_REDIRECT')) {
        // This is a successful redirect, not an actual error
        return;
      }
      
      setError((error as Error).message || 'Failed to create payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Image
                src="/images/iimt-group-logo.png"
                alt="IIMT Group of Colleges Logo"
                width={200}
                height={80}
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Support IIMT Group of Colleges</h1>
            <p className="text-gray-600">Your contribution helps us continue our educational mission and support our students</p>
          </div>
        </div>

        {/* 🔥 Amount Confirmation Modal */}
        {showAmountConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader className="bg-blue-600 text-white rounded-t-lg">
                <CardTitle className="text-center">Confirm Your Donation</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="text-4xl font-bold text-blue-600">
                    ₹{finalAmount.toLocaleString('en-IN')}
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                    <h4 className="font-semibold text-blue-800 mb-2">Donation Details:</h4>
                    <div className="space-y-1 text-sm text-blue-700">
                      <div className="flex justify-between">
                        <span>Amount:</span>
                        <span className="font-semibold">₹{finalAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Donor:</span>
                        <span>{name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Phone:</span>
                        <span>{phoneNumber}</span>
                      </div>
                      {email && (
                        <div className="flex justify-between">
                          <span>Email:</span>
                          <span>{email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-green-800 text-sm">
                      ✅ You will get a <strong>dynamic QR code</strong> with amount <strong>₹{finalAmount.toLocaleString('en-IN')}</strong> pre-filled
                    </p>
                    <p className="text-green-700 text-xs mt-1">
                      No need to enter amount manually in UPI apps!
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAmountConfirmation(false)}
                      className="flex-1"
                    >
                      ← Back to Edit
                    </Button>
                    <Button 
                      onClick={confirmAndProceed}
                      disabled={isLoading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </div>
                      ) : (
                        'Proceed to Pay'
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-center">Donation Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Amount Selection */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Select Amount (₹)
                </Label>
                
                {/* Preset Amounts */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PRESET_AMOUNTS.map((amount) => (
                    <Button
                      key={amount}
                      type="button"
                      variant={selectedAmount === amount ? "default" : "outline"}
                      onClick={() => handleAmountSelect(amount)}
                      className="h-12"
                    >
                      ₹{amount}
                    </Button>
                  ))}
                </div>

                {/* Custom Amount */}
                <div>
                  <Label htmlFor="customAmount">Or enter custom amount</Label>
                  <Input
                    id="customAmount"
                    type="number"
                    placeholder="Enter amount (min ₹10)"
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    min="10"
                    step="1"
                  />
                </div>

                {finalAmount > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-blue-800 font-semibold">
                      Donation Amount: ₹{finalAmount.toLocaleString('en-IN')}
                    </p>
                  </div>
                )}
              </div>

              {/* Personal Details */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Personal Information</Label>
                
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Mobile Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={phoneNumber}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    maxLength={10}
                    required
                  />
                  {phoneNumber && phoneNumber.length !== 10 && (
                    <p className="text-sm text-red-600 mt-1">
                      Please enter a valid 10-digit mobile number
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <Shield className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-green-800 font-medium">Secure Payment</p>
                    <p className="text-sm text-green-700">
                      Your payment is processed securely through UPI Gateway. We don't store your payment information.
                    </p>
                  </div>
                </div>
              </div>

              {/* Success Message */}
              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              {/* Error Message */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors text-lg"
                disabled={isLoading || !isFormValid}
                size="lg"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : finalAmount > 0 ? (
                  `Donate ₹${finalAmount.toLocaleString('en-IN')} Now`
                ) : (
                  'Donate Now'
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                You will be redirected to a secure payment gateway to complete your donation.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
