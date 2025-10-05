"use client";

import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { Calendar, Filter } from "lucide-react";
import { useState } from "react";

interface AnalyticsHeaderProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

export function AnalyticsHeader({
  selectedPeriod,
  onPeriodChange,
}: AnalyticsHeaderProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4"
    >
      {/* Header Principal */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-balance">
            Análisis & Reportes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Dashboards interactivos y reportes avanzados
          </p>
        </div>

        {/* Botón de filtros para móvil */}
        <div className="sm:hidden">
          <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            <span>Filtros</span>
            <span className="ml-auto bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
              {selectedPeriod}
            </span>
          </Button>
        </div>
      </div>

      {/* Controles de Filtro */}
      <div
        className={`
          ${showFilters ? "flex" : "hidden"} 
          sm:flex flex-col sm:flex-row items-stretch gap-3
          p-3 sm:p-0 border rounded-lg sm:border-0 bg-card sm:bg-transparent
        `}
      >
        {/* Select de Período */}
        <div className="flex-1 min-w-0">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            Período
          </label>
          <Select value={selectedPeriod} onValueChange={onPeriodChange}>
            <SelectTrigger className="w-full h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m" className="text-sm">
                1 Mes
              </SelectItem>
              <SelectItem value="3m" className="text-sm">
                3 Meses
              </SelectItem>
              <SelectItem value="6m" className="text-sm">
                6 Meses
              </SelectItem>
              <SelectItem value="1y" className="text-sm">
                1 Año
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Picker */}
        <div className="flex-1 min-w-0">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            Rango Personalizado
          </label>
          <DatePickerWithRange>
            <Button
              variant="outline"
              className="w-full h-9 justify-start text-left font-normal text-sm"
            >
              <Calendar className="mr-2 h-4 w-4" />
              <span>Seleccionar fechas</span>
            </Button>
          </DatePickerWithRange>
        </div>

        {/* Botón de cerrar en móvil */}
        {showFilters && (
          <div className="sm:hidden flex items-end pb-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(false)}
              className="text-muted-foreground"
            >
              Cerrar
            </Button>
          </div>
        )}
      </div>

    </motion.div>
  );
}

// Función helper para obtener la etiqueta del período
function getPeriodLabel(period: string): string {
  const labels: { [key: string]: string } = {
    "1m": "1 Mes",
    "3m": "3 Meses",
    "6m": "6 Meses",
    "1y": "1 Año",
  };
  return labels[period] || period;
}
