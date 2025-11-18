"use client"


import { UserManagement } from "@/components/users/user-management"
import { POSProvider } from "@/contexts/pos-context"
import { ProtectedRoute } from "@/contexts/auth-context"

export default function UsersPage() {
  return (
    <ProtectedRoute permission="users.manage">
      <div className="container mx-auto p-6">
        <UserManagement />
      </div>
    </ProtectedRoute>
  )
}