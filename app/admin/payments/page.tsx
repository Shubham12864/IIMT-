"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, XCircle, Clock, Eye, LogOut } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface PaymentDetails {
  orderId: string;
  amount: number;
  name: string;
  email: string;
  phone: string;
  purpose: string;
  donationType: string;
  status: string;
  createdAt: string;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = localStorage.getItem('admin_authenticated');
      const loginTime = localStorage.getItem('admin_login_time');
      
      if (isAuth === 'true' && loginTime) {
        const currentTime = Date.now();
        const loginTimeMs = parseInt(loginTime);
        const timeDiff = currentTime - loginTimeMs;
        
        // Session expires after 2 hours (7200000 ms)
        if (timeDiff < 7200000) {
          setIsAuthenticated(true);
          fetchPayments();
        } else {
          // Session expired
          handleLogout();
        }
      } else {
        // Not authenticated, redirect to login
        window.location.href = '/admin/login';
      }
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_login_time');
    window.location.href = '/admin/login';
  };

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/admin/payments');
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      } else {
        setError('Failed to load payments');
      }
    } catch (err) {
      setError('Failed to load payments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPayments();
  };

  const handleApprovePayment = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/payments/${orderId}/approve`, {
        method: 'POST',
      });
      
      if (response.ok) {
        // Refresh the list after approval
        fetchPayments();
      } else {
        setError('Failed to approve payment');
      }
    } catch (err) {
      setError('Failed to approve payment');
    }
  };

  const handleRejectPayment = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/payments/${orderId}/reject`, {
        method: 'POST',
      });
      
      if (response.ok) {
        // Refresh the list after rejection
        fetchPayments();
      } else {
        setError('Failed to reject payment');
      }
    } catch (err) {
      setError('Failed to reject payment');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_verification':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <Clock className="w-3 h-3 mr-1" />
          Pending Verification
        </Badge>;
      case 'verified':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Verified
        </Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>;
      case 'created':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Clock className="w-3 h-3 mr-1" />
          Created
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const pendingPayments = payments.filter(p => p.status === 'pending_verification');
  const verifiedPayments = payments.filter(p => p.status === 'verified');
  const rejectedPayments = payments.filter(p => p.status === 'rejected');

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p>Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payment Administration</h1>
              <p className="text-gray-600">Manage and verify donation payments</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
              {error}
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2 text-red-600"
                onClick={() => setError('')}
              >
                ×
              </Button>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Payments</p>
                    <p className="text-2xl font-bold">{payments.length}</p>
                  </div>
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Eye className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending Verification</p>
                    <p className="text-2xl font-bold text-yellow-600">{pendingPayments.length}</p>
                  </div>
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Verified</p>
                    <p className="text-2xl font-bold text-green-600">{verifiedPayments.length}</p>
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">{rejectedPayments.length}</p>
                  </div>
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="w-4 h-4 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Donor Details</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No payments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((payment) => (
                      <TableRow key={payment.orderId}>
                        <TableCell className="font-mono text-sm">
                          {payment.orderId}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{payment.name}</div>
                            <div className="text-sm text-gray-500">{payment.email}</div>
                            <div className="text-sm text-gray-500">{payment.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          ₹{payment.amount.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{payment.purpose}</div>
                            <div className="text-sm text-gray-500">{payment.donationType}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(payment.status)}
                        </TableCell>
                        <TableCell>
                          {formatDateTime(payment.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {payment.status === 'pending_verification' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleApprovePayment(payment.orderId)}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRejectPayment(payment.orderId)}
                                >
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <Eye className="w-3 h-3 mr-1" />
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Payment Details</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Order ID</label>
                                      <p className="font-mono text-sm">{payment.orderId}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Amount</label>
                                      <p className="font-semibold">₹{payment.amount.toLocaleString('en-IN')}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Name</label>
                                      <p>{payment.name}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Email</label>
                                      <p>{payment.email}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Phone</label>
                                      <p>{payment.phone}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Status</label>
                                      <div className="mt-1">
                                        {getStatusBadge(payment.status)}
                                      </div>
                                    </div>
                                    <div className="col-span-2">
                                      <label className="text-sm font-medium text-gray-600">Purpose</label>
                                      <p>{payment.purpose}</p>
                                    </div>
                                    <div className="col-span-2">
                                      <label className="text-sm font-medium text-gray-600">Donation Type</label>
                                      <p>{payment.donationType}</p>
                                    </div>
                                    <div className="col-span-2">
                                      <label className="text-sm font-medium text-gray-600">Created At</label>
                                      <p>{formatDateTime(payment.createdAt)}</p>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
