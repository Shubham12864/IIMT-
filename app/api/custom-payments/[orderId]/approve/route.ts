import { NextRequest, NextResponse } from 'next/server';

// Use memory storage (compatible with Vercel)
declare global {
  var payments: any;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    
    // Initialize global payments if not exists
    if (!global.payments) {
      global.payments = {};
    }
    
    // Find payment in memory storage
    const payment = global.payments[orderId];
    
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Update payment status to completed
    global.payments[orderId] = {
      ...payment,
      status: 'completed',
      approvedAt: new Date().toISOString(),
      approvedBy: 'admin'
    };

    return NextResponse.json({ 
      success: true, 
      message: 'Payment approved successfully',
      payment: global.payments[orderId]
    });
  } catch (error) {
    console.error('Error approving payment:', error);
    return NextResponse.json(
      { error: 'Failed to approve payment' },
      { status: 500 }
    );
  }
}
