// src/app/ventas/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Filter,
  Download,
  Eye,
  FileText,
  Calendar,
  DollarSign,
  User,
  MoreHorizontal,
  ArrowUpDown,
  Plus,
  Receipt,
  Printer,
} from "lucide-react";
import { usePOS } from "@/contexts/pos-context";
import { Sale } from "@/contexts/pos-context";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { generateInvoicePDF } from "@/components/pos/invoice-generator";
import { SaleDetails } from "@/components/sales/sale-details";
import { Customer } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function VentasPage() {
  const { sales, refreshSales, loadingSales, customers } = usePOS();
  const router = useRouter();
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<keyof Sale>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    refreshSales();
  }, [refreshSales]);

  const LoadingContent = (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
      <Skeleton className="h-12 w-full" />
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );

  useEffect(() => {
    let filtered = sales;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (sale) =>
          sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.items.some((item) =>
            item.productName.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Filtro por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter((sale) => sale.status === statusFilter);
    }

    // Filtro por fecha
    if (dateFilter !== "all") {
      const today = new Date();

      switch (dateFilter) {
        case "today":
          filtered = filtered.filter((sale) => {
            const saleDate = new Date(sale.date);
            return saleDate.toDateString() === today.toDateString();
          });
          break;
        case "week":
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          filtered = filtered.filter((sale) => new Date(sale.date) >= weekAgo);
          break;
        case "month":
          const monthAgo = new Date(today);
          monthAgo.setMonth(today.getMonth() - 1);
          filtered = filtered.filter((sale) => new Date(sale.date) >= monthAgo);
          break;
      }
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Manejar fechas para ordenamiento
      if (sortField === "date") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredSales(filtered);
  }, [sales, searchTerm, statusFilter, dateFilter, sortField, sortDirection]);

  const handleSort = (field: keyof Sale) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getStatusVariant = (status: Sale["status"]) => {
    switch (status) {
      case "completada":
        return "default";
      case "pendiente":
        return "secondary";
      case "anulada":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getPaymentMethodIcon = (method: Sale["paymentMethod"]) => {
    switch (method) {
      case "efectivo":
        return <DollarSign className="h-4 w-4" />;
      case "tarjeta":
        return <FileText className="h-4 w-4" />;
      case "transferencia":
        return <Download className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDetailsOpen(true);
  };

  const handleDownloadInvoice = (sale: Sale) => {
    const customer = customers.find((c) => c.id === sale.customerId);
    const invoiceCustomer: Customer = customer || {
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
      date: format(
        parseISO(sale.date),
        "dd 'de' MMMM 'de' yyyy 'a las' HH:mm",
        { locale: es }
      ),
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
        sale.paymentMethod.charAt(0).toUpperCase() +
        sale.paymentMethod.slice(1),
      cashReceived: undefined,
      change: undefined,
    };

    generateInvoicePDF(invoiceData, { action: "save" });
  };

  const handlePrintInvoice = (sale: Sale) => {
    const customer = customers.find((c) => c.id === sale.customerId);
    const invoiceCustomer: Customer = customer || {
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
      date: format(
        parseISO(sale.date),
        "dd 'de' MMMM 'de' yyyy 'a las' HH:mm",
        { locale: es }
      ),
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
        sale.paymentMethod.charAt(0).toUpperCase() +
        sale.paymentMethod.slice(1),
      cashReceived: undefined,
      change: undefined,
    };

    generateInvoicePDF(invoiceData, { action: "print" });
  };


  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const completedSales = filteredSales.filter(
    (sale) => sale.status === "completada"
  ).length;
  const todaySales = filteredSales.filter((sale) => {
    const saleDate = new Date(sale.date);
    return saleDate.toDateString() === new Date().toDateString();
  }).length;

  return loadingSales ? (
    LoadingContent
  ) : (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Registro de Ventas
          </h1>
          <p className="text-muted-foreground">
            Gestiona y revisa todas las transacciones del sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push("/pos")}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Venta
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Ventas
                </p>
                <p className="text-2xl font-bold">{filteredSales.length}</p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Receipt className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Ingresos Totales
                </p>
                <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Completadas
                </p>
                <p className="text-2xl font-bold">{completedSales}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hoy</p>
                <p className="text-2xl font-bold">{todaySales}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros y Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por cliente, factura o producto..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Estado: {statusFilter === "all" ? "Todos" : statusFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                    Todos los estados
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setStatusFilter("completada")}
                  >
                    Completadas
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setStatusFilter("pendiente")}
                  >
                    Pendientes
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("anulada")}>
                    Anuladas
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Fecha:{" "}
                    {dateFilter === "all"
                      ? "Todas"
                      : dateFilter === "today"
                      ? "Hoy"
                      : dateFilter === "week"
                      ? "Última semana"
                      : "Último mes"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setDateFilter("all")}>
                    Todas las fechas
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDateFilter("today")}>
                    Hoy
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDateFilter("week")}>
                    Última semana
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDateFilter("month")}>
                    Último mes
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Ventas */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Ventas</CardTitle>
          <CardDescription>
            {filteredSales.length} ventas encontradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("date")}
                    className="flex items-center gap-1 p-0 h-auto font-semibold"
                  >
                    Fecha
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Factura</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("total")}
                    className="flex items-center gap-1 p-0 h-auto font-semibold"
                  >
                    Total
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    {format(parseISO(sale.date), "dd/MM/yyyy HH:mm", {
                      locale: es,
                    })}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {sale.invoiceNumber}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="max-w-[150px] truncate">
                        {sale.customerName || "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px]">
                      <p className="text-sm line-clamp-1">
                        {sale.items.map((item) => item.productName).join(", ")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {sale.items.length} producto(s)
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold">
                    ${sale.total.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getPaymentMethodIcon(sale.paymentMethod)}
                      <span className="capitalize text-sm">
                        {sale.paymentMethod}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusVariant(sale.status)}
                      className="capitalize"
                    >
                      {sale.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleViewDetails(sale)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDownloadInvoice(sale)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Descargar Factura
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredSales.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No se encontraron ventas</p>
              <p className="text-sm">
                {searchTerm || statusFilter !== "all" || dateFilter !== "all"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "No hay ventas registradas en el sistema"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalles */}
      <SaleDetails
        sale={selectedSale}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onDownloadInvoice={handleDownloadInvoice}
        onPrintInvoice={handlePrintInvoice}
      />
    </div>
  );
}
