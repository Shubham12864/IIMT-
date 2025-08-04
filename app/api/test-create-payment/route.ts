import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Create a test payment
    const orderId = `IIMT${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)}${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Initialize global payments if not exists
    if (!global.payments) {
      global.payments = {};
    }
    
    const testPayment = {
      orderId,
      amount: 1000,
      name: 'Test User',
      email: 'test@example.com',
      phone: '9876543210',
      donorName: 'Test User',
      donorEmail: 'test@example.com',
      donorPhone: '9876543210',
      purpose: 'Educational Institution Support - IIMT Group of Colleges',
      donationType: 'Educational Donation',
      status: 'pending_approval',
      userConfirmed: false,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      paymentMethod: 'custom_qr'
    };
    
    global.payments[orderId] = testPayment;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test payment created',
      payment: testPayment,
      totalPayments: Object.keys(global.payments).length
    });
  } catch (error) {
    console.error('Error creating test payment:', error);
    return NextResponse.json(
      { error: 'Failed to create test payment' },
      { status: 500 }
    );
  }
}
