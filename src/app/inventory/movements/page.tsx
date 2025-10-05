"use client";

import { useState, useEffect } from "react";
import { StockMovementHistory } from "@/components/inventory/stock-movement-history";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, Calendar, Filter, X, ChevronDown } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, StockMovement } from "@/lib/api";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";
import { MovementsExportModal } from "@/components/inventory/export/movements-export-modal";
import { Badge } from "@/components/ui/badge";

export default function MovementsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [movementType, setMovementType] = useState("all");
  const [dateRange, setDateRange] = useState<
    { from: Date; to: Date } | undefined
  >();
  const [allMovements, setAllMovements] = useState<StockMovement[]>([]);
  const [filteredMovements, setFilteredMovements] = useState<StockMovement[]>(
    []
  );
  const [showFilters, setShowFilters] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const loadMovements = async () => {
      setIsLoading(true);
      try {
        const movements = await api.getStockMovements();
        setAllMovements(movements);
        setFilteredMovements(movements);
      } catch (error) {
        console.error("Error loading movements:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMovements();
  }, []);

  // Filtrar movimientos cuando cambian los filtros
  useEffect(() => {
    let filtered = allMovements;

    // Filtrar por tipo
    if (movementType && movementType !== "all") {
      const typeMap: Record<string, string> = {
        entry: "entrada",
        sale: "salida",
        adjustment: "ajuste",
      };

      if (typeMap[movementType]) {
        filtered = filtered.filter(
          (movement) => movement.type === typeMap[movementType]
        );
      }
    }

    // Filtrar por fecha
    if (dateRange?.from && dateRange?.to) {
      filtered = filtered.filter((movement) => {
        const movementDate = new Date(movement.date);
        return movementDate >= dateRange.from && movementDate <= dateRange.to;
      });
    }

    setFilteredMovements(filtered);
  }, [allMovements, movementType, dateRange]);

  const handleDateChange = (range: { from: Date; to: Date } | undefined) => {
    setDateRange(range);
  };

  const clearFilters = () => {
    setMovementType("all");
    setDateRange(undefined);
    if (isMobile) {
      setShowFilters(false);
    }
  };

  const hasActiveFilters = movementType !== "all" || dateRange;

  return (
    <div className="max-w-7xl mx-auto space-y-3 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1">
              Historial de Movimientos
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Seguimiento en tiempo real de entradas, salidas y ajustes
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            {/* ELIMINÉ el botón de Filtros de aquí - Solo queda Exportar */}
            <MovementsExportModal
              movements={filteredMovements}
              dateRange={dateRange}
              movementType={movementType}
              disabled={isLoading || filteredMovements.length === 0}
            />
          </div>
        </div>
      </motion.div>

      {/* Filtros para desktop */}
      {!isMobile && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
              <div className="w-full sm:w-auto">
                <label className="text-sm font-medium mb-1 block">
                  Rango de Fechas
                </label>
                <DatePickerWithRange
                  value={dateRange}
                  onChange={handleDateChange}
                  className="w-full sm:w-auto"
                />
              </div>

              <div className="w-full sm:w-48">
                <label className="text-sm font-medium mb-1 block">
                  Tipo de Movimiento
                </label>
                <Select value={movementType} onValueChange={setMovementType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los movimientos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los movimientos</SelectItem>
                    <SelectItem value="entry">Entradas</SelectItem>
                    <SelectItem value="sale">Ventas</SelectItem>
                    <SelectItem value="adjustment">Ajustes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="h-10"
                >
                  <Filter className="h-4 w-4 mr-1" />
                  Limpiar
                </Button>
              )}
            </div>

            {/* Resumen de filtros */}
            {hasActiveFilters && (
              <div className="mt-3 p-2 bg-muted/50 rounded text-sm">
                <span className="font-medium">Filtros activos:</span>
                {movementType !== "all" && (
                  <span className="ml-2">
                    Tipo:{" "}
                    {movementType === "entry"
                      ? "Entradas"
                      : movementType === "sale"
                      ? "Ventas"
                      : "Ajustes"}
                  </span>
                )}
                {dateRange && (
                  <span className="ml-2">
                    Fechas: {dateRange.from.toLocaleDateString()} -{" "}
                    {dateRange.to.toLocaleDateString()}
                  </span>
                )}
                <span className="ml-2">
                  • Mostrando {filteredMovements.length} de{" "}
                  {allMovements.length} movimientos
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filtros para móvil - SOLO este componente se muestra en móvil */}
      {isMobile && (
        <div className="bg-background rounded-lg border shadow-sm overflow-hidden">
          {/* Header - Siempre visible */}
          <div className="flex items-center justify-between p-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 rounded-md p-1 -m-1 transition-colors duration-200"
            >
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">Filtros</span>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                  !
                </Badge>
              )}
            </button>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground h-7 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Limpiar
              </Button>
            )}
          </div>

          {/* Contenido de Filtros - Colapsable */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="px-3 pb-3 border-t">
                  <div className="space-y-3 pt-3">
                    {/* Selector de Fechas */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Rango de Fechas
                      </label>
                      <DatePickerWithRange
                        value={dateRange}
                        onChange={handleDateChange}
                        
                      />
                    </div>

                    {/* Selector de Tipo de Movimiento */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Tipo de Movimiento
                      </label>
                      <Select
                        value={movementType}
                        onValueChange={setMovementType}
                      >
                        <SelectTrigger className="w-full text-sm h-9">
                          <SelectValue placeholder="Todos los movimientos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all" className="text-sm">
                            Todos los movimientos
                          </SelectItem>
                          <SelectItem value="entry" className="text-sm">
                            Entradas
                          </SelectItem>
                          <SelectItem value="sale" className="text-sm">
                            Ventas
                          </SelectItem>
                          <SelectItem value="adjustment" className="text-sm">
                            Ajustes
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowFilters(false)}
                        className="flex-1"
                      >
                        Cerrar
                      </Button>
                      {hasActiveFilters && (
                        <Button
                          variant="default"
                          onClick={clearFilters}
                          className="flex-1"
                        >
                          Limpiar
                        </Button>
                      )}
                    </div>

                    {/* Resumen de filtros activos */}
                    {hasActiveFilters && (
                      <div className="p-3 bg-muted/30 rounded text-xs">
                        <div className="font-medium mb-1">
                          Filtros aplicados:
                        </div>
                        {movementType !== "all" && (
                          <div>
                            Tipo:{" "}
                            {movementType === "entry"
                              ? "Entradas"
                              : movementType === "sale"
                              ? "Ventas"
                              : "Ajustes"}
                          </div>
                        )}
                        {dateRange && (
                          <div>
                            Fechas: {dateRange.from.toLocaleDateString()} -{" "}
                            {dateRange.to.toLocaleDateString()}
                          </div>
                        )}
                        <div className="font-medium mt-1">
                          Mostrando {filteredMovements.length} de{" "}
                          {allMovements.length} movimientos
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Indicador de filtros activos en móvil (cuando los filtros están cerrados) */}
      {isMobile && hasActiveFilters && !showFilters && (
        <div className="bg-muted/30 p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="text-xs">
              <span className="font-medium">Filtros aplicados:</span>
              {movementType !== "all" && (
                <span className="ml-1">
                  {movementType === "entry"
                    ? "Entradas"
                    : movementType === "sale"
                    ? "Ventas"
                    : "Ajustes"}
                </span>
              )}
              {dateRange && (
                <span className="ml-1">
                  • {dateRange.from.toLocaleDateString()} a{" "}
                  {dateRange.to.toLocaleDateString()}
                </span>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {filteredMovements.length} de {allMovements.length} movimientos
          </div>
        </div>
      )}

      {/* Historial de movimientos */}
      <StockMovementHistory
        movements={filteredMovements}
        isLoading={isLoading}
      />
    </div>
  );
}
