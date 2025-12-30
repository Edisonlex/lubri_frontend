"use client"

import { SupplierManagement } from "@/components/suppliers/supplier-management"
import { GISProvider } from "@/contexts/gis-context"
import { POSProvider } from "@/contexts/pos-context"

export default function SuppliersPage() {
  return (
    <POSProvider>
      <GISProvider>
        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
          <SupplierManagement />
        </div>
      </GISProvider>
    </POSProvider>
  )
}