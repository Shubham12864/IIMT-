import { NextRequest, NextResponse } from 'next/server';

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
  const fs = require('fs').promises;
  const path = require('path');
  
  try {
    const paymentsFile = path.join(process.cwd(), 'data', 'custom-payments.json');
    const dataDir = path.dirname(paymentsFile);
    await fs.mkdir(dataDir, { recursive: true });
    
    // Read existing payments
    let payments: Record<string, any> = {};
    try {
      const data = await fs.readFile(paymentsFile, 'utf8');
      payments = JSON.parse(data);
    } catch {
      // File doesn't exist, start with empty object
    }
    
    if (!payments[orderId]) {
      return false; // Payment not found
    }
    
    // Update payment with new data
    payments[orderId] = { ...payments[orderId], ...updates };
    
    // Write back to file
    await fs.writeFile(paymentsFile, JSON.stringify(payments, null, 2));
    
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
