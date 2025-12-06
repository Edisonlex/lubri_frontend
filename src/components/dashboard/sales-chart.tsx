"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { usePOS } from "@/contexts/pos-context";
import { useMemo, useState } from "react";
import { Sale } from "@/contexts/pos-context";
import { SaleDetails } from "@/components/sales/sale-details";
import { generateInvoicePDF } from "@/components/pos/invoice-generator";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { exportSalesToPDF, exportSalesToExcel } from "@/lib/export-utils";

function getWeekdayShort(date: Date) {
  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  return days[date.getDay()];
}

export function SalesChart() {
  const { sales, customers } = usePOS();
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDayOpen, setIsDayOpen] = useState(false);
  const [daySales, setDaySales] = useState<Sale[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [daySearch, setDaySearch] = useState("");

  const dayView = useMemo(() => {
    const q = daySearch.trim().toLowerCase();
    const list = daySales.filter((s) => {
      if (!q) return true;
      const customer = (s.customerName || "").toLowerCase();
      const products = s.items.map((i) => i.productName.toLowerCase()).join(", ");
      return customer.includes(q) || products.includes(q);
    });
    const subtotal = list.reduce((sum, s) => sum + s.subtotal, 0);
    const tax = list.reduce((sum, s) => sum + s.tax, 0);
    const total = list.reduce((sum, s) => sum + s.total, 0);
    return { list, subtotal, tax, total, count: list.length };
  }, [daySales, daySearch]);

  const handleExportDay = (fmt: "pdf" | "excel") => {
    const headers = [
      "Factura",
      "Fecha",
      "Cliente",
      "Productos",
      "Total",
      "Método de Pago",
      "Estado",
      "Vendedor",
    ];
    const data = dayView.list.map((sale) => [
      sale.invoiceNumber,
      sale.date,
      sale.customerName || "Cliente Ocasional",
      sale.items.map((item) => item.productName).join(", "),
      sale.total.toFixed(2),
      sale.paymentMethod,
      sale.status,
      "Sistema",
    ]);
    const dateLabel = selectedDay
      ? format(selectedDay, "yyyy-MM-dd", { locale: es })
      : format(new Date(), "yyyy-MM-dd", { locale: es });
    const fileName = `ventas_${dateLabel}`;
    if (fmt === "pdf") {
      exportSalesToPDF({ headers, data, fileName });
    } else {
      exportSalesToExcel({
        headers,
        data,
        fileName,
        companyInfo: { name: "LUBRICENTRO PROFESIONAL" },
      });
    }
  };

  const salesData = useMemo(() => {
    const today = new Date();
    const dayMs = 24 * 60 * 60 * 1000;
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today.getTime() - (6 - i) * dayMs);
      const label = getWeekdayShort(d);
      const dayTotal = sales
        .filter((s) => {
          const sd = new Date(s.date);
          return sd.toDateString() === d.toDateString();
        })
        .reduce((sum, s) => sum + s.total, 0);
      return {
        name: label,
        ventas: Number(dayTotal.toFixed(2)),
        meta: 1500,
        fullDate: d.toISOString(),
      };
    });
    return days;
  }, [sales]);

  const recentSales = useMemo(() => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    return sales
      .filter((s) => new Date(s.date) >= weekAgo)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales]);

  const handleOpenSale = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDetailsOpen(true);
  };

  const buildInvoiceData = (sale: Sale) => {
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

    return {
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
        sale.paymentMethod.charAt(0).toUpperCase() + sale.paymentMethod.slice(1),
      cashReceived: undefined,
      change: undefined,
    };
  };

  const handleDownloadInvoice = (sale: Sale) => {
    const data = buildInvoiceData(sale);
    generateInvoicePDF(data, { action: "save" });
  };

  const handlePrintInvoice = (sale: Sale) => {
    const data = buildInvoiceData(sale);
    generateInvoicePDF(data, { action: "print" });
  };

  const handlePointClick = (index: number) => {
    const today = new Date();
    const dayMs = 24 * 60 * 60 * 1000;
    const d = new Date(today.getTime() - (6 - index) * dayMs);
    const matched = sales.filter((s) => new Date(s.date).toDateString() === d.toDateString());
    setSelectedDay(d);
    setDaySales(matched);
    setDaySearch("");
    setIsDayOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Tendencia de Ventas</CardTitle>
          <CardDescription>
            Ventas de los últimos 7 días vs meta diaria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--muted))"
                />
                <XAxis
                  dataKey="name"
                  tick={{
                    fill: "hsl(222.2 84% 4.9%)", // Texto oscuro para modo claro
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                  axisLine={{ stroke: "hsl(214.3 31.8% 91.4%)" }}
                  tickLine={{ stroke: "hsl(214.3 31.8% 91.4%)" }}
                  className="dark:[fill:hsl(0_0%_90%)] dark:[&_line]:stroke-gray-500"
                />
                <YAxis
                  tick={{
                    fill: "hsl(222.2 84% 4.9%)", // Texto oscuro para modo claro
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                  axisLine={{ stroke: "hsl(214.3 31.8% 91.4%)" }}
                  tickLine={{ stroke: "hsl(214.3 31.8% 91.4%)" }}
                  className="dark:[fill:hsl(0_0%_90%)] dark:[&_line]:stroke-gray-500"
                />
                <Tooltip
                  content={(() => {
                    const DaySalesTooltip = ({ active, payload }: any) => {
                      if (!active || !payload || !payload.length) return null;
                      const point = payload[0].payload;
                      const pointDate = new Date(point.fullDate);
                      const daySales = sales.filter(
                        (s) => new Date(s.date).toDateString() === pointDate.toDateString()
                      );
                      return (
                        <div className="p-3 space-y-2 bg-card text-card-foreground border rounded-lg">
                          <p className="font-semibold text-sm">
                            {format(pointDate, "EEEE dd/MM", { locale: es })}
                          </p>
                          {daySales.length === 0 ? (
                            <p className="text-xs text-muted-foreground">Sin ventas registradas</p>
                          ) : (
                            <div className="space-y-2">
                              <div className="max-h-48 overflow-y-auto space-y-2">
                              {daySales.slice(0, 6).map((s) => (
                                <div key={s.id} className="text-xs">
                                  <div className="flex justify-between">
                                    <span className="truncate max-w-[160px]">{s.customerName || "Cliente"}</span>
                                    <span className="font-bold">${s.total.toFixed(2)}</span>
                                  </div>
                                  <div className="mt-1 flex gap-1">
                                    <Button size="sm" className="h-7 px-2 text-xs" variant="outline" onClick={() => { setSelectedSale(s); setIsDetailsOpen(true); }}>
                                      Ver
                                    </Button>
                                    <Button size="sm" className="h-7 px-2 text-xs" onClick={() => handleDownloadInvoice(s)}>Descargar</Button>
                                    <Button size="sm" className="h-7 px-2 text-xs" variant="secondary" onClick={() => handlePrintInvoice(s)}>Imprimir</Button>
                                  </div>
                                </div>
                              ))}
                              </div>
                              {daySales.length > 6 && (
                                <Button size="sm" className="h-7 px-2 text-xs" variant="ghost" onClick={() => {
                                  setSelectedDay(pointDate);
                                  setDaySales(daySales);
                                  setIsDayOpen(true);
                                }}>Ver todas</Button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    };
                    return <DaySalesTooltip />;
                  })()}
                  cursor={{
                    stroke: "hsl(var(--muted-foreground))",
                    strokeWidth: 1,
                    strokeDasharray: "5 5",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="ventas"
                  stroke="#16a34a"
                  strokeWidth={3}
                  dot={(props: any) => (
                    <circle
                      key={`dot-${props.index}`}
                      cx={props.cx}
                      cy={props.cy}
                      r={4}
                      fill="#16a34a"
                      strokeWidth={2}
                      style={{ cursor: "pointer" }}
                      onClick={() => handlePointClick(props.index)}
                    />
                  )}
                  activeDot={{ r: 6, fill: "#059669" }}
                />
                <Line
                  type="monotone"
                  dataKey="meta"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {recentSales.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                Ventas de los últimos 7 días
              </p>
              <div className="spamonoto">
                {recentSales.slice(0, 5).map((sale) => (
                  <button
                    key={sale.id}
                    className="w-full text-left p-2 border rounded-lg hover:bg-muted/50"
                    onClick={() => handleOpenSale(sale)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm">
                        {sale.customerName || "Cliente"} · {sale.items[0]?.productName}
                      </span>
                      <span className="font-semibold">${sale.total.toFixed(2)}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(parseISO(sale.date), "dd/MM/yyyy HH:mm", { locale: es })}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={isDayOpen} onOpenChange={setIsDayOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Ventas del {selectedDay ? format(selectedDay, "dd/MM/yyyy", { locale: es }) : "día"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Buscar por cliente o producto"
              value={daySearch}
              onChange={(e) => setDaySearch(e.target.value)}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleExportDay("pdf")}>Exportar PDF</Button>
              <Button size="sm" variant="outline" onClick={() => handleExportDay("excel")}>Exportar Excel</Button>
            </div>
            {daySales.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay ventas registradas para este día.</p>
            ) : (
              <>
                {dayView.count === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay resultados para la búsqueda.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 border rounded-lg">
                      <p className="text-xs text-muted-foreground">Ventas</p>
                      <p className="font-semibold">{dayView.count}</p>
                    </div>
                    <div className="p-2 border rounded-lg">
                      <p className="text-xs text-muted-foreground">Subtotal</p>
                      <p className="font-semibold">${dayView.subtotal.toFixed(2)}</p>
                    </div>
                    <div className="p-2 border rounded-lg">
                      <p className="text-xs text-muted-foreground">IVA</p>
                      <p className="font-semibold">${dayView.tax.toFixed(2)}</p>
                    </div>
                    <div className="p-2 border rounded-lg">
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="font-semibold text-primary">${dayView.total.toFixed(2)}</p>
                    </div>
                  </div>
                )}
                {dayView.list.map((s) => (
                <div key={s.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{s.customerName || "Cliente"}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.items.map((i) => i.productName).join(", ")}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">${s.total.toFixed(2)}</span>
                      <div className="mt-1">
                        <Badge variant="outline" className="capitalize text-xs">{s.paymentMethod}</Badge>
                      </div>
                    </div>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setSelectedSale(s); setIsDetailsOpen(true); }}>
                      Ver detalle
                    </Button>
                    <Button size="sm" onClick={() => handleDownloadInvoice(s)}>Descargar</Button>
                    <Button variant="secondary" size="sm" onClick={() => handlePrintInvoice(s)}>Imprimir</Button>
                  </div>
                </div>
              ))}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <SaleDetails
        sale={selectedSale}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onDownloadInvoice={handleDownloadInvoice}
        onPrintInvoice={handlePrintInvoice}
      />
    </motion.div>
  );
}
