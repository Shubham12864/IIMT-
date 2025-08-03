"use server"

import { redirect } from 'next/navigation'

interface CustomDonationData {
  name: string
  phone: string
  email?: string
  amount: number
}

export async function createCustomDonation(formData: FormData) {
  try {
    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string
    const amount = formData.get('amount') as string

    // Validate required fields
    if (!name || !phone || !amount) {
      throw new Error('Name, phone, and amount are required')
    }

    // Validate amount
    const donationAmount = parseInt(amount)
    if (isNaN(donationAmount) || donationAmount < 100) {
      throw new Error('Amount must be at least ₹100')
    }

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

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create payment')
    }

    const result = await response.json()

    // Redirect to custom payment page
    redirect(result.paymentUrl)

  } catch (error) {
    console.error('Custom donation creation failed:', error)
    throw error
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
