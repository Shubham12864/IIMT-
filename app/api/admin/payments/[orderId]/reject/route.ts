import { NextRequest, NextResponse } from 'next/server';

// Use memory storage (compatible with Vercel)
declare global {
  var payments: any;
}

interface RouteParams {
  params: Promise<{ orderId: string }>;
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { orderId } = await params;
    
    // Initialize global payments if not exists
    if (!global.payments) {
      global.payments = {};
    }

    if (!global.payments[orderId]) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Update payment status to rejected
    global.payments[orderId] = {
      ...global.payments[orderId],
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
      rejectedBy: 'admin'
    };

    console.log(`❌ Payment rejected via admin panel: ${orderId}`);

    return NextResponse.json({ success: true, payment: global.payments[orderId] });
  } catch (error) {
    console.error('Error rejecting payment:', error);
    return NextResponse.json({ error: 'Failed to reject payment' }, { status: 500 });
  }
}
