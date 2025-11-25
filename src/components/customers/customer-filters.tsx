"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { customerFiltersSchema } from "@/lib/validation";

interface CustomerFiltersProps {
  filters: {
    customerType: string;
    status: string;
    city: string;
    search: string;
  };
  setFilters: (filters: any) => void;
}

export function CustomerFilters({ filters, setFilters }: CustomerFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setMounted(true);
    const handleResize = () => setIsDesktop(window.innerWidth >= 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const clearFilters = () => {
    setFilters({
      customerType: "all",
      status: "all",
      city: "all",
      search: "",
    });
  };

  const hasActiveFilters =
    filters.customerType !== "all" ||
    filters.status !== "all" ||
    filters.city !== "all" ||
    filters.search !== "";

  return (
    <div className="bg-background rounded-lg border shadow-sm overflow-hidden">
      {/* Header - Always visible */}
      <div className="flex items-center justify-between p-3 sm:p-6">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 sm:gap-2 cursor-pointer sm:cursor-default hover:bg-accent/50 rounded-md p-1 -m-1 transition-colors duration-200 focus:outline-none focus:ring-0 active:bg-transparent"
        >
          <Filter className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          <span className="font-medium text-xs sm:text-sm">Filtros</span>
          <ChevronDown
            className={`h-3 w-3 sm:hidden text-muted-foreground transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground h-7 sm:h-8 text-xs sm:text-sm"
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Filters Content - Collapsible on mobile, always visible on desktop */}
      <AnimatePresence>
        {mounted && (isExpanded || isDesktop) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="sm:block"
          >
            <div className="px-3 pb-3 sm:px-6 sm:pb-6 sm:pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
                {/* Search */}
                <div className="sm:col-span-2 lg:col-span-2 relative">
                  <Search className="absolute left-2 top-2 h-3.5 w-3.5 sm:left-2.5 sm:top-2.5 sm:h-4 sm:w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar clientes..."
                    value={filters.search}
                    onChange={(e) => {
                      const next = { ...filters, search: e.target.value.trim() };
                      const result = customerFiltersSchema.safeParse(next);
                      if (!result.success) {
                        const fieldErrors: Record<string, string> = {};
                        result.error.errors.forEach((err) => {
                          const key = String(err.path[0] ?? "general");
                          fieldErrors[key] = err.message;
                        });
                        setErrors(fieldErrors);
                        return;
                      }
                      setErrors({});
                      setFilters(result.data);
                    }}
                    className="w-full pl-7 sm:pl-8 text-xs sm:text-sm bg-background h-8 sm:h-10"
                  />
                  {errors.search && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.search}
                    </p>
                  )}
                </div>

                {/* Customer Type Filter */}
                <Select
                  value={filters.customerType}
                  onValueChange={(value) =>
                    setFilters({ ...filters, customerType: value })
                  }
                >
                  <SelectTrigger className="w-full text-xs sm:text-sm h-8 sm:h-10">
                    <SelectValue placeholder="Tipo de Cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs sm:text-sm">
                      Todos los tipos
                    </SelectItem>
                    <SelectItem
                      value="individual"
                      className="text-xs sm:text-sm"
                    >
                      Individual
                    </SelectItem>
                    <SelectItem value="business" className="text-xs sm:text-sm">
                      Empresa
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select
                  value={filters.status}
                  onValueChange={(value) =>
                    setFilters({ ...filters, status: value })
                  }
                >
                  <SelectTrigger className="w-full text-xs sm:text-sm h-8 sm:h-10">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs sm:text-sm">
                      Todos los estados
                    </SelectItem>
                    <SelectItem value="active" className="text-xs sm:text-sm">
                      Activo
                    </SelectItem>
                    <SelectItem value="inactive" className="text-xs sm:text-sm">
                      Inactivo
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* City Filter */}
                <Select
                  value={filters.city}
                  onValueChange={(value) =>
                    setFilters({ ...filters, city: value })
                  }
                >
                  <SelectTrigger className="w-full text-xs sm:text-sm h-8 sm:h-10">
                    <SelectValue placeholder="Ciudad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs sm:text-sm">
                      Todas las ciudades
                    </SelectItem>
                    <SelectItem value="quito" className="text-xs sm:text-sm">
                      Quito
                    </SelectItem>
                    <SelectItem
                      value="guayaquil"
                      className="text-xs sm:text-sm"
                    >
                      Guayaquil
                    </SelectItem>
                    <SelectItem value="cuenca" className="text-xs sm:text-sm">
                      Cuenca
                    </SelectItem>
                    <SelectItem value="ambato" className="text-xs sm:text-sm">
                      Ambato
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      
    </div>
  );
}
