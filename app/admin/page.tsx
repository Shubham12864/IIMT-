"use client";

import { useEffect } from 'react';

export default function AdminPage() {
  useEffect(() => {
    // Redirect to admin login
    window.location.href = '/admin/login';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p>Redirecting to admin login...</p>
      </div>
    </div>
  );
}
