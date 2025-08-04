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
    
    // Get all payments that are pending verification
    const pendingPayments = Object.entries(global.payments)
      .filter(([_, payment]: [string, any]) => 
        payment.status === 'pending_verification' || payment.status === 'pending_approval'
      )
      .map(([orderId, payment]) => ({
        orderId,
        ...payment
      }));

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
