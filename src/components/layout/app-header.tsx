// components/app-header.tsx
"use client";

import { Search, User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppSidebar } from "./app-sidebar";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { NotificationsDropdown } from "./notifications-dropdown";

export function AppHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="bg-background border-b border-border px-3 sm:px-4 md:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          {/* Mobile Sidebar Trigger */}
          <div className="md:hidden">
            <AppSidebar />
          </div>

          {/* Search - responsive width */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                className="pl-8 sm:pl-10 h-8 sm:h-10 w-full text-xs sm:text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4">
          {/* Theme Toggle - hidden on very small screens */}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          {/* Notifications - usando el nuevo componente conectado al contexto */}
          <NotificationsDropdown />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full p-0"
              >
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  </AvatarFallback>
                </Avatar>
                <span className="sr-only">Menú de usuario</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-48 sm:w-56"
              align="end"
              forceMount
            >
              <DropdownMenuLabel className="font-normal p-3 sm:p-4">
                <div className="flex flex-col space-y-0.5 sm:space-y-1">
                  <p className="text-xs sm:text-sm font-medium leading-none">
                    {user?.name || "Usuario"}
                  </p>
                  <p className="text-[10px] sm:text-xs leading-none text-muted-foreground">
                    {user?.email || "usuario@lubrismart.com"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="h-8 sm:h-10 text-xs sm:text-sm"
                onClick={() => router.push("/profile")}
              >
                <User className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem
                className="h-8 sm:h-10 text-xs sm:text-sm"
                onClick={() => router.push("/settings")}
              >
                <Settings className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Configuración
              </DropdownMenuItem>
              <div className="sm:hidden">
                <DropdownMenuSeparator />
                <DropdownMenuItem className="h-8 sm:h-10 flex items-center justify-between text-xs sm:text-sm">
                  <span>Tema</span>
                  <ThemeToggle />
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="h-8 sm:h-10 text-xs sm:text-sm"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
