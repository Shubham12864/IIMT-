"use client"

import { Suspense } from "react"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

function TestSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("order_id")
  const [status, setStatus] = useState<"loading" | "success" | "failed" | "pending">("loading")

  useEffect(() => {
    // Simulate payment status check
    const timer = setTimeout(() => {
      // For demo purposes, randomly set success or pending
      const isSuccess = Math.random() > 0.3
      setStatus(isSuccess ? "success" : "pending")
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const renderStatus = () => {
    switch (status) {
      case "loading":
        return (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6 text-center">
              <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
              <h2 className="text-xl font-semibold text-blue-800 mb-2">Processing Payment</h2>
              <p className="text-blue-700">Please wait while we verify your payment...</p>
            </CardContent>
          </Card>
        )

      case "success":
        return (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-green-800 mb-2">Payment Successful! 🎉</h2>
              <p className="text-green-700 mb-4">
                Thank you for your donation to IIMT Group of Colleges. Your contribution will make a difference!
              </p>
              {orderId && (
                <div className="bg-white p-3 rounded border">
                  <p className="text-sm text-gray-600">Transaction ID:</p>
                  <p className="font-mono text-sm font-semibold">{orderId}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )

      case "pending":
        return (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-6 text-center">
              <Clock className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-yellow-800 mb-2">Payment Pending</h2>
              <p className="text-yellow-700 mb-4">
                Your payment is being processed. You will receive a confirmation shortly.
              </p>
              {orderId && (
                <div className="bg-white p-3 rounded border">
                  <p className="text-sm text-gray-600">Reference ID:</p>
                  <p className="font-mono text-sm font-semibold">{orderId}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )

      case "failed":
        return (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-red-800 mb-2">Payment Failed</h2>
              <p className="text-red-700 mb-4">Unfortunately, your payment could not be processed. Please try again.</p>
              <Button asChild className="bg-red-600 hover:bg-red-700">
                <Link href="/portal">Try Again</Link>
              </Button>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/iimt-group-logo.png"
              alt="IIMT Group of Colleges Logo"
              width={150}
              height={60}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Status</h1>
          <p className="text-gray-600">IIMT Group of Colleges Donation</p>
        </div>

        {renderStatus()}

        <div className="text-center">
          <Button variant="outline" asChild>
            <Link href="/portal">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Portal
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function TestSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Status</h1>
            <p className="text-gray-600">Loading...</p>
          </div>
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6 text-center">
              <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
              <h2 className="text-xl font-semibold text-blue-800 mb-2">Loading</h2>
              <p className="text-blue-700">Please wait...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <TestSuccessContent />
    </Suspense>
  )
}
