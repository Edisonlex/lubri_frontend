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
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
      
      {/* Pagination - responsive */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 sm:mt-6">
        <div className="flex items-center gap-2 text-sm">
          <span className="hidden sm:inline">Mostrar</span>
          <select
            className="border rounded px-2 py-1 text-sm h-8"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            <option value={6}>6</option>
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
          </select>
          <span className="hidden sm:inline">por página</span>
          <span className="text-muted-foreground">({totalItems} total)</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPage(Math.max(1, page - 1))} 
            disabled={page === 1}
            className="h-8 px-3"
          >
            <span className="hidden sm:inline">Anterior</span>
            <span className="sm:hidden">‹</span>
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
              if (pageNum > totalPages) return null;
              
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                  className={`h-8 w-8 p-0 ${pageNum === page ? 'bg-primary text-primary-foreground' : ''}`}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPage(Math.min(totalPages, page + 1))} 
            disabled={page === totalPages}
            className="h-8 px-3"
          >
            <span className="hidden sm:inline">Siguiente</span>
            <span className="sm:hidden">›</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
