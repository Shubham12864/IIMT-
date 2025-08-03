"use server"

import { redirect } from 'next/navigation'

interface CustomDonationData {
  name: string
  phone: string
  email?: string
  amount: number
}

export async function createCustomDonation(formData: FormData) {
  console.log('🚀 Custom donation server action called');
  
  try {
    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string
    const amount = formData.get('amount') as string

    console.log('📝 Form data received:', { name, phone, email, amount });

    // Validate required fields
    if (!name || !phone || !amount) {
      console.log('❌ Missing required fields');
      throw new Error('Name, phone, and amount are required')
    }

    // Validate amount
    const donationAmount = parseInt(amount)
    if (isNaN(donationAmount) || donationAmount < 100) {
      console.log('❌ Invalid amount:', donationAmount);
      throw new Error('Amount must be at least ₹100')
    }

    console.log('📞 Making API call to create payment...');

    // Create custom payment via API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/custom-payments/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: donationAmount,
        donorName: name,
        donorPhone: phone,
        donorEmail: email
      })
    })

    console.log('📡 API response status:', response.status);

    if (!response.ok) {
      const error = await response.json()
      console.log('❌ API error:', error);
      throw new Error(error.error || 'Failed to create payment')
    }

    const result = await response.json()
    console.log('✅ API success result:', result);

    // Redirect to custom payment page
    console.log('🚀 Redirecting to:', result.paymentUrl);
    redirect(result.paymentUrl)

  } catch (error: any) {
    console.error('Custom donation creation failed:', error)
    
    // In production, redirect errors should be allowed to bubble up
    // Don't intercept NEXT_REDIRECT errors as they're part of normal flow
    if (error?.digest?.startsWith('NEXT_REDIRECT') || error?.message?.includes('NEXT_REDIRECT')) {
      throw error
    }
    
    // Only throw actual application errors
    throw new Error('Failed to process donation. Please try again.')
  }
}

export async function checkCustomPaymentStatus(orderId: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/custom-payments/${orderId}`)
    
    if (!response.ok) {
      return { status: 'not_found' }
    }

    const payment = await response.json()
    return {
      status: payment.status,
      amount: payment.amount,
      donorName: payment.donorName,
      createdAt: payment.createdAt
    }
  } catch (error) {
    console.error('Failed to check payment status:', error)
    return { status: 'error' }
  }
}
