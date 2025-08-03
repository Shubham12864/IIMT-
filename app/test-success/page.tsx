"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowLeft, RefreshCw } from "lucide-react"

export default function TestSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("order_id")
  const [paymentStatus, setPaymentStatus] = useState<any>(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkPaymentStatus = async () => {
    if (!orderId) return

    setIsChecking(true)
    try {
      const response = await fetch("/api/check-donation-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      })

      const result = await response.json()
      setPaymentStatus(result)
    } catch (error) {
      console.error("Error checking status:", error)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    if (orderId) {
      checkPaymentStatus()
    }
  }, [orderId])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-green-800">Payment Test Complete</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">You have been redirected back from the payment gateway.</p>

            {orderId && (
              <div className="bg-gray-100 p-3 rounded-lg mb-4">
                <p className="text-sm font-medium">Test Order ID:</p>
                <code className="text-xs bg-white px-2 py-1 rounded">{orderId}</code>
              </div>
            )}

            {paymentStatus && (
              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <p className="text-sm font-medium mb-2">Payment Status:</p>
                <pre className="text-xs bg-white p-2 rounded overflow-auto">
                  {JSON.stringify(paymentStatus, null, 2)}
                </pre>
              </div>
            )}

            <div className="space-y-2">
              <Button
                onClick={checkPaymentStatus}
                disabled={isChecking}
                className="w-full bg-transparent"
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? "animate-spin" : ""}`} />
                {isChecking ? "Checking..." : "Check Payment Status"}
              </Button>

              <Button onClick={() => (window.location.href = "/test-payment")} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Test Page
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
