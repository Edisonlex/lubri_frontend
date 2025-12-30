"use client";

import { useState, useEffect } from "react";
import { CustomerDetailModal } from "./customer-detail-modal";
import { AddCustomerModal } from "./add-customer-modal";
import { CustomerFilters } from "./customer-filters";
import { CustomersTable } from "./customers-table";
import { Customer } from "@/lib/api";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerMap } from "@/components/gis/customer-map";
import { generateCoordinatesNearCity } from "@/lib/ecuador-mock-data";
import type { GeographicEntity } from "@/contexts/gis-context";
import { exportCustomersToPDF, exportCustomersToExcel, prepareCustomersData } from "@/lib/export-utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download, FileText, Table as TableIcon, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGIS } from "@/contexts/gis-context";
import { GISProvider } from "@/contexts/gis-context";
import { usePOS } from "@/contexts/pos-context";

export function CustomerManagement() {
  const { customers: gisCustomers } = useGIS();
  const { customers: posCustomers } = usePOS();
  const [customers, setCustomers] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    customerType: "all",
    status: "all",
    city: "all",
    search: "",
  });

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  // Sync POS customers with local state
  useEffect(() => {
    if (posCustomers && posCustomers.length > 0) {
      setCustomers(posCustomers);
    }
  }, [posCustomers]);

  // Convertir clientes POS a entidades geográficas centradas en La Maná
  const geoCustomersFromPOS: GeographicEntity[] = (customers || []).map((c) => {
    const coords = generateCoordinatesNearCity("La Maná", 5);
    return {
      id: c.id,
      name: c.name,
      type: "customer",
      coordinates: coords,
      address: c.address,
      city: "La Maná",
      status: c.status,
      metadata: {
        email: c.email,
        phone: c.phone,
        customerType: c.customerType,
        totalPurchases: c.totalPurchases,
      },
    } as GeographicEntity;
  });

  const handleExportCustomersPDF = () => {
    const { headers, data } = prepareCustomersData(customers as any[]);
    exportCustomersToPDF({ headers, data, fileName: "Clientes" });
  };

  const handleExportCustomersExcel = () => {
    const { headers, data } = prepareCustomersData(customers as any[]);
    exportCustomersToExcel({ headers, data, fileName: "Clientes" });
  };
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const handleExport = async (format: "pdf" | "excel") => {
    if (!customers || customers.length === 0) {
      setExportError("No hay clientes para exportar");
      return;
    }
    setExporting(true);
    setExportError(null);
    try {
      const { headers, data } = prepareCustomersData(customers as any[]);
      const fileName = `clientes_${new Date().toISOString().split("T")[0]}`;
      if (format === "pdf") {
        exportCustomersToPDF({ headers, data, fileName });
      } else {
        exportCustomersToExcel({ headers, data, fileName });
      }
      setExportOpen(false);
    } catch (e) {
      setExportError("Error al exportar");
    } finally {
      setExporting(false);
    }
  };

  // Handlers para los modales
  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header y botón */}
      <div className="flex justify-between items-center">
        <h1>Gestión de Clientes</h1>
        <div className="flex gap-2">
          <Dialog open={exportOpen} onOpenChange={setExportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Exportar Clientes</DialogTitle>
                <DialogDescription>
                  Exporta tu lista de clientes. Se exportarán {customers.length} clientes.
                </DialogDescription>
              </DialogHeader>
              {exportError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{exportError}</AlertDescription>
                </Alert>
              )}
              <div className="grid grid-cols-2 gap-4 py-4">
                <Button onClick={() => handleExport("excel")} disabled={exporting || customers.length === 0} className="flex flex-col items-center justify-center h-24 gap-2" variant="outline">
                  <TableIcon className="h-8 w-8 text-green-600" />
                  <span>Excel (.xlsx)</span>
                  <span className="text-xs text-muted-foreground">Recomendado para análisis</span>
                </Button>
                <Button onClick={() => handleExport("pdf")} disabled={exporting || customers.length === 0} className="flex flex-col items-center justify-center h-24 gap-2" variant="outline">
                  <FileText className="h-8 w-8 text-red-600" />
                  <span>PDF (.pdf)</span>
                  <span className="text-xs text-muted-foreground">Para impresión</span>
                </Button>
              </div>
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <div className="text-xs text-muted-foreground flex-1">
                  {customers.length === 0 ? "No hay clientes para exportar" : `Listos para exportar ${customers.length} clientes`}
                </div>
                <Button variant="outline" onClick={() => setExportOpen(false)} disabled={exporting}>Cancelar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={() => { setSelectedCustomer(null); setIsAddModalOpen(true); }}>Nuevo Cliente</Button>
        </div>
      </div>

      {/* Tabs para vista tabla y mapa */}
      <Tabs defaultValue="table" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 gap-2 p-1 bg-muted/50 rounded-lg">
          <TabsTrigger value="table" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Vista Tabla
          </TabsTrigger>
          <TabsTrigger value="map" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Vista Mapa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="space-y-6">
          {/* Filtros */}
          <CustomerFilters filters={filters} setFilters={setFilters} />

          {/* Tabla */}
          <CustomersTable
            customers={customers}
            filters={filters}
            onViewCustomer={handleViewCustomer}
            onEditCustomer={handleEditCustomer}
            onMaintenanceReminder={(customer) => {
              setSelectedCustomer(customer);
              setIsReminderOpen(true);
            }}
          />
        </TabsContent>

        <TabsContent value="map" className="space-y-6">
          {/* Mapa de clientes con GIS */}
          <CustomerMap customers={geoCustomersFromPOS} />
        </TabsContent>
      </Tabs>

      {/* Modales */}
      <CustomerDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        customer={selectedCustomer}
        onEdit={handleEditCustomer}
      />

      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        customer={selectedCustomer}
      />

    </div>
  );
}
