"use client";

import { AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const totalItems = suppliers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIdx = (page - 1) * pageSize;
  const pagedSuppliers = suppliers.slice(startIdx, startIdx + pageSize);

  useEffect(() => {
    setPage(1);
  }, [suppliers, pageSize]);
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
    <div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
        {pagedSuppliers.map((supplier) => (
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
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">Mostrar</span>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            <option value={6}>6</option>
            <option value={12}>12</option>
            <option value={24}>24</option>
          </select>
          <span className="text-sm">por página</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
            Anterior
          </Button>
          <span className="text-sm">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
