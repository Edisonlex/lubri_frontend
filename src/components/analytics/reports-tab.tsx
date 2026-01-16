"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Package, Users, Download } from "lucide-react";
import { api } from "@/lib/api";
import {
  exportToPDF,
  exportToExcel,
  exportSalesToPDF,
  exportSalesToExcel,
  exportCustomersToPDF,
  exportCustomersToExcel,
  prepareInventoryData,
  prepareSalesData,
  prepareCustomersData,
} from "@/lib/export-utils";

interface ReportsTabProps {
  customers: any[];
  dateRange?: { from: Date; to: Date };
}

export function ReportsTab({ customers, dateRange }: ReportsTabProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const companyInfo = {
    name: "LUBRICENTRO PROFESIONAL",
    address: "Av. Principal 123, Ciudad",
    phone: "+593 123 456 789",
    email: "info@lubricentro.com",
  };

  const handleInventoryReport = async (format: "pdf" | "excel") => {
    setLoading("inventory");
    try {
      const products = await api.getProducts();
      const { headers, data } = prepareInventoryData(products);

      if (format === "pdf") {
        exportToPDF({ headers, data, fileName: "inventario" });
      } else {
        exportToExcel({ headers, data, fileName: "inventario", companyInfo });
      }
    } catch (error) {
      console.error("Error generando reporte de inventario:", error);
    } finally {
      setLoading(null);
    }
  };

  const handleSalesReport = async (format: "pdf" | "excel") => {
    setLoading("sales");
    try {
      const allSales = await api.getSales();
      
      // Filtrar por rango de fechas si existe
      const sales = dateRange ? allSales.filter(sale => {
        const saleDate = new Date(sale.date);
        // Normalizar fechas para comparación sin hora
        const from = new Date(dateRange.from);
        from.setHours(0,0,0,0);
        const to = new Date(dateRange.to);
        to.setHours(23,59,59,999);
        return saleDate >= from && saleDate <= to;
      }) : allSales;

      const { headers, data } = prepareSalesData(sales);

      const fileName = dateRange 
        ? `ventas_${dateRange.from.toISOString().split('T')[0]}_${dateRange.to.toISOString().split('T')[0]}`
        : "ventas_total";

      if (format === "pdf") {
        exportSalesToPDF({ headers, data, fileName });
      } else {
        exportSalesToExcel({ headers, data, fileName, companyInfo });
      }
    } catch (error) {
      console.error("Error generando reporte de ventas:", error);
    } finally {
      setLoading(null);
    }
  };

  const handleCustomersReport = async (format: "pdf" | "excel") => {
    setLoading("customers");
    try {
      const { headers, data } = prepareCustomersData(customers);

      if (format === "pdf") {
        exportCustomersToPDF({ headers, data, fileName: "clientes" });
      } else {
        exportCustomersToExcel({
          headers,
          data,
          fileName: "clientes",
          companyInfo,
        });
      }
    } catch (error) {
      console.error("Error generando reporte de clientes:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Reporte de Ventas */}
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Reporte de Ventas
          </CardTitle>
          <CardDescription>
            Reporte detallado de ventas por período
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            className="w-full"
            onClick={() => handleSalesReport("pdf")}
            disabled={loading === "sales"}
          >
            <Download className="h-4 w-4 mr-2" />
            {loading === "sales" ? "Generando..." : "Descargar PDF"}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleSalesReport("excel")}
            disabled={loading === "sales"}
          >
            <Download className="h-4 w-4 mr-2" />
            {loading === "sales" ? "Generando..." : "Descargar Excel"}
          </Button>
        </CardContent>
      </Card>

      {/* Reporte de Inventario */}
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Reporte de Inventario
          </CardTitle>
          <CardDescription>
            Estado actual del inventario y movimientos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            className="w-full"
            onClick={() => handleInventoryReport("pdf")}
            disabled={loading === "inventory"}
          >
            <Download className="h-4 w-4 mr-2" />
            {loading === "inventory" ? "Generando..." : "Descargar PDF"}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleInventoryReport("excel")}
            disabled={loading === "inventory"}
          >
            <Download className="h-4 w-4 mr-2" />
            {loading === "inventory" ? "Generando..." : "Descargar Excel"}
          </Button>
        </CardContent>
      </Card>

      {/* Reporte de Clientes */}
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Reporte de Clientes ({customers.length})
          </CardTitle>
          <CardDescription>
            Análisis de cartera de {customers.length} clientes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            className="w-full"
            onClick={() => handleCustomersReport("pdf")}
            disabled={loading === "customers"}
          >
            <Download className="h-4 w-4 mr-2" />
            {loading === "customers" ? "Generando..." : "Descargar PDF"}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleCustomersReport("excel")}
            disabled={loading === "customers"}
          >
            <Download className="h-4 w-4 mr-2" />
            {loading === "customers" ? "Generando..." : "Descargar Excel"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
