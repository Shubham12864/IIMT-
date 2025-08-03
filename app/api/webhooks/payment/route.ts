import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

// This would typically come from environment variables
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "your_webhook_secret"

interface PaymentWebhookPayload {
  event: string
  payload: {
    payment: {
      entity: {
        id: string
        order_id: string
        amount: number
        currency: string
        status: string
        method: string
        created_at: number
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the raw body
    const body = await request.text()
    const signature = request.headers.get("x-razorpay-signature")

    if (!signature) {
      return NextResponse.json({ error: "No signature provided" }, { status: 400 })
    }

    // Verify webhook signature
    const expectedSignature = crypto.createHmac("sha256", WEBHOOK_SECRET).update(body).digest("hex")

    if (signature !== expectedSignature) {
      console.error("Invalid webhook signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const webhookData: PaymentWebhookPayload = JSON.parse(body)

    console.log("Webhook received:", webhookData.event)

    // Handle different webhook events
    switch (webhookData.event) {
      case "payment.captured":
        await handlePaymentSuccess(webhookData.payload.payment.entity)
        break

      case "payment.failed":
        await handlePaymentFailure(webhookData.payload.payment.entity)
        break

      default:
        console.log("Unhandled webhook event:", webhookData.event)
    }

    return NextResponse.json({ status: "success" })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

async function handlePaymentSuccess(payment: any) {
  try {
    // Update donation status in database
    const updateQuery = `
      UPDATE donations 
      SET 
        status = 'completed',
        payment_id = $1,
        payment_method = $2,
        webhook_received_at = NOW(),
        updated_at = NOW()
      WHERE gateway_order_id = $3
      RETURNING *
    `

    // This would use your database connection
    // const result = await db.query(updateQuery, [payment.id, payment.method, payment.order_id])

    console.log("Payment successful:", payment.id)

    // Generate receipt
    await generateReceipt(payment.order_id)

    // Send confirmation email
    await sendConfirmationEmail(payment.order_id)
  } catch (error) {
    console.error("Error handling payment success:", error)
  }
}

async function handlePaymentFailure(payment: any) {
  try {
    // Update donation status
    const updateQuery = `
      UPDATE donations 
      SET 
        status = 'failed',
        payment_id = $1,
        webhook_received_at = NOW(),
        updated_at = NOW()
      WHERE gateway_order_id = $2
    `

    // const result = await db.query(updateQuery, [payment.id, payment.order_id])

    console.log("Payment failed:", payment.id)

    // Send failure notification
    await sendFailureNotification(payment.order_id)
  } catch (error) {
    console.error("Error handling payment failure:", error)
  }
}

async function generateReceipt(orderId: string) {
  // Generate PDF receipt logic here
  console.log("Generating receipt for order:", orderId)

  // You would implement PDF generation here
  // Using libraries like jsPDF or puppeteer
}

async function sendConfirmationEmail(orderId: string) {
  // Send email logic here
  console.log("Sending confirmation email for order:", orderId)

  // You would implement email sending here
  // Using services like Resend, SendGrid, or Nodemailer
}

async function sendFailureNotification(orderId: string) {
  // Send failure notification
  console.log("Sending failure notification for order:", orderId)
}
