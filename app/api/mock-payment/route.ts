import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("🧪 Mock payment test with:", body)

    const { amount, name, phoneNumber, email } = body

    // Validate required fields
    if (!amount || !name || !phoneNumber) {
      return NextResponse.json({
        success: false,
        error: "Missing required fields: amount, name, or phoneNumber",
      }, { status: 400 })
    }

    // Generate a mock order ID
    const orderId = `MOCK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Create a mock payment URL (this would normally come from UPI Gateway)
    const mockPaymentUrl = `https://mockpay.example.com/pay?order_id=${orderId}&amount=${amount}`

    console.log("✅ Mock payment created:", { orderId, mockPaymentUrl })

    return NextResponse.json({
      success: true,
      orderId: orderId,
      paymentUrl: mockPaymentUrl,
      message: "Mock payment order created successfully (for testing)",
      isTest: true
    })

  } catch (error) {
    console.error("❌ Mock payment failed:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Mock test failed"
    }, { status: 500 })
  }
}
