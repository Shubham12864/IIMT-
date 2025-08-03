import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const payment = await getPaymentDetails(orderId);
    
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }
    
    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    return NextResponse.json({ error: 'Failed to fetch payment' }, { status: 500 });
  }
}

async function getPaymentDetails(orderId: string) {
  try {
    // Use in-memory storage for Vercel deployment (since filesystem is read-only)
    // Get from global memory storage
    const payments = global.payments || {};
    const payment = payments[orderId];
    
    if (payment) {
      console.log(`✅ Found payment: ${orderId}`);
      return payment;
    } else {
      console.log(`❌ Payment not found: ${orderId}`);
      return null;
    }
  } catch (error) {
    console.error('Error reading payment from memory:', error);
    return null;
  }
}
