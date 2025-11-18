"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"

// Definición de tipos
export type UserRole = "admin" | "cashier" | "technician"

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  status?: "active" | "inactive"; // Agrega esta propiedad opcional
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  hasPermission: (permission: string) => boolean
}

// Mapeo de roles para compatibilidad con el sistema anterior
const roleMapping: Record<string, UserRole> = {
  admin: "admin",
  cashier: "cashier",
  technician: "technician",
  manager: "technician",
  Administrador: "admin",
  Cajero: "cashier",
  Técnico: "technician",
};

// Datos de login simulados (en una aplicación real esto vendría del backend)
const loginCredentials = [
  {
    email: "admin@lubricadora.com",
    password: "admin123",
    userId: "1"
  },
  {
    email: "cajero1@lubricadora.com",
    password: "cajero123",
    userId: "2"
  },
  {
    email: "cajero2@lubricadora.com",
    password: "cajero123",
    userId: "5"
  },
  {
    email: "tecnico1@lubricadora.com",
    password: "tecnico123",
    userId: "6"
  },
  {
    email: "tecnico2@lubricadora.com",
    password: "tecnico123",
    userId: "7"
  }
]

const rolePermissions: Record<UserRole, string[]> = {
  admin: [
    "dashboard.view",
    "pos.use",
    "inventory.manage",
    "customers.manage",
    "customers.view",
    "analytics.view",
    "settings.manage",
    "profile.edit",
    "sri.invoice",
    "users.manage",
    "backup.manage",
  ],
  cashier: [
    "dashboard.view",
    "pos.use",
    "inventory.view",
    "customers.create",
    "profile.edit",
    "sri.invoice",
  ],
  technician: [
    "dashboard.view",
    "inventory.view",
    "services.use",
    "customers.view",
    "profile.edit",
  ],
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Proveedor del contexto
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  
  // Verificar si hay un usuario en localStorage al cargar
  useEffect(() => {
    const storedUser = document.cookie
      .split('; ')
      .find(row => row.startsWith('user='))
      ?.split('=')[1]
    
    if (storedUser) {
      try {
        setUser(JSON.parse(decodeURIComponent(storedUser)))
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
    setIsLoading(false)
  }, [])

  // Función de login
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Verificar credenciales
      const credentials = loginCredentials.find(
        (cred) => cred.email === email && cred.password === password
      );

      if (!credentials) {
        setUser(null);
        setIsLoading(false);
        return false;
      }

      // Obtener datos del usuario desde la API
      const users = await api.getUsers();
      const foundUser = users.find((u) => u.id === credentials.userId);

      if (!foundUser) {
        setUser(null);
        setIsLoading(false);
        return false;
      }

      // Mapear el rol correctamente
      const userRole = roleMapping[foundUser.role.toLowerCase()] || "cashier";

      const userWithMappedRole = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: userRole,
        avatar: "/placeholder-user.jpg",
        status: foundUser.status,
      };

      setUser(userWithMappedRole);
      document.cookie = `user=${encodeURIComponent(
        JSON.stringify(userWithMappedRole)
      )}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
      setIsLoading(false);
      if (userRole === "cashier") {
        router.push("/pos");
      } else if (userRole === "technician") {
        router.push("/dashboard");
      } else {
        router.push("/dashboard");
      }
      return true;
    } catch (error) {
      console.error("Error en login:", error);
      setUser(null);
      setIsLoading(false);
      return false;
    }
  };

  // Función de logout
  const logout = () => {
    setUser(null)
    document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    router.push('/login')
  }

  // Verificar permisos
  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    return rolePermissions[user.role]?.includes(permission) || false
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user,
        isLoading,
        login, 
        logout, 
        hasPermission 
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Hook personalizado para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}

// Componente para proteger rutas
export function ProtectedRoute({ 
  children,
  permission,
}: { 
  children: ReactNode
  permission?: string
}) {
  const { isAuthenticated, isLoading, hasPermission } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
    
    if (permission && !hasPermission(permission)) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isLoading, permission, hasPermission, router])

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>
  }

  if (!isAuthenticated) {
    return null
  }

  if (permission && !hasPermission(permission)) {
    return null
  }

  return <>{children}</>
}