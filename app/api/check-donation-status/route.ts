import { type NextRequest, NextResponse } from "next/server"
import { checkUPIDonationStatus } from "../../actions/upi-donation-actions"

export async function POST(request: NextRequest) {
  try {
    const { orderId, txnDate } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    const result = await checkUPIDonationStatus(orderId, txnDate)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in check donation status API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
