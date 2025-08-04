"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CreditCard,
  Users,
  UserCheck,
  MessageSquare,
  FileText,
  BarChart3,
  FileCheck,
  BookOpen,
  DollarSign,
  AlertTriangle,
  GraduationCap,
  FileSpreadsheet,
  Banknote,
  Bell,
  LogOut,
  Settings,
  Calendar,
  TrendingUp,
  Monitor,
  Star,
  Heart,
  Menu,
  X,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Payment Approvals Component
const PaymentApprovalsContent = () => {
  const [pendingPayments, setPendingPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState('')

  useEffect(() => {
    loadPendingPayments()
  }, [])

  const loadPendingPayments = async () => {
    try {
      const response = await fetch('/api/custom-payments/pending')
      const data = await response.json()
      setPendingPayments(data.payments || [])
    } catch (error) {
      console.error('Failed to load pending payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const approvePayment = async (orderId: string) => {
    setApproving(orderId)
    try {
      const response = await fetch(`/api/custom-payments/${orderId}/approve`, {
        method: 'POST',
      })
      
      if (response.ok) {
        // Remove approved payment from list
        setPendingPayments(prev => prev.filter((payment: any) => payment.orderId !== orderId))
        alert('Payment approved successfully!')
      } else {
        alert('Failed to approve payment')
      }
    } catch (error) {
      console.error('Failed to approve payment:', error)
      alert('Failed to approve payment')
    } finally {
      setApproving('')
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-blue-500 mb-6">Payment Approvals</h2>
        <div className="text-center py-8">Loading pending payments...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-blue-500 mb-6">Payment Approvals</h2>
      
      {pendingPayments.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">No pending payments</div>
          <Button onClick={loadPendingPayments} variant="outline">
            Refresh
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingPayments.map((payment: any) => (
            <Card key={payment.orderId}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="font-semibold text-lg">Order: {payment.orderId}</div>
                    <div className="text-sm text-gray-600">
                      Amount: ₹{payment.amount}
                    </div>
                    <div className="text-sm text-gray-600">
                      Status: <span className="capitalize font-medium text-orange-600">{payment.status?.replace('_', ' ')}</span>
                    </div>
                    {payment.userMarkedPaidAt && (
                      <div className="text-sm text-gray-600">
                        User confirmed payment: {new Date(payment.userMarkedPaidAt).toLocaleString()}
                      </div>
                    )}
                    <div className="text-sm text-gray-600">
                      Created: {new Date(payment.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <Button
                      onClick={() => approvePayment(payment.orderId)}
                      disabled={approving === payment.orderId}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {approving === payment.orderId ? 'Approving...' : 'Approve Payment'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <div className="flex justify-center pt-4">
            <Button onClick={loadPendingPayments} variant="outline">
              Refresh List
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Add this after the imports
const WEBHOOK_SECRET =
  "iimt_webhook_2024_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
console.log("Generated Webhook Secret:", WEBHOOK_SECRET)

export default function Portal() {
  const [activeSection, setActiveSection] = useState("AlumniPortal")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navigationItems = [
    { id: "AdmitCard", label: "Admit Card", icon: CreditCard },
    { id: "AlumniPortal", label: "AlumniPortal", icon: Users },
    { id: "PaymentApprovals", label: "Payment Approvals", icon: FileCheck },
    { id: "Attendance", label: "Attendance", icon: UserCheck },
    { id: "CentralCommunication", label: "Central Communication", icon: MessageSquare },
    { id: "Circular", label: "Circular", icon: FileText },
    { id: "CollegeInfo", label: "College Info", icon: BarChart3 },
    { id: "ConvocationForm", label: "Convocation Form", icon: FileCheck },
    { id: "Courses", label: "Courses", icon: BookOpen },
    { id: "FeeUndertaking", label: "Fee Undertaking", icon: DollarSign },
    { id: "Feedback", label: "Feedback", icon: Star },
    { id: "Donation", label: "Donation", icon: Heart },
    { id: "GrievanceComplaint", label: "Grievance Complaint", icon: AlertTriangle },
    { id: "LMS", label: "LMS", icon: GraduationCap },
    { id: "MyReportCard", label: "My Report Card", icon: FileSpreadsheet },
    { id: "NEFTForm", label: "NEFT Form", icon: Banknote },
  ]

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      window.location.href = "/"
    }
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Add payment integration function
  const handleDonateNow = async () => {
    try {
      console.log("🚀 Redirecting to donation page...");
      
      // Redirect to the new donation page
      window.location.href = '/donate';
    } catch (error) {
      console.error("❌ Error redirecting to donation page:", error);
    }
  };

  const renderContent = () => {
    if (activeSection === "Donation") {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-blue-500 mb-6">Donation</h2>
          <div className="space-y-6">
            {/* Student Profile Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-6">
                  {/* Profile Picture - Student Avatar with Graduation Cap */}
                  <div className="w-32 h-32 flex-shrink-0">
                    <div className="w-full h-full bg-gradient-to-br from-cyan-100 to-cyan-300 rounded-full flex items-center justify-center border-4 border-cyan-400 relative overflow-hidden">
                      {/* Student Avatar SVG */}
                      <svg
                        viewBox="0 0 200 200"
                        className="w-24 h-24 text-gray-700"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {/* Graduation Cap */}
                        <path d="M50 80 L100 70 L150 80 L150 90 L145 92 L145 110 C145 115 125 120 100 120 C75 120 55 115 55 110 L55 92 L50 90 Z" />
                        <path d="M100 70 L170 80 L170 85 L100 75 L30 85 L30 80 Z" />
                        {/* Tassel */}
                        <circle cx="150" cy="85" r="3" />
                        <line x1="150" y1="88" x2="150" y2="95" strokeWidth="2" stroke="currentColor" />

                        {/* Face */}
                        <circle cx="100" cy="130" r="25" fill="currentColor" />

                        {/* Body/Shoulders */}
                        <path d="M60 180 C60 160 75 150 100 150 C125 150 140 160 140 180 L140 200 L60 200 Z" />

                        {/* Graduation Gown V-neck */}
                        <path d="M85 150 L100 170 L115 150" fill="none" stroke="white" strokeWidth="2" />
                      </svg>

                      {/* Student Badge */}
                      <div className="absolute bottom-2 right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white">
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
                        <span className="ml-2 text-gray-900">
                          IIMT/25-26/26641 (This is a preadmission application No)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Donation Form Card */}
            <Card>
              <CardHeader>
                <CardTitle>Make a Donation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Donation Type</p>
                    <p className="text-lg text-gray-900">General Fund</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Payment Method</p>
                    <p className="text-lg text-gray-900">Online/UPI</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tax Benefit</p>
                    <p className="text-lg text-gray-900">80G Available</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Support IIMT Group of Colleges by making a donation. You can choose your preferred amount on the next page.
                  </p>
                </div>
                <div className="mt-6">
                  <Button
                    onClick={handleDonateNow}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Donate Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }

    if (activeSection === "PaymentApprovals") {
      return <PaymentApprovalsContent />
    }

    // Default dashboard view with service cards
    const services = [
      { name: "Admit Card", icon: CreditCard },
      { name: "AlumniPortal", icon: Settings },
      { name: "Attendance", icon: UserCheck },
      { name: "Central Communication", icon: MessageSquare },
      { name: "Circular", icon: FileText },
      { name: "College Info", icon: BarChart3 },
      { name: "Convocation Form", icon: FileCheck },
      { name: "Courses", icon: BookOpen },
      { name: "Fee Undertaking", icon: DollarSign },
      { name: "Feedback", icon: Star },
      { name: "Donation", icon: Heart },
      { name: "Grievance Complaint", icon: AlertTriangle },
      { name: "LMS", icon: Monitor },
      { name: "My Report Card", icon: FileSpreadsheet },
      { name: "NEFT Form", icon: Banknote },
      { name: "Performances", icon: TrendingUp },
      { name: "Student Request Service", icon: Settings },
      { name: "Survey", icon: Star },
      { name: "Time Table", icon: Calendar },
    ]

    return (
      <div className="p-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <div
                key={index}
                className="flex flex-col items-center justify-center space-y-4 p-6 hover:bg-gray-50 rounded-lg cursor-pointer transition-all duration-200 min-h-[120px]"
                onClick={() => service.name === "Donation" && setActiveSection("Donation")}
              >
                <Icon className="h-16 w-16 text-blue-500" strokeWidth={1.5} fill="none" />
                <span className="text-sm font-medium text-gray-600 text-center leading-tight">{service.name}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-16"
        } bg-gradient-to-b from-blue-400 to-blue-600 text-white flex-shrink-0 transition-all duration-300 ease-in-out`}
      >
        <div className="p-4">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center ${
                    sidebarOpen ? "space-x-3 px-3" : "justify-center px-2"
                  } py-2 rounded-lg text-left transition-colors ${
                    activeSection === item.id
                      ? "bg-blue-500 bg-opacity-80 text-white shadow-md"
                      : "text-white hover:bg-blue-500 hover:bg-opacity-60 hover:text-white"
                  }`}
                  title={!sidebarOpen ? item.label : ""}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm">{item.label}</span>}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Button variant="ghost" size="sm" className="mr-4 hover:bg-gray-100" onClick={toggleSidebar}>
                  {sidebarOpen ? <X className="h-4 w-4 mr-2" /> : <Menu className="h-4 w-4 mr-2" />}
                  Menu
                </Button>
              </div>
              <div className="flex-1 flex justify-center">
                <Image
                  src="/images/iimt-group-logo.png"
                  alt="IIMT Group of Colleges"
                  width={200}
                  height={48}
                  className="h-12 w-auto object-contain"
                  priority
                />
              </div>
              <div className="flex items-center space-x-4">
                <Bell className="h-6 w-6 text-gray-500" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-100">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">A</span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">Ajeet</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 bg-slate-800 text-white">
                    <div className="p-4 bg-slate-800">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">A</span>
                        </div>
                        <span className="text-lg font-semibold text-white">Ajeet</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <GraduationCap className="h-4 w-4 text-green-400" />
                          <span className="text-gray-300">B.PHAR_2025-2026_I_Sem I Sem I</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-4 w-4 text-green-400" />
                          <span className="text-gray-300">173499T250025ZMI26</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-300">IIMT Group of Colleges</span>
                        </div>
                      </div>
                    </div>
                    <DropdownMenuSeparator className="bg-gray-600" />
                    <DropdownMenuItem className="text-white hover:bg-slate-700 cursor-pointer">
                      <Users className="h-4 w-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-white hover:bg-slate-700 cursor-pointer">
                      <FileText className="h-4 w-4 mr-2" />
                      Reset Password
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-600" />
                    <DropdownMenuItem className="text-white hover:bg-slate-700 cursor-pointer" onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          <div className="bg-teal-500 text-white text-center py-2">
            <span className="text-sm">● IIMT Group of Colleges</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">{renderContent()}</div>
      </div>
    </div>
  )
}
