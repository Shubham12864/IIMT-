import { NextRequest, NextResponse } from 'next/server';

// Use memory storage (compatible with Vercel)
declare global {
  var payments: any;
}

export async function GET() {
  try {
    // Initialize global payments if not exists
    if (!global.payments) {
      global.payments = {};
    }

    console.log('🔍 Admin payments API - Global payments:', global.payments);
    console.log('📊 Total payments in memory:', Object.keys(global.payments).length);
    
    // Transform the data to match the interface expected by the frontend
    const transformedPayments = Object.values(global.payments).map((payment: any) => ({
      orderId: payment.orderId,
      amount: payment.amount,
      name: payment.donorName || payment.name,
      email: payment.donorEmail || payment.email,
      phone: payment.donorPhone || payment.phone,
      purpose: payment.purpose || 'Donation',
      donationType: payment.donationType || 'General',
      status: payment.status === 'pending_payment' ? 'created' : 
              payment.status === 'pending_approval' ? 'pending_verification' :
              payment.status === 'userMarkedPaid' ? 'pending_verification' : 
              payment.status,
      createdAt: payment.createdAt,
      userConfirmed: payment.userConfirmed || false,
      userConfirmedAt: payment.userConfirmedAt
    }));
    
    // Sort by creation date (newest first)
    const sortedPayments = transformedPayments.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    console.log('📋 Transformed payments for admin:', sortedPayments);

    return NextResponse.json(sortedPayments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}
