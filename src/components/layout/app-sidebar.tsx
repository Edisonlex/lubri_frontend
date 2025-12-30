"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Home,
  Wrench,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  User,
  Truck,
  IdCard,
  Brain,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/use-mobile";
import { Suspense } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Punto de Venta", href: "/pos", icon: ShoppingCart },
  { name: "Inventario", href: "/inventory", icon: Package },
  { name: "Clientes", href: "/customers", icon: IdCard },
  { name: "Proveedores", href: "/suppliers", icon: Truck },
  { name: "Usuarios", href: "/users", icon: Users },
  { name: "Análisis", href: "/analytics", icon: BarChart3 },
  { name: "Obsolescencia", href: "/obsolescence", icon: AlertTriangle },
  { name: "Clasificación", href: "/classification", icon: Brain },
  { name: "Configuración", href: "/settings", icon: Settings },
  { name: "Mi Perfil", href: "/profile", icon: User },
];

interface AppSidebarProps {
  className?: string;
}

function MobileSidebarContent({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <nav className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Menú</h2>
      </div>
      <div className="flex-1 p-4">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Button
                key={item.name}
                variant={isActive ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleNavigation(item.href)}
              >
                <item.icon className="h-4 w-4 mr-3" />
                {item.name}
              </Button>
            );
          })}
        </nav>
      </div>
    </nav>
  );
}

function MobileSidebar({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("md:hidden h-8 w-8 sm:h-10 sm:w-10 p-0", className)}
        >
          <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-56 sm:w-64 md:w-80 p-0 bg-sidebar">
        <Suspense
          fallback={
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-sidebar-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
                      <Wrench className="w-5 h-5 text-sidebar-primary-foreground" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-sidebar-foreground">
                        LubriSmart
                      </h2>
                      <p className="text-xs text-muted-foreground">v1.0</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setOpen(false)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="text-muted-foreground">Cargando...</div>
              </div>
            </div>
          }
        >
          <MobileSidebarContent onClose={() => setOpen(false)} />
        </Suspense>
      </SheetContent>
    </Sheet>
  );
}

function DesktopSidebar({ className }: { className?: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <motion.div
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "bg-sidebar border-r border-sidebar-border flex flex-col h-full",
        className
      )}
      data-sidebar
      data-collapsed={collapsed}
    >
      {/* Header */}
      <div className="p-2 sm:p-3 md:p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1.5 sm:gap-2 md:gap-3"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
                  <Wrench className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-sidebar-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm md:text-base font-bold text-sidebar-foreground">
                    LubriSmart
                  </h2>
                  <p className="text-[8px] sm:text-[10px] md:text-xs text-muted-foreground">
                    v1.0
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 p-0 hover:bg-sidebar-accent"
          >
            {collapsed ? (
              <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
            ) : (
              <ChevronLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 sm:p-3 md:p-4">
        <ul className="space-y-2 sm:space-y-1.5 md:space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <Button
                variant="ghost"
                onClick={() => handleNavigation(item.href)}
                className={cn(
                  "w-full justify-start h-10 sm:h-10 md:h-12 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
                  collapsed ? "px-2 sm:px-2 md:px-3" : "px-3 sm:px-3 md:px-4",
                  pathname === item.href
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : ""
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5",
                    collapsed ? "" : "mr-3 sm:mr-2 md:mr-3"
                  )}
                />
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm sm:text-xs md:text-sm font-medium"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </li>
          ))}
        </ul>
      </nav>
    </motion.div>
  );
}

export function AppSidebar({ className }: AppSidebarProps) {
  const isMobile = useMobile();

  if (isMobile) {
    return <MobileSidebar className={className} />;
  }

  return <DesktopSidebar className={className} />;
}
