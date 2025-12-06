"use client"

import { CustomerManagement } from "@/components/customers/customer-management"
import { ProtectedRoute } from "@/contexts/auth-context"

export default function CustomersPage() {
  return (
    <ProtectedRoute permission="customers.view">
      <div className="container mx-auto p-6">
        <CustomerManagement />
      </div>
    </ProtectedRoute>
  )
}
