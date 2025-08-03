import { type NextRequest, NextResponse } from "next/server"

const UPI_GATEWAY_API_KEY = "API-c5c8521b-cd3d-45ab-bbe9-b71108a77b3d"
const UPI_GATEWAY_BASE_URL = "https://api.ekqr.in/api"

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Payment API called")

    const body = await request.json()
    console.log("📥 Request body:", body)

    const { amount, email, phone, studentId, studentName, donationType } = body

    // Validate required fields
    if (!amount || !email || !phone) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: amount, email, or phone",
        },
        { status: 400 },
      )
    }

    // Generate unique order ID
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substr(2, 9)
    const orderId = `IIMT_${timestamp}_${randomId}`

    console.log("🧪 Creating order with ID:", orderId)

    // Prepare UPI Gateway request
    const orderRequest = {
      key: UPI_GATEWAY_API_KEY,
      client_txn_id: orderId,
      amount: amount.toString(),
      p_info: `IIMT University Donation - ${donationType || "General Fund"}`,
      customer_name: studentName || "Student",
      customer_email: email,
      customer_mobile: phone,
      redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/test-success?order_id=${orderId}`,
      udf1: studentId || "52250200",
      udf2: donationType || "general_fund",
    }

    console.log("📤 Sending request to UPI Gateway:", {
      ...orderRequest,
      key: "API-***", // Hide API key in logs
    })

    // Make API call to UPI Gateway
    const response = await fetch(`${UPI_GATEWAY_BASE_URL}/create_order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(orderRequest),
    })

    console.log("📡 UPI Gateway response status:", response.status)

    const responseText = await response.text()
    console.log("📥 UPI Gateway raw response:", responseText)

    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch (parseError) {
      console.error("❌ Failed to parse response as JSON:", parseError)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid response from payment gateway",
          rawResponse: responseText,
        },
        { status: 500 },
      )
    }

    console.log("📥 UPI Gateway parsed response:", responseData)

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          rawResponse: responseData,
        },
        { status: response.status },
      )
    }

    if (responseData.status === true && responseData.data) {
      console.log("✅ Order created successfully")
      return NextResponse.json({
        success: true,
        orderId: orderId,
        gatewayOrderId: responseData.data.order_id,
        paymentUrl: responseData.data.payment_url,
        upiApps: responseData.data.upi_intent,
        message: "Order created successfully",
        rawResponse: responseData,
      })
    } else {
      console.log("❌ Order creation failed:", responseData.msg)
      return NextResponse.json(
        {
          success: false,
          error: responseData.msg || "Order creation failed",
          rawResponse: responseData,
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("💥 Payment API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
