"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { usePOS } from "@/contexts/pos-context";
import { Sale } from "@/contexts/pos-context";
import { SaleDetails } from "@/components/sales/sale-details";
import { generateInvoicePDF } from "@/components/pos/invoice-generator";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useEffect, useState, useCallback } from "react";
import { ArrowRight, Receipt } from "lucide-react";
import { useRouter } from "next/navigation";

// Interfaz para ventas recientes
interface RecentSale {
  id: string;
  cliente: string;
  producto: string;
  cantidad: number;
  total: number;
  tiempo: string;
  metodo: string;
  fecha: string;
}

export function RecentSales() {
  const { sales, refreshSales, customers } = usePOS();
  const router = useRouter();
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [viewMode, setViewMode] = useState<"today" | "recent">("recent");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Función para convertir ventas al formato de RecentSale
  const convertSalesToRecentSales = useCallback(() => {
    const ordered = [...sales].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const filtered = (() => {
      if (viewMode === "today") {
        const today = new Date();
        return ordered.filter(
          (s) => new Date(s.date).toDateString() === today.toDateString()
        );
      }
      return ordered;
    })();

    const convertedSales: RecentSale[] = filtered.map((sale) => {
      const saleTime = new Date(sale.date);
      const now = new Date();
      const diffMs = now.getTime() - saleTime.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      let tiempo = "";
      if (diffMs < 60000) {
        tiempo = "un momento";
      } else if (diffMins < 60) {
        tiempo = `${diffMins} min`;
      } else if (diffHours < 24) {
        tiempo = `${diffHours} h`;
      } else if (diffDays < 7) {
        tiempo = diffDays === 1 ? "1 día" : `${diffDays} días`;
      } else {
        const diffWeeks = Math.floor(diffDays / 7);
        if (diffWeeks < 5) {
          tiempo = diffWeeks === 1 ? "1 semana" : `${diffWeeks} semanas`;
        } else {
          const diffMonths = Math.floor(diffDays / 30);
          if (diffMonths < 12) {
            tiempo = diffMonths === 1 ? "1 mes" : `${diffMonths} meses`;
          } else {
            const diffYears = Math.floor(diffDays / 365);
            tiempo = diffYears === 1 ? "1 año" : `${diffYears} años`;
          }
        }
      }

      // Obtener el primer producto para mostrar
      const firstProduct = sale.items[0] || {
        productName: "Varios productos",
        quantity: 1,
      };

      return {
        id: sale.id,
        cliente: sale.customerName || "Cliente no especificado",
        producto:
          sale.items.length > 1
            ? `${firstProduct.productName} y ${sale.items.length - 1} más`
            : firstProduct.productName,
        cantidad: firstProduct.quantity,
        total: sale.total,
        tiempo,
        metodo: sale.paymentMethod,
        fecha: sale.date,
      };
    });

    setRecentSales(convertedSales);
    setIsLoading(false);
  }, [sales, viewMode]);

  // Actualizar las ventas recientes cuando cambien las ventas
  useEffect(() => {
    convertSalesToRecentSales();
  }, [convertSalesToRecentSales]);

  // Actualizar las ventas al montar el componente
  useEffect(() => {
    const loadSales = async () => {
      setIsLoading(true);
      await refreshSales();
    };
    loadSales();
  }, [refreshSales]);

  const handleViewAllSales = () => {
    router.push("/ventas");
  };

  const handleOpenSaleDetails = (saleId: string) => {
    const found = sales.find((s) => s.id === saleId) || null;
    setSelectedSale(found);
    setIsDetailsOpen(!!found);
  };

  const handleDownloadInvoice = (sale: Sale) => {
    const customer = customers.find((c) => c.id === sale.customerId);
    const invoiceCustomer = customer || {
      id: sale.customerId || "",
      name: sale.customerName || "Cliente no especificado",
      email: "",
      phone: "",
      address: "",
      city: "",
      idNumber: "",
      customerType: "individual",
      vehicles: [],
      totalPurchases: 0,
      lastPurchase: "",
      registrationDate: "",
      status: "active",
      notes: "",
      preferredContact: "phone",
    };

    const invoiceData = {
      invoiceNumber: sale.invoiceNumber,
      date: format(parseISO(sale.date), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es }),
      customer: invoiceCustomer,
      items: sale.items.map((item) => ({
        id: item.productId,
        name: item.productName,
        price: item.unitPrice,
        quantity: item.quantity,
        category: "",
        stock: 0,
        brand: "",
      })),
      subtotal: sale.subtotal,
      tax: sale.tax,
      total: sale.total,
      paymentMethod:
        sale.paymentMethod.charAt(0).toUpperCase() + sale.paymentMethod.slice(1),
      cashReceived: undefined,
      change: undefined,
    };

    generateInvoicePDF(invoiceData, { action: "save" });
  };

  const handlePrintInvoice = (sale: Sale) => {
    const customer = customers.find((c) => c.id === sale.customerId);
    const invoiceCustomer = customer || {
      id: sale.customerId || "",
      name: sale.customerName || "Cliente no especificado",
      email: "",
      phone: "",
      address: "",
      city: "",
      idNumber: "",
      customerType: "individual",
      vehicles: [],
      totalPurchases: 0,
      lastPurchase: "",
      registrationDate: "",
      status: "active",
      notes: "",
      preferredContact: "phone",
    };

    const invoiceData = {
      invoiceNumber: sale.invoiceNumber,
      date: format(parseISO(sale.date), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es }),
      customer: invoiceCustomer,
      items: sale.items.map((item) => ({
        id: item.productId,
        name: item.productName,
        price: item.unitPrice,
        quantity: item.quantity,
        category: "",
        stock: 0,
        brand: "",
      })),
      subtotal: sale.subtotal,
      tax: sale.tax,
      total: sale.total,
      paymentMethod:
        sale.paymentMethod.charAt(0).toUpperCase() + sale.paymentMethod.slice(1),
      cashReceived: undefined,
      change: undefined,
    };

    generateInvoicePDF(invoiceData, { action: "print" });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Ventas Recientes</span>
          </CardTitle>
          <CardDescription>Cargando ventas...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-4 animate-pulse"
              >
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Ventas Recientes
              </CardTitle>
              <CardDescription>
                {viewMode === "today"
                  ? "Ventas de hoy"
                  : "Últimas transacciones recientes"}{" "}
                ({recentSales.length})
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "today" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setViewMode("today");
                  setPage(1);
                }}
              >
                Solo hoy
              </Button>
              <Button
                variant={viewMode === "recent" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setViewMode("recent");
                  setPage(1);
                }}
              >
                Recientes
              </Button>
              {recentSales.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleViewAllSales}
                  className="flex items-center gap-1 text-xs"
                >
                  Ver todas
                  <ArrowRight className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentSales.length > 0 ? (
              recentSales
                .slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize)
                .map((sale, index) => (
                  <motion.div
                    key={sale.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleOpenSaleDetails(sale.id)}
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {sale.cliente
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm line-clamp-1">
                          {sale.cliente}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {sale.producto} x{sale.cantidad}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">
                        ${sale.total.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className="text-xs px-2 py-0 capitalize"
                        >
                          {sale.metodo}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          hace {sale.tiempo}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
            ) : (
              <div className="text-center py-6">
                <Receipt className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground text-sm mb-4">
                  No hay ventas realizadas hoy
                </p>
                <Button
                  onClick={handleViewAllSales}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  Ver historial de ventas
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          {recentSales.length > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground dark:text-gray-300">
                  Mostrar
                </span>
                <select
                  className="border rounded px-2 py-1 text-sm bg-background dark:bg-gray-900 
                 border-input dark:border-gray-700 text-foreground dark:text-gray-300
                 focus:ring-2 focus:ring-primary dark:focus:ring-primary/50
                 focus:border-primary dark:focus:border-primary
                 cursor-pointer hover:border-gray-400 dark:hover:border-gray-600
                 transition-colors"
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                >
                  <option
                    value={5}
                    className="bg-background dark:bg-gray-900 dark:text-gray-300"
                  >
                    5
                  </option>
                  <option
                    value={10}
                    className="bg-background dark:bg-gray-900 dark:text-gray-300"
                  >
                    10
                  </option>
                </select>
                <span className="text-sm text-foreground dark:text-gray-300">
                  por página
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Anterior
                </Button>

                <span className="text-sm text-foreground dark:text-gray-300 min-w-[60px] text-center">
                  {page} /{" "}
                  {Math.max(1, Math.ceil(recentSales.length / pageSize))}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage(
                      Math.min(
                        Math.max(1, Math.ceil(recentSales.length / pageSize)),
                        page + 1
                      )
                    )
                  }
                  disabled={page >= Math.ceil(recentSales.length / pageSize)}
                  className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <SaleDetails
          sale={selectedSale}
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          onDownloadInvoice={handleDownloadInvoice}
          onPrintInvoice={handlePrintInvoice}
        />
      </Card>
    </motion.div>
  );
}
