import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const PAYMENTS_FILE = path.join(process.cwd(), 'data', 'custom-payments.json');

export async function GET() {
  try {
    if (!fs.existsSync(PAYMENTS_FILE)) {
      return NextResponse.json([]);
    }

    const fileContent = fs.readFileSync(PAYMENTS_FILE, 'utf-8');
    const payments = JSON.parse(fileContent);
    
    // Transform the data to match the interface expected by the frontend
    const transformedPayments = Object.values(payments).map((payment: any) => ({
      orderId: payment.orderId,
      amount: payment.amount,
      name: payment.donorName || payment.name,
      email: payment.donorEmail || payment.email,
      phone: payment.donorPhone || payment.phone,
      purpose: payment.purpose || 'Donation',
      donationType: payment.donationType || 'General',
      status: payment.status === 'pending_payment' ? 'created' : 
              payment.status === 'userMarkedPaid' ? 'pending_verification' : 
              payment.status,
      createdAt: payment.createdAt
    }));
    
    // Sort by creation date (newest first)
    const sortedPayments = transformedPayments.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(sortedPayments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}
