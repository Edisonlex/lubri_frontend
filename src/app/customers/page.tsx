"use client"

import { CustomerManagement } from "@/components/customers/customer-management"
import { POSProvider } from "@/contexts/pos-context"
import { GISProvider } from "@/contexts/gis-context"
import { ProtectedRoute } from "@/contexts/auth-context"

export default function CustomersPage() {
  return (
    <ProtectedRoute permission="customers.view">
      <POSProvider>
        <GISProvider>
          <div className="container mx-auto p-6">
            <CustomerManagement />
          </div>
        </GISProvider>
      </POSProvider>
    </ProtectedRoute>
  )
}
