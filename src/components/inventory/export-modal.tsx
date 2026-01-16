// components/inventory/export-modal.tsx
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
import {
  exportToPDF,
  exportToExcel,
  prepareInventoryData,
} from "@/lib/export-utils";
import { type Product } from "@/contexts/pos-context";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ExportModalProps {
  products: Product[];
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ExportModal({
  products,
  disabled,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  title = "Exportar Inventario",
  description,
  onExport,
}: ExportModalProps & {
  title?: string;
  description?: string;
  onExport?: (format: "pdf" | "excel") => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Usar estado interno o externo según lo que se pase
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setIsOpen = externalOnOpenChange || setInternalOpen;

  const handleExport = async (format: "pdf" | "excel") => {
    if (products.length === 0) {
      setError("No hay datos para exportar");
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      if (onExport) {
        // Use custom export handler if provided
        await onExport(format);
      } else {
        // Default behavior for inventory
        const { headers, data } = prepareInventoryData(products);
        const fileName = `inventario_${new Date().toISOString().split("T")[0]}`;

        if (format === "pdf") {
          exportToPDF({ headers, data, fileName });
        } else {
          exportToExcel({ headers, data, fileName });
        }
      }

      setIsOpen(false);
    } catch (error) {
      console.error("Error exporting:", error);
      setError(
        `Error al exportar: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    } finally {
      setIsExporting(false);
    }
  };

  const defaultDescription = `Exporta tu inventario en el formato que prefieras. Se exportarán ${products.length} productos.`;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || products.length === 0}
          className="bg-transparent h-8 sm:h-10 text-xs sm:text-sm px-2 sm:px-4"
        >
          <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          Exportar
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description || defaultDescription}
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
            disabled={isExporting || products.length === 0}
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
            disabled={isExporting || products.length === 0}
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
            {products.length === 0
              ? "No hay datos para exportar"
              : `Listos para exportar ${products.length} registros`}
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
