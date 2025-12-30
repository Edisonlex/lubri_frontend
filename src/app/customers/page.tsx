"use client"

import { CustomerManagement } from "@/components/customers/customer-management"
import { POSProvider } from "@/contexts/pos-context"
import { GISProvider } from "@/contexts/gis-context"

export default function CustomersPage() {
  return (
    <POSProvider>
      <GISProvider>
        <div className="container mx-auto p-6">
          
          <CustomerManagement />
        </div>
      </GISProvider>
    </POSProvider>
  )
}
