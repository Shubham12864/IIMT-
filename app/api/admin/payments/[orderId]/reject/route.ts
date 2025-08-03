import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const PAYMENTS_FILE = path.join(process.cwd(), 'data', 'custom-payments.json');

interface RouteParams {
  params: Promise<{ orderId: string }>;
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { orderId } = await params;
    
    if (!fs.existsSync(PAYMENTS_FILE)) {
      return NextResponse.json({ error: 'No payments found' }, { status: 404 });
    }

    const fileContent = fs.readFileSync(PAYMENTS_FILE, 'utf-8');
    const payments = JSON.parse(fileContent);

    if (!payments[orderId]) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Update payment status to rejected
    payments[orderId].status = 'rejected';
    payments[orderId].rejectedAt = new Date().toISOString();

    // Save back to file
    fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(payments, null, 2));

    console.log(`❌ Payment rejected: ${orderId}`);

    return NextResponse.json({ success: true, payment: payments[orderId] });
  } catch (error) {
    console.error('Error rejecting payment:', error);
    return NextResponse.json({ error: 'Failed to reject payment' }, { status: 500 });
  }
}
