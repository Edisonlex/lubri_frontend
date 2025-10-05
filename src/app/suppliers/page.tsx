"use client"

import { SupplierManagement } from "@/components/suppliers/supplier-management"
import { POSProvider } from "@/contexts/pos-context"

export default function SuppliersPage() {
  return (
    
      <div className="container mx-auto p-6">
        <SupplierManagement />
      </div>
    
  )
}