"use client"

import { createContext, useContext, type ReactNode } from "react"

type UserRole = "Administrador" | "Cajero" | "Técnico"

interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

interface AuthContextType {
  user: User | null
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user data - in real app this would come from authentication
const mockUser: User = {
  id: "1",
  name: "Juan Pérez",
  email: "juan@lubrismart.com",
  role: "Administrador",
}

const rolePermissions: Record<UserRole, string[]> = {
  Administrador: [
    "dashboard.view",
    "pos.use",
    "inventory.manage",
    "customers.manage",
    "analytics.view",
    "settings.manage",
    "profile.edit",
  ],
  Cajero: ["dashboard.view", "pos.use", "inventory.view", "customers.create", "profile.edit"],
  Técnico: ["dashboard.view", "inventory.view", "customers.manage", "analytics.view", "profile.edit"],
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const hasPermission = (permission: string): boolean => {
    if (!mockUser) return false
    return rolePermissions[mockUser.role]?.includes(permission) || false
  }

  return <AuthContext.Provider value={{ user: mockUser, hasPermission }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface ProtectedComponentProps {
  permission: string
  children: ReactNode
  fallback?: ReactNode
}

export function ProtectedComponent({ permission, children, fallback = null }: ProtectedComponentProps) {
  const { hasPermission } = useAuth()

  if (!hasPermission(permission)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
