import { NextResponse } from 'next/server';

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
    
    console.log('🔍 Global payments object:', global.payments);
    console.log('📊 Total payments in memory:', Object.keys(global.payments).length);
    
    // Get all payments that need admin approval (both new payments and user-confirmed payments)
    const pendingPayments = Object.entries(global.payments)
      .filter(([_, payment]: [string, any]) => 
        payment.status === 'pending_approval' || 
        (payment.status === 'pending_verification' && payment.userConfirmed)
      )
      .map(([orderId, payment]) => ({
        orderId,
        ...payment
      }));

    console.log('🎯 Filtered pending payments:', pendingPayments);

    return NextResponse.json({ 
      payments: pendingPayments,
      count: pendingPayments.length
    });
  } catch (error) {
    console.error('Error fetching pending payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending payments' },
      { status: 500 }
    );
  }
}
