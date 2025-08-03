"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Smartphone, CheckCircle, XCircle, AlertTriangle, ExternalLink } from "lucide-react"

export default function TestPayment() {
  const [amount, setAmount] = useState("10") // Default test amount
  const [email, setEmail] = useState("test@example.com")
  const [phone, setPhone] = useState("9876543210")
  const [isProcessing, setIsProcessing] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`])
    console.log(message)
  }

  const testPaymentFlow = async () => {
    if (!amount || !email || !phone) {
      alert("Please fill all fields")
      return
    }

    setIsProcessing(true)
    setTestResult(null)
    setLogs([])

    try {
      addLog("🚀 Starting payment test...")
      addLog(`Amount: ₹${amount}, Email: ${email}, Phone: ${phone}`)

      // Test the donation initiation
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
          donationType: "general_fund",
        }),
      })

      const result = await response.json()
      addLog(`API Response: ${JSON.stringify(result, null, 2)}`)

      if (result.success) {
        addLog("✅ Order created successfully!")
        addLog(`Order ID: ${result.orderId}`)
        addLog(`Payment URL: ${result.paymentUrl}`)

        setTestResult({
          success: true,
          ...result,
        })
      } else {
        addLog("❌ Order creation failed!")
        addLog(`Error: ${result.error}`)
        setTestResult({
          success: false,
          error: result.error,
        })
      }
    } catch (error) {
      addLog(`💥 Exception occurred: ${error}`)
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const openPaymentGateway = () => {
    if (testResult?.paymentUrl) {
      addLog("🌐 Opening payment gateway...")
      window.open(testResult.paymentUrl, "_blank")
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">🧪 Payment System Test</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Smartphone className="h-5 w-5" />
              <span>Test Payment</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="amount">Test Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                max="100"
                disabled={isProcessing}
              />
              <p className="text-xs text-gray-500 mt-1">Use small amounts for testing (₹1-₹100)</p>
            </div>

            <div>
              <Label htmlFor="email">Test Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isProcessing}
              />
            </div>

            <div>
              <Label htmlFor="phone">Test Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={10}
                disabled={isProcessing}
              />
            </div>

            <Button onClick={testPaymentFlow} disabled={isProcessing} className="w-full bg-blue-500 hover:bg-blue-600">
              {isProcessing ? "Testing..." : "🧪 Test Payment API"}
            </Button>

            {/* Test Results */}
            {testResult && (
              <div className="mt-4">
                {testResult.success ? (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>✅ API Test Successful!</strong>
                      <div className="mt-2 space-y-1 text-sm">
                        <div>
                          Order ID: <code className="bg-green-100 px-1 rounded">{testResult.orderId}</code>
                        </div>
                        <div>
                          Gateway Order: <code className="bg-green-100 px-1 rounded">{testResult.gatewayOrderId}</code>
                        </div>
                      </div>
                      <Button
                        onClick={openPaymentGateway}
                        className="mt-3 bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Open Payment Gateway
                      </Button>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="border-red-200 bg-red-50">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <strong>❌ API Test Failed!</strong>
                      <div className="mt-2 text-sm">
                        Error: <code className="bg-red-100 px-1 rounded">{testResult.error}</code>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Debug Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Debug Logs</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500">Logs will appear here when you test...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Environment Check */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>🔧 Environment Check</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>API Key:</strong>
              <code className="ml-2 bg-gray-100 px-2 py-1 rounded">✅ Set (Server-side only)</code>
            </div>
            <div>
              <strong>Base URL:</strong>
              <code className="ml-2 bg-gray-100 px-2 py-1 rounded">
                {process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}
              </code>
            </div>
            <div>
              <strong>Gateway URL:</strong>
              <code className="ml-2 bg-gray-100 px-2 py-1 rounded">https://api.ekqr.in/api</code>
            </div>
            <div>
              <strong>Webhook URL:</strong>
              <code className="ml-2 bg-gray-100 px-2 py-1 rounded">
                {process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/webhooks/upi-gateway
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
