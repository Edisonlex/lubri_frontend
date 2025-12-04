"use client"

import { SupplierManagement } from "@/components/suppliers/supplier-management"
import { GISProvider } from "@/contexts/gis-context"
import { POSProvider } from "@/contexts/pos-context"
import { ProtectedRoute } from "@/contexts/auth-context"

export default function SuppliersPage() {
  return (
    <ProtectedRoute permission="suppliers.view">
      <POSProvider>
        <GISProvider>
          <div className="container mx-auto p-6">
            <SupplierManagement />
          </div>
        </GISProvider>
      </POSProvider>
    </ProtectedRoute>
  )
}