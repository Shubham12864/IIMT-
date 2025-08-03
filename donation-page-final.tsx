"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Smartphone, CheckCircle, XCircle, Clock, ExternalLink } from "lucide-react"

export default function FinalUPIDonationPage() {
  const [amount, setAmount] = useState("")
  const [donationType, setDonationType] = useState("general_fund")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "pending" | "success" | "failed">("idle")
  const [paymentData, setPaymentData] = useState<any>(null)
  const [debugLogs, setDebugLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logMessage = `[${timestamp}] ${message}`
    setDebugLogs((prev) => [...prev, logMessage])
    console.log(logMessage)
  }

  const handleDonateNow = async () => {
    if (!amount || !email || !phone) {
      alert("Please fill all required fields")
      return
    }

    if (Number.parseFloat(amount) < 1) {
      alert("Minimum donation amount is ₹1")
      return
    }

    setIsProcessing(true)
    setPaymentStatus("pending")
    setDebugLogs([])

    try {
      addLog("🚀 Starting donation process...")
      addLog(`Amount: ₹${amount}, Email: ${email}, Phone: ${phone}`)

      // Call the test payment API directly
      const response = await fetch("/api/test-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number.parseFloat(amount),
          email,
          phone,
          studentId: "52250200",
          studentName: "Ajeet Paswan",
          donationType,
        }),
      })

      addLog(`API Response Status: ${response.status}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      addLog(`API Response: ${JSON.stringify(result, null, 2)}`)

      if (!result.success) {
        throw new Error(result.error || "Failed to create payment order")
      }

      addLog("✅ Order created successfully!")
      addLog(`Order ID: ${result.orderId}`)
      addLog(`Payment URL: ${result.paymentUrl}`)

      // Store payment data
      setPaymentData(result)

      // Redirect to payment gateway
      if (result.paymentUrl) {
        addLog("🌐 Redirecting to payment gateway...")

        // Try to open in same window first
        window.location.href = result.paymentUrl

        // Fallback: open in new tab after 2 seconds if redirect fails
        setTimeout(() => {
          if (window.location.href === window.location.origin + window.location.pathname) {
            addLog("⚠️ Redirect failed, opening in new tab...")
            window.open(result.paymentUrl, "_blank")
          }
        }, 2000)
      } else {
        throw new Error("Payment URL not received from gateway")
      }
    } catch (error) {
      addLog(`💥 Error: ${error instanceof Error ? error.message : "Unknown error"}`)
      console.error("Donation error:", error)
      alert(`Failed to process donation: ${error instanceof Error ? error.message : "Unknown error"}`)
      setPaymentStatus("failed")
      setPaymentData({ error: error instanceof Error ? error.message : "Unknown error" })
    } finally {
      // Don't set isProcessing to false immediately, keep it true while redirecting
      setTimeout(() => {
        setIsProcessing(false)
      }, 3000)
    }
  }

  const renderPaymentStatus = () => {
    switch (paymentStatus) {
      case "pending":
        return (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Clock className="h-6 w-6 text-yellow-600 animate-spin" />
                <div>
                  <h3 className="font-semibold text-yellow-800">Redirecting to Payment Gateway</h3>
                  <p className="text-sm text-yellow-700">
                    Please wait while we redirect you to the secure payment page...
                  </p>
                  {paymentData?.paymentUrl && (
                    <Button
                      onClick={() => window.open(paymentData.paymentUrl, "_blank")}
                      className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white text-xs"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Open Payment Page Manually
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case "success":
        return (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800">Payment Successful! 🎉</h3>
                  <p className="text-sm text-green-700">
                    Thank you for your donation of ₹{paymentData?.amount}. Receipt will be sent to your email.
                  </p>
                  {paymentData?.orderId && (
                    <p className="text-xs text-green-600 mt-1">Order ID: {paymentData.orderId}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case "failed":
        return (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <XCircle className="h-6 w-6 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-800">Payment Failed</h3>
                  <p className="text-sm text-red-700">
                    {paymentData?.error || "Payment could not be processed. Please try again."}
                  </p>
                  <Button
                    onClick={() => {
                      setPaymentStatus("idle")
                      setPaymentData(null)
                      setIsProcessing(false)
                      setDebugLogs([])
                    }}
                    className="mt-2 bg-red-600 hover:bg-red-700 text-white text-xs"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-blue-500 mb-6">UPI Donation</h2>
      <div className="space-y-6">
        {/* Payment Status */}
        {paymentStatus !== "idle" && renderPaymentStatus()}

        {/* Debug Logs (only show if there are logs) */}
        {debugLogs.length > 0 && (
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-sm">Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono max-h-32 overflow-y-auto">
                {debugLogs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Student Profile Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start space-x-6">
              <div className="w-32 h-32 flex-shrink-0">
                <div className="w-full h-full bg-gradient-to-br from-cyan-100 to-cyan-300 rounded-full flex items-center justify-center border-4 border-cyan-400 relative">
                  <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center relative overflow-hidden">
                    <div className="w-8 h-8 bg-white rounded-full absolute top-2"></div>
                    <div className="w-12 h-8 bg-white rounded-t-full absolute bottom-0"></div>
                  </div>
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                    <div className="w-12 h-3 bg-gray-800 rounded-sm relative">
                      <div className="w-16 h-1 bg-gray-800 absolute -top-1 left-1/2 transform -translate-x-1/2"></div>
                      <div className="w-0.5 h-4 bg-yellow-500 absolute -right-1 top-0"></div>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full absolute -right-2 top-3"></div>
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">S</span>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <div className="bg-cyan-400 text-white px-4 py-2 rounded-t-lg mb-4">
                  <h3 className="text-xl font-bold">Ajeet Paswan</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Admission No. :</span>
                    <span className="ml-2 text-gray-900">2500252M23654145</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Class :</span>
                    <span className="ml-2 text-gray-900">B.PHAR_2025-2026_I_Sem I Sem I</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Division :</span>
                    <span className="ml-2 text-gray-900">none</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Roll No. :</span>
                    <span className="ml-2 text-gray-900">173499T250025ZMI26</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Programme :</span>
                    <span className="ml-2 text-gray-900">B.Pharm [ 52]</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Application No. :</span>
                    <span className="ml-2 text-gray-900">IIMT/25-26/26641 (This is a preadmission application No)</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* UPI Donation Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Smartphone className="h-5 w-5 text-blue-500" />
              <span>UPI Donation</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Secure UPI Payment:</strong> You'll be redirected to UPI Gateway for secure payment processing.
                Supports all UPI apps including PhonePe, Google Pay, Paytm, and BHIM.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="donationType">Donation Type</Label>
                <Select value={donationType} onValueChange={setDonationType} disabled={isProcessing}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select donation type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general_fund">General Fund</SelectItem>
                    <SelectItem value="scholarship">Scholarship Fund</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure Development</SelectItem>
                    <SelectItem value="research">Research Fund</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount (min ₹1)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  disabled={isProcessing}
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email for receipt"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isProcessing}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isProcessing}
                  maxLength={10}
                  required
                />
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-700">
                <strong>Tax Benefit:</strong> Donations are eligible for 80G tax exemption under Income Tax Act.
                Official receipt will be generated automatically after successful payment.
              </p>
            </div>

            <Button
              onClick={handleDonateNow}
              disabled={isProcessing || !amount || !email || !phone}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white text-lg py-3"
            >
              {isProcessing ? (
                <>
                  <Clock className="h-5 w-5 mr-2 animate-spin" />
                  Redirecting to Payment Gateway...
                </>
              ) : (
                <>
                  <Smartphone className="h-5 w-5 mr-2" />
                  Donate Now ₹{amount || "0"}
                  <ExternalLink className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>

            {!isProcessing && (
              <p className="text-xs text-gray-500 text-center">
                By clicking "Donate Now", you'll be redirected to UPI Gateway for secure payment processing.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
