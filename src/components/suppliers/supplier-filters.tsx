"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { supplierCategories, cities } from "./types";

interface SupplierFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterCategory: string;
  onCategoryChange: (value: string) => void;
  filterStatus: string;
  onStatusChange: (value: string) => void;
  filterCity: string;
  onCityChange: (value: string) => void;
  onClearAll: () => void;
}

export function SupplierFilters({
  searchQuery,
  onSearchChange,
  filterCategory,
  onCategoryChange,
  filterStatus,
  onStatusChange,
  filterCity,
  onCityChange,
  onClearAll,
}: SupplierFiltersProps) {
  const hasActiveFilters =
    searchQuery !== "" ||
    filterCategory !== "all" ||
    filterStatus !== "all" ||
    filterCity !== "all";

  return (
    <Card>
      <CardContent className="p-3 sm:p-4">
        <div className="space-y-3">
          {/* Search bar - full width */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nombre, email, teléfono o RUC..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filters row - responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Select value={filterCategory} onValueChange={onCategoryChange}>
              <SelectTrigger className="w-full text-sm h-9">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {supplierCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={onStatusChange}>
              <SelectTrigger className="w-full text-sm h-9">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="inactive">Inactivo</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCity} onValueChange={onCityChange}>
              <SelectTrigger className="w-full text-sm h-9">
                <SelectValue placeholder="Ciudad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las ciudades</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={onClearAll}
                className="whitespace-nowrap text-sm h-9"
                size="sm"
              >
                <X className="h-3 w-3 mr-1" />
                Limpiar
              </Button>
            )}
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-3">
            {searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Búsqueda: "{searchQuery}"
                <button
                  onClick={() => onSearchChange("")}
                  className="hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filterCategory !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Categoría:{" "}
                {
                  supplierCategories.find((c) => c.value === filterCategory)
                    ?.label
                }
                <button
                  onClick={() => onCategoryChange("all")}
                  className="hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filterStatus !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Estado: {filterStatus === "active" ? "Activo" : "Inactivo"}
                <button
                  onClick={() => onStatusChange("all")}
                  className="hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filterCity !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Ciudad: {filterCity}
                <button
                  onClick={() => onCityChange("all")}
                  className="hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
