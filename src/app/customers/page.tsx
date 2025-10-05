"use client"

import { CustomerManagement } from "@/components/customers/customer-management"
import { POSProvider } from "@/contexts/pos-context"

export default function CustomersPage() {
  return (
    <POSProvider>
      <div className="container mx-auto p-6">
        
        <CustomerManagement />
      </div>
    </POSProvider>
  )
}
