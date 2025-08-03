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
  const fs = require('fs').promises;
  const path = require('path');
  
  try {
    const paymentsFile = path.join(process.cwd(), 'data', 'custom-payments.json');
    
    // Create directory if it doesn't exist
    const dataDir = path.dirname(paymentsFile);
    await fs.mkdir(dataDir, { recursive: true });
    
    // Read payments file
    let payments: Record<string, any> = {};
    try {
      const data = await fs.readFile(paymentsFile, 'utf8');
      payments = JSON.parse(data);
    } catch {
      // File doesn't exist, return empty object
    }
    
    return payments[orderId] || null;
  } catch (error) {
    console.error('Error reading payments file:', error);
    return null;
  }
}
