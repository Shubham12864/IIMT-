"use server"

import { UPIGatewayAPI } from "@/lib/upi-gateway-api"

export async function initiateUPIDonation(formData: FormData) {
  try {
    const amount = formData.get('amount') as string;
    const name = formData.get('name') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const email = formData.get('email') as string || '';

    console.log('🚀 Initiating donation:', { amount, name, phoneNumber, email });

    // Validation
    if (!amount || !name || !phoneNumber) {
      return { success: false, error: 'Missing required fields' };
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum < 10) {
      return { success: false, error: 'Minimum donation amount is ₹10' };
    }

    if (phoneNumber.length !== 10) {
      return { success: false, error: 'Please enter a valid 10-digit mobile number' };
    }

    // Create UPI Gateway instance
    const upiAPI = new UPIGatewayAPI();
    const orderId = `IIMT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log('📝 Creating order with ID:', orderId);

    const order = await upiAPI.createOrder({
      client_txn_id: orderId,
      amount: amountNum,
      p_info: `Donation by ${name} - IIMT College`,
      customer_name: name,
      customer_email: email || `${phoneNumber}@noemail.com`,
      customer_mobile: phoneNumber,
    });

    console.log('✅ Order created successfully:', order);

    // Get payment URL from response
    const paymentUrl = order.payment_url || order.data?.payment_url;
    
    if (!paymentUrl) {
      console.error('❌ No payment URL in response:', order);
      return { 
        success: false, 
        error: 'No payment URL received from gateway' 
      };
    }

    // TODO: Store donation record in database
    // await storeDonationRecord({
    //   orderId,
    //   amount: amountNum,
    //   name,
    //   phoneNumber,
    //   email: email || '',
    //   status: 'pending'
    // });

    return { 
      success: true, 
      paymentUrl: paymentUrl,
      orderId: orderId
    };

  } catch (error) {
    console.error('❌ Payment initiation failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
export async function checkUPIDonationStatus(orderId: string, txnDate?: string) {
  try {
    const upiAPI = new UPIGatewayAPI();
    const checkDate = txnDate || formatDate(new Date());

    console.log('🔍 Checking donation status:', { orderId, checkDate });

    const result = await upiAPI.checkOrderStatus(orderId, checkDate);

    if (!result.status) {
      return {
        success: false,
        error: result.msg || "Transaction not found",
      };
    }

    // TODO: Update local database with latest status
    // if (result.data) {
    //   await updateDonationStatus(orderId, result.data);
    // }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error("❌ Error checking donation status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to check status",
    };
  }
}

function formatDate(date: Date): string {
  // Format: DD-MM-YYYY (as required by UPI Gateway)
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}
