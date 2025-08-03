import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { amount, donorName, donorPhone, donorEmail } = await request.json();
    
    // Validate required fields
    if (!amount || !donorName || !donorPhone) {
      return NextResponse.json({ 
        error: 'Missing required fields: amount, donorName, donorPhone' 
      }, { status: 400 });
    }
    
    // Generate unique order ID
    const orderId = `IIMT_CUSTOM_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
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
      return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
    }
    
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
  const fs = require('fs').promises;
  const path = require('path');
  
  try {
    const paymentsFile = path.join(process.cwd(), 'data', 'custom-payments.json');
    const dataDir = path.dirname(paymentsFile);
    
    // Create directory if it doesn't exist
    await fs.mkdir(dataDir, { recursive: true });
    
    // Read existing payments
    let payments: Record<string, any> = {};
    try {
      const data = await fs.readFile(paymentsFile, 'utf8');
      payments = JSON.parse(data);
    } catch {
      // File doesn't exist, start with empty object
    }
    
    // Add new payment
    payments[paymentData.orderId] = paymentData;
    
    // Write back to file
    await fs.writeFile(paymentsFile, JSON.stringify(payments, null, 2));
    
    console.log(`✅ Created custom payment: ${paymentData.orderId} - ₹${paymentData.amount}`);
    return true;
    
  } catch (error) {
    console.error('Error saving payment:', error);
    return false;
  }
}
