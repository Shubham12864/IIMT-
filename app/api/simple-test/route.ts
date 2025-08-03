import { NextRequest, NextResponse } from "next/server"
import { initiateUPIDonation } from "@/app/actions/upi-donation-actions"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("🧪 Simple donation test with:", body)

    // Create FormData from JSON body
    const formData = new FormData()
    formData.append('amount', body.amount)
    formData.append('name', body.name)
    formData.append('phoneNumber', body.phoneNumber)
    formData.append('email', body.email || '')

    // Call the donation server action
    const result = await initiateUPIDonation(formData)
    
    console.log("✅ Donation test result:", result)
    return NextResponse.json(result)

  } catch (error) {
    console.error("❌ Donation test failed:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Test failed"
    }, { status: 500 })
  }
}
