"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Smartphone } from "lucide-react"
import { initiateUPIDonation } from "../app/actions/upi-donation-actions"

export default function UPIDonationPage() {
  const [amount, setAmount] = useState("")
  const [donationType, setDonationType] = useState("general_fund")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleUPIDonation = async () => {
    if (!amount || !email || !phone) {
      alert("Please fill all required fields")
      return
    }

    setIsProcessing(true)

    try {
      // Initiate UPI donation
      const result = await initiateUPIDonation({
        studentId: "52250200", // From student profile
        studentName: "Ajeet Paswan",
        amount: Number.parseFloat(amount),
        donationType,
        email,
        phone,
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      // Redirect to UPI Gateway payment page
      window.location.href = result.paymentUrl
    } catch (error) {
      console.error("UPI Donation error:", error)
      alert("Failed to process donation. Please try again.")
      setIsProcessing(false)
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-blue-500 mb-6">UPI Donation</h2>
      <div className="space-y-6">
        {/* Student Profile Card - Same as before */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start space-x-6">
              {/* Profile Picture */}
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

              {/* Student Information */}
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
                <strong>UPI Payment:</strong> Pay securely using any UPI app like PhonePe, Google Pay, Paytm, or BHIM.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="donationType">Donation Type</Label>
                <Select value={donationType} onValueChange={setDonationType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select donation type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general_fund">General Fund</SelectItem>
                    <SelectItem value="scholarship">Scholarship Fund</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="research">Research Fund</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-700">
                <strong>Tax Benefit:</strong> Donations are eligible for 80G tax exemption. Receipt will be generated
                automatically after successful payment.
              </p>
            </div>

            <Button
              onClick={handleUPIDonation}
              disabled={isProcessing}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Smartphone className="h-4 w-4 mr-2" />
              {isProcessing ? "Processing..." : `Pay ₹${amount || "0"} via UPI`}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
