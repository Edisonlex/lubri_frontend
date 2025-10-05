// components/inventory/movements-export-modal.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download, FileText, Table, AlertCircle } from "lucide-react";
import { StockMovement } from "@/lib/api";
import { exportMovements } from "@/lib/movements-export-utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MovementsExportModalProps {
  movements: StockMovement[];
  dateRange?: { from: Date; to: Date };
  movementType?: string;
  disabled?: boolean;
}

export function MovementsExportModal({
  movements,
  dateRange,
  movementType,
  disabled,
}: MovementsExportModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async (format: "pdf" | "excel") => {
    if (movements.length === 0) {
      setError("No hay movimientos para exportar");
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      const exporter = exportMovements(movements, {
        dateRange,
        movementType,
        companyInfo: {
          name: "TU LUBRICENTRO",
          address: "Tu dirección",
          phone: "Tu teléfono",
        },
      });

      if (format === "pdf") {
        exporter.exportToPDF();
      } else {
        exporter.exportToExcel();
      }

      setIsOpen(false);
    } catch (error) {
      console.error("Error exporting movements:", error);
      setError(
        `Error al exportar: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        setError(null);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || movements.length === 0}
          className="bg-transparent h-8 sm:h-10 text-xs sm:text-sm px-2 sm:px-4"
        >
          <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          Exportar
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar Movimientos</DialogTitle>
          <DialogDescription>
            Exporta el historial de movimientos en el formato que prefieras. Se
            exportarán {movements.length} movimientos.
            {dateRange && (
              <span className="block text-xs mt-1">
                Período: {dateRange.from.toLocaleDateString()} -{" "}
                {dateRange.to.toLocaleDateString()}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4 py-4">
          <Button
            onClick={() => handleExport("excel")}
            disabled={isExporting || movements.length === 0}
            className="flex flex-col items-center justify-center h-24 gap-2"
            variant="outline"
          >
            <Table className="h-8 w-8 text-green-600" />
            <span>Excel (.xlsx)</span>
            <span className="text-xs text-muted-foreground">
              Recomendado para análisis
            </span>
          </Button>

          <Button
            onClick={() => handleExport("pdf")}
            disabled={isExporting || movements.length === 0}
            className="flex flex-col items-center justify-center h-24 gap-2"
            variant="outline"
          >
            <FileText className="h-8 w-8 text-red-600" />
            <span>PDF (.pdf)</span>
            <span className="text-xs text-muted-foreground">
              Para impresión
            </span>
          </Button>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <div className="text-xs text-muted-foreground flex-1">
            {movements.length === 0
              ? "No hay movimientos para exportar"
              : `Listos para exportar ${movements.length} movimientos`}
          </div>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isExporting}
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
