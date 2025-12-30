"use client"


import { UserManagement } from "@/components/users/user-management"
import { POSProvider } from "@/contexts/pos-context"

export default function UsersPage() {
  return (
    
      <div className="container mx-auto p-6">
        <UserManagement />
      </div>
    
  )
}