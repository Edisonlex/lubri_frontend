"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface InventoryFiltersProps {
  filters: {
    category: string;
    brand: string;
    status: string;
    stockLevel: string;
    search: string;
  };
  setFilters: (filters: any) => void;
}

export function InventoryFilters({
  filters,
  setFilters,
}: InventoryFiltersProps) {
  const isMobile = useIsMobile();

  const clearFilters = () => {
    setFilters({
      category: "all",
      brand: "all",
      status: "all",
      stockLevel: "all",
      search: "",
    });
  };

  const hasActiveFilters =
    filters.category !== "all" ||
    filters.brand !== "all" ||
    filters.status !== "all" ||
    filters.stockLevel !== "all" ||
    filters.search !== "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className={`bg-card rounded-lg border ${
        isMobile ? "p-1.5 space-y-1.5" : "p-3 md:p-4 space-y-3 md:space-y-4"
      }`}
    >
      <div className="flex items-center justify-between">
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className={`text-muted-foreground ${
              isMobile ? "h-6 text-xs px-1.5" : "h-8 text-sm px-2"
            }`}
          >
            <X className={isMobile ? "h-3 w-3 mr-0.5" : "h-4 w-4 mr-1"} />
            Limpiar
          </Button>
        )}
      </div>

      <div
        className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 ${
          isMobile ? "gap-1.5" : "gap-3 md:gap-4"
        }`}
      >
        {/* Search */}
        <div className="col-span-2 sm:col-span-3 lg:col-span-2 relative">
          <Search
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
              isMobile ? "h-3 w-3" : "h-4 w-4"
            } text-muted-foreground`}
          />
          <Input
            placeholder="Buscar productos..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className={isMobile ? "pl-8 h-7 text-xs" : "pl-10 h-10 text-sm"}
          />
        </div>

        {/* Category Filter */}
        <div className="col-span-1">
          <Select
            value={filters.category}
            onValueChange={(value) =>
              setFilters({ ...filters, category: value })
            }
          >
            <SelectTrigger
              className={isMobile ? "h-7 text-xs" : "h-10 text-sm"}
            >
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              <SelectItem value="aceites">Aceites</SelectItem>
              <SelectItem value="filtros">Filtros</SelectItem>
              <SelectItem value="lubricantes">Lubricantes</SelectItem>
              <SelectItem value="aditivos">Aditivos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Brand Filter */}
        <div className="col-span-1">
          <Select
            value={filters.brand}
            onValueChange={(value) => setFilters({ ...filters, brand: value })}
          >
            <SelectTrigger
              className={isMobile ? "h-7 text-xs" : "h-10 text-sm"}
            >
              <SelectValue placeholder="Marca" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las marcas</SelectItem>
              <SelectItem value="mobil">Mobil</SelectItem>
              <SelectItem value="castrol">Castrol</SelectItem>
              <SelectItem value="shell">Shell</SelectItem>
              <SelectItem value="valvoline">Valvoline</SelectItem>
              <SelectItem value="motul">Motul</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="col-span-1">
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters({ ...filters, status: value })}
          >
            <SelectTrigger
              className={isMobile ? "h-7 text-xs" : "h-10 text-sm"}
            >
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="active">Activo</SelectItem>
              <SelectItem value="inactive">Inactivo</SelectItem>
              <SelectItem value="discontinued">Descontinuado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stock Level Filter */}
        <div className="col-span-1">
          <Select
            value={filters.stockLevel}
            onValueChange={(value) =>
              setFilters({ ...filters, stockLevel: value })
            }
          >
            <SelectTrigger
              className={isMobile ? "h-7 text-xs" : "h-10 text-sm"}
            >
              <SelectValue placeholder="Nivel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los niveles</SelectItem>
              <SelectItem value="low">Stock bajo</SelectItem>
              <SelectItem value="normal">Stock normal</SelectItem>
              <SelectItem value="high">Stock alto</SelectItem>
              <SelectItem value="out">Sin stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </motion.div>
  );
}
