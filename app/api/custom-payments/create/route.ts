import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🚀 Custom payment API called');
  
  try {
    const { amount, donorName, donorPhone, donorEmail } = await request.json();
    
    console.log('📝 Received data:', { amount, donorName, donorPhone, donorEmail });
    
    // Validate required fields
    if (!amount || !donorName || !donorPhone) {
      console.log('❌ Missing required fields');
      return NextResponse.json({ 
        error: 'Missing required fields: amount, donorName, donorPhone' 
      }, { status: 400 });
    }
    
    // Generate proper order ID
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').substring(0, 14);
    const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    const orderId = `IIMT${timestamp}${randomNum}`;
    
    // Create payment record
    const paymentData = {
      orderId,
      amount: parseInt(amount),
      donorName,
      donorPhone,
      donorEmail: donorEmail || '',
      status: 'pending_payment',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes expiry
      paymentMethod: 'custom_qr'
    };
    
    // Save payment to file
    const success = await savePayment(paymentData);
    
    if (!success) {
      console.log('❌ Failed to save payment');
      return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
    }
    
    console.log('✅ Payment created successfully:', orderId);
    
    // Return payment details
    return NextResponse.json({
      success: true,
      orderId,
      paymentUrl: `/custom-payment/${orderId}`,
      expiresIn: 15 * 60 // 15 minutes in seconds
    });
    
  } catch (error) {
    console.error('Error creating custom payment:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}

async function savePayment(paymentData: any) {
  // Use in-memory storage for Vercel deployment (since filesystem is read-only)
  // In a real production app, you'd use a database like Supabase, MongoDB, etc.
  
  try {
    // For now, we'll simulate successful save since we can't write to filesystem on Vercel
    // The payment data would normally be saved to a database
    console.log(`💾 Payment data to save:`, {
      orderId: paymentData.orderId,
      amount: paymentData.amount,
      donorName: paymentData.donorName,
      donorPhone: paymentData.donorPhone,
      status: paymentData.status,
      createdAt: paymentData.createdAt
    });
    
    // Store in global memory (will reset on server restart, but works for demo)
    global.payments = global.payments || {};
    global.payments[paymentData.orderId] = paymentData;
    
    console.log(`✅ Created payment with proper order ID: ${paymentData.orderId} - ₹${paymentData.amount}`);
    return true;
    
  } catch (error) {
    console.error('Error saving payment:', error);
    return false;
  }
}
