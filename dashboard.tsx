"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { User, GraduationCap, LogOut, Bell } from "lucide-react"

export default function Dashboard() {
  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      window.location.href = "/"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/images/iimt-university-logo.png" alt="IIMT University" className="h-10 w-auto" />
            </div>
            <div className="flex items-center space-x-4">
              <Bell className="h-6 w-6 text-gray-500" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">S</span>
                </div>
                <span className="text-sm font-medium text-gray-700">Student</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-1 bg-transparent"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600">Welcome to IIMT University Portal</p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile</h3>
                <p className="text-sm text-gray-600 mb-4">View and manage your personal information</p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">View Profile</Button>
              </div>
            </CardContent>
          </Card>

          {/* Fees Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <GraduationCap className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Fees</h3>
                <p className="text-sm text-gray-600 mb-4">Check fee status and payment history</p>
                <Button className="w-full bg-green-600 hover:bg-green-700">View Fees</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Info Section */}
        <div className="mt-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Student Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Student ID</p>
                  <p className="text-lg text-gray-900">52250200</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="text-lg text-green-600">Active</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Course</p>
                  <p className="text-lg text-gray-900">Not Specified</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Semester</p>
                  <p className="text-lg text-gray-900">Current</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
