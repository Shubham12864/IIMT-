import { type NextRequest, NextResponse } from "next/server"

// UPI Gateway webhook secret (you'll get this from UPI Gateway dashboard)
const WEBHOOK_SECRET = process.env.UPI_GATEWAY_WEBHOOK_SECRET || "your_webhook_secret"

interface UPIGatewayWebhookPayload {
  amount: string
  client_txn_id: string
  createdAt: string
  customer_email: string
  customer_mobile: string
  customer_name: string
  customer_vpa?: string
  id: string
  p_info: string
  redirect_url: string
  remark: string
  status: string // "success" or "failure"
  txnAt: string
  udf1: string
  udf2: string
}

export async function POST(request: NextRequest) {
  try {
    // Get the form data (UPI Gateway sends application/x-www-form-urlencoded)
    const formData = await request.formData()

    // Convert FormData to object
    const webhookData: Partial<UPIGatewayWebhookPayload> = {}
    formData.forEach((value, key) => {
      webhookData[key as keyof UPIGatewayWebhookPayload] = value.toString()
    })

    console.log("UPI Gateway Webhook received:", webhookData)

    // Verify webhook authenticity (if UPI Gateway provides signature verification)
    // This depends on UPI Gateway's security implementation

    if (!webhookData.client_txn_id || !webhookData.status) {
      return NextResponse.json({ error: "Invalid webhook data" }, { status: 400 })
    }

    // Handle different payment statuses
    switch (webhookData.status?.toLowerCase()) {
      case "success":
        await handlePaymentSuccess(webhookData as UPIGatewayWebhookPayload)
        break

      case "failure":
      case "failed":
        await handlePaymentFailure(webhookData as UPIGatewayWebhookPayload)
        break

      default:
        console.log("Unknown payment status:", webhookData.status)
    }

    return NextResponse.json({ status: "success" })
  } catch (error) {
    console.error("UPI Gateway Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

async function handlePaymentSuccess(webhookData: UPIGatewayWebhookPayload) {
  try {
    console.log("Processing successful payment:", webhookData.client_txn_id)

    // Update donation status in database
    const updateQuery = `
      UPDATE donations 
      SET 
        status = 'completed',
        gateway_payment_id = $1,
        gateway_txn_id = $2,
        customer_vpa = $3,
        webhook_received_at = NOW(),
        updated_at = NOW(),
        remark = $4
      WHERE order_id = $5
      RETURNING *
    `

    // Execute database update
    // const result = await db.query(updateQuery, [
    //   webhookData.id,
    //   webhookData.client_txn_id,
    //   webhookData.customer_vpa || null,
    //   webhookData.remark,
    //   webhookData.client_txn_id
    // ])

    console.log("Payment successful for order:", webhookData.client_txn_id)

    // Generate receipt with UPI details
    await generateUPIReceipt(webhookData)

    // Send confirmation email
    await sendConfirmationEmail(webhookData)

    // Send SMS confirmation (optional)
    await sendSMSConfirmation(webhookData)
  } catch (error) {
    console.error("Error handling UPI payment success:", error)
  }
}

async function handlePaymentFailure(webhookData: UPIGatewayWebhookPayload) {
  try {
    console.log("Processing failed payment:", webhookData.client_txn_id)

    // Update donation status
    const updateQuery = `
      UPDATE donations 
      SET 
        status = 'failed',
        gateway_payment_id = $1,
        gateway_txn_id = $2,
        webhook_received_at = NOW(),
        updated_at = NOW(),
        remark = $3
      WHERE order_id = $4
    `

    // Execute database update
    // const result = await db.query(updateQuery, [
    //   webhookData.id,
    //   webhookData.client_txn_id,
    //   webhookData.remark,
    //   webhookData.client_txn_id
    // ])

    console.log("Payment failed for order:", webhookData.client_txn_id)

    // Send failure notification
    await sendFailureNotification(webhookData)
  } catch (error) {
    console.error("Error handling UPI payment failure:", error)
  }
}

async function generateUPIReceipt(webhookData: UPIGatewayWebhookPayload) {
  console.log("Generating UPI receipt for:", webhookData.client_txn_id)

  // Generate PDF receipt with UPI transaction details
  const receiptData = {
    transactionId: webhookData.id,
    orderId: webhookData.client_txn_id,
    amount: webhookData.amount,
    customerName: webhookData.customer_name,
    customerEmail: webhookData.customer_email,
    customerMobile: webhookData.customer_mobile,
    customerVPA: webhookData.customer_vpa,
    transactionDate: webhookData.txnAt,
    paymentMethod: "UPI",
    status: "Success",
  }

  // Implement PDF generation logic here
  // You can use libraries like jsPDF, puppeteer, or react-pdf
}

async function sendConfirmationEmail(webhookData: UPIGatewayWebhookPayload) {
  console.log("Sending confirmation email to:", webhookData.customer_email)

  const emailData = {
    to: webhookData.customer_email,
    subject: "Donation Confirmation - IIMT University",
    html: `
      <h2>Thank you for your donation!</h2>
      <p>Dear ${webhookData.customer_name},</p>
      <p>Your donation of ₹${webhookData.amount} has been successfully processed.</p>
      <p><strong>Transaction Details:</strong></p>
      <ul>
        <li>Transaction ID: ${webhookData.id}</li>
        <li>Order ID: ${webhookData.client_txn_id}</li>
        <li>Amount: ₹${webhookData.amount}</li>
        <li>Payment Method: UPI</li>
        <li>Date: ${webhookData.txnAt}</li>
      </ul>
      <p>Your tax receipt will be generated and sent separately.</p>
      <p>Thank you for supporting IIMT University!</p>
    `,
  }

  // Implement email sending logic
  // You can use services like Resend, SendGrid, or Nodemailer
}

async function sendSMSConfirmation(webhookData: UPIGatewayWebhookPayload) {
  console.log("Sending SMS confirmation to:", webhookData.customer_mobile)

  const message = `Thank you for your donation of ₹${webhookData.amount} to IIMT University. Transaction ID: ${webhookData.id}. Receipt will be sent to your email.`

  // Implement SMS sending logic
  // You can use services like Twilio, MSG91, or TextLocal
}

async function sendFailureNotification(webhookData: UPIGatewayWebhookPayload) {
  console.log("Sending failure notification for:", webhookData.client_txn_id)

  const emailData = {
    to: webhookData.customer_email,
    subject: "Donation Payment Failed - IIMT University",
    html: `
      <h2>Payment Failed</h2>
      <p>Dear ${webhookData.customer_name},</p>
      <p>Unfortunately, your donation payment of ₹${webhookData.amount} could not be processed.</p>
      <p><strong>Reason:</strong> ${webhookData.remark}</p>
      <p>Please try again or contact our support team.</p>
    `,
  }

  // Send failure email
}
