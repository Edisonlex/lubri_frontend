"use client";

import { AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import { SupplierCard } from "./supplier-card";

interface SupplierListProps {
  suppliers: any[];
  onViewSupplier: (supplier: any) => void;
  onEditSupplier: (supplier: any) => void;
  onDeleteSupplier: (supplierId: string) => void;
  getSupplierField: (supplier: any, field: string) => any;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function SupplierList({
  suppliers,
  onViewSupplier,
  onEditSupplier,
  onDeleteSupplier,
  getSupplierField,
  hasActiveFilters,
  onClearFilters,
}: SupplierListProps) {
  if (suppliers.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No se encontraron proveedores</p>
          <p className="text-sm">
            {hasActiveFilters
              ? "Intenta con otros términos de búsqueda o limpia los filtros"
              : "Crea un nuevo proveedor para comenzar"}
          </p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={onClearFilters} className="mt-2">
              Limpiar filtros
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence>
        {suppliers.map((supplier) => (
          <SupplierCard
            key={supplier.id}
            supplier={supplier}
            onView={onViewSupplier}
            onEdit={onEditSupplier}
            onDelete={onDeleteSupplier}
            getSupplierField={getSupplierField}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
