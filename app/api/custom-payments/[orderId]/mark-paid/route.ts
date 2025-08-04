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
    const body = await request.json();
    
    // Update payment status
    const success = await updatePaymentStatus(orderId, {
      status: 'pending_verification',
      userMarkedPaidAt: new Date().toISOString(),
      ...body
    });
    
    if (!success) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }
    
    // Notify admin about new payment verification needed
    await notifyAdmin(orderId);
    
    return NextResponse.json({ success: true, message: 'Payment marked as paid' });
  } catch (error) {
    console.error('Error marking payment as paid:', error);
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
  }
}

async function updatePaymentStatus(orderId: string, updates: any) {
  try {
    // Use global memory storage instead of file system
    if (!global.payments) {
      global.payments = {};
    }
    
    if (!global.payments[orderId]) {
      return false; // Payment not found
    }
    
    // Update payment with new data
    global.payments[orderId] = { ...global.payments[orderId], ...updates };
    
    return true;
  } catch (error) {
    console.error('Error updating payment status:', error);
    return false;
  }
}

async function notifyAdmin(orderId: string) {
  // This is where you would send notification to admin
  // For now, just log it
  console.log(`🔔 New payment verification needed for order: ${orderId}`);
  
  // You can add email/SMS notification here later
  // Example: await sendAdminNotification(`New payment pending verification: ${orderId}`);
}
