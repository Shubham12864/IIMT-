"use server"

import { UPIGatewayAPI } from "../../lib/upi-gateway-api"

const UPI_GATEWAY_API_KEY = "API-c5c8521b-cd3d-45ab-bbe9-b71108a77b3d"

interface UPIDonationData {
  studentId: string
  studentName: string
  amount: number
  donationType: string
  email: string
  phone: string
}

export async function initiateUPIDonation(donationData: UPIDonationData) {
  try {
    // Generate unique order ID
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substr(2, 9)
    const orderId = `IIMT_DON_${timestamp}_${randomId}`

    console.log("Initiating donation with order ID:", orderId)

    // Prepare UPI Gateway order data with all required fields
    const orderRequest = {
      key: UPI_GATEWAY_API_KEY,
      client_txn_id: orderId,
      amount: donationData.amount.toString(),
      p_info: `IIMT University Donation - ${donationData.donationType}`,
      customer_name: donationData.studentName,
      customer_email: donationData.email,
      customer_mobile: donationData.phone,
      redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/donation/success?order_id=${orderId}`,
      udf1: donationData.studentId, // Student ID
      udf2: donationData.donationType, // Donation type
    }

    console.log("Sending order request:", orderRequest)

    // Create order via UPI Gateway API
    const apiResponse = await UPIGatewayAPI.createOrder(orderRequest)

    console.log("UPI Gateway response:", apiResponse)

    if (!apiResponse.status) {
      throw new Error(apiResponse.msg || "Failed to create order")
    }

    // Save donation record in database (implement your database logic here)
    await saveDonationRecord({
      ...donationData,
      orderId,
      gatewayOrderId: apiResponse.data?.order_id,
      status: "pending",
      paymentGateway: "upi_gateway",
    })

    return {
      success: true,
      paymentUrl: apiResponse.data?.payment_url,
      orderId: orderId,
      upiApps: apiResponse.data?.upi_intent,
      gatewayOrderId: apiResponse.data?.order_id,
    }
  } catch (error) {
    console.error("Error initiating UPI donation:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to initiate donation",
    }
  }
}

export async function checkUPIDonationStatus(orderId: string, txnDate?: string) {
  try {
    const checkDate = txnDate || UPIGatewayAPI.formatDate(new Date())

    const statusRequest = {
      key: UPI_GATEWAY_API_KEY,
      client_txn_id: orderId,
      txn_date: checkDate,
    }

    console.log("Checking status for:", statusRequest)

    const apiResponse = await UPIGatewayAPI.checkOrderStatus(statusRequest)

    if (!apiResponse.status) {
      return {
        success: false,
        error: apiResponse.msg || "Transaction not found",
      }
    }

    // Update local database with latest status
    if (apiResponse.data) {
      await updateDonationStatus(orderId, apiResponse.data)
    }

    return {
      success: true,
      data: apiResponse.data,
    }
  } catch (error) {
    console.error("Error checking UPI donation status:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to check status",
    }
  }
}

async function saveDonationRecord(data: any) {
  // Implement your database save logic here
  console.log("Saving donation record:", data)

  // Example database insert (replace with your actual database code)
  /*
  const insertQuery = `
    INSERT INTO donations (
      student_id, student_name, amount, order_id, gateway_order_id, 
      donation_type, status, payment_gateway, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    RETURNING id
  `
  
  const result = await db.query(insertQuery, [
    data.studentId,
    data.studentName,
    data.amount,
    data.orderId,
    data.gatewayOrderId,
    data.donationType,
    data.status,
    data.paymentGateway
  ])
  */

  return { id: Math.floor(Math.random() * 1000) }
}

async function updateDonationStatus(orderId: string, statusData: any) {
  // Implement your database update logic here
  console.log("Updating donation status:", orderId, statusData.status)

  // Example database update (replace with your actual database code)
  /*
  const updateQuery = `
    UPDATE donations 
    SET 
      status = $1,
      gateway_payment_id = $2,
      customer_vpa = $3,
      remark = $4,
      updated_at = NOW()
    WHERE order_id = $5
  `
  
  await db.query(updateQuery, [
    statusData.status,
    statusData.id,
    statusData.customer_vpa || null,
    statusData.remark,
    orderId
  ])
  */
}
