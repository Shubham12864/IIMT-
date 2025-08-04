import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    
    // Update payment status to pending approval
    const success = await updatePaymentStatus(orderId, {
      status: 'pending_approval',
      userConfirmedAt: new Date().toISOString(),
      message: 'User has confirmed payment completion. Waiting for review approval.'
    });
    
    if (!success) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }
    
    console.log(`✅ Payment ${orderId} marked as pending approval by user`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Payment confirmation submitted. Waiting for review approval.',
      status: 'pending_approval'
    });
  } catch (error) {
    console.error('Error marking payment as pending approval:', error);
    return NextResponse.json({ error: 'Failed to update payment status' }, { status: 500 });
  }
}

async function updatePaymentStatus(orderId: string, updates: any) {
  try {
    // Use in-memory storage for Vercel deployment (since filesystem is read-only)
    const payments = global.payments || {};
    const payment = payments[orderId];
    
    if (payment) {
      // Update payment with new status and information
      payments[orderId] = {
        ...payment,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      console.log(`📝 Updated payment ${orderId} status to:`, updates.status);
      return true;
    } else {
      console.log(`❌ Payment not found: ${orderId}`);
      return false;
    }
  } catch (error) {
    console.error('Error updating payment status:', error);
    return false;
  }
}
