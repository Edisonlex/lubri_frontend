"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { api, type Product, type Sale } from "@/lib/api";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Download,
  TrendingUp,
  DollarSign,
  Package,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import {
  exportToExcel,
  exportToPDF,
  exportClassificationToExcel,
  exportClassificationToPDF,
} from "@/lib/export-utils";

interface InventoryRotationTabProps {
  customers: any[];
  selectedPeriod?: string;
  dateRange?: { from: Date; to: Date };
}

interface ABCProduct extends Product {
  revenue: number;
  cumulativePercentage: number;
  class: "A" | "B" | "C";
}

export function InventoryRotationTab({
  customers,
  selectedPeriod = "6m",
  dateRange,
}: InventoryRotationTabProps) {
  const isMobile = useIsMobile();
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Action states
  const [selectedProduct, setSelectedProduct] = useState<ABCProduct | null>(
    null
  );
  const [actionValue, setActionValue] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [productsData, salesData] = await Promise.all([
          api.getProducts(),
          api.getSales(),
        ]);
        setProducts(productsData);
        setSales(salesData);
      } catch (error) {
        console.error("Error loading inventory data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredSales = useMemo(() => {
    const now = new Date();
    return sales.filter((sale) => {
      const saleDate = new Date(sale.date);

      if (dateRange?.from && dateRange?.to) {
        const from = new Date(dateRange.from);
        from.setHours(0, 0, 0, 0);
        const to = new Date(dateRange.to);
        to.setHours(23, 59, 59, 999);
        return saleDate >= from && saleDate <= to;
      }

      const limitDate = new Date();
      switch (selectedPeriod) {
        case "1m":
          limitDate.setMonth(now.getMonth() - 1);
          break;
        case "3m":
          limitDate.setMonth(now.getMonth() - 3);
          break;
        case "6m":
          limitDate.setMonth(now.getMonth() - 6);
          break;
        case "1y":
          limitDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          limitDate.setMonth(now.getMonth() - 6);
      }
      return saleDate >= limitDate;
    });
  }, [sales, selectedPeriod, dateRange]);

  const abcData = useMemo(() => {
    // 1. Calculate Revenue per Product
    const revenueMap = new Map<string, number>();
    filteredSales.forEach((sale) => {
      sale.items.forEach((item) => {
        const current = revenueMap.get(item.productId) || 0;
        // If item doesn't have subtotal, estimate with quantity * unitPrice (if available) or assume from total logic
        // Using item.subtotal if exists, else approximate.
        const amount = item.subtotal ?? item.quantity * (item.unitPrice || 0);
        revenueMap.set(item.productId, current + amount);
      });
    });

    // 2. Map to ABCProduct and Sort
    const mappedProducts: ABCProduct[] = products
      .map(
        (p): ABCProduct => ({
          ...p,
          revenue: revenueMap.get(p.id) || 0,
          cumulativePercentage: 0,
          class: "C", // default
        })
      )
      .sort((a, b) => b.revenue - a.revenue);

    // 3. Calculate Cumulative % and Assign Class
    const totalRevenue = mappedProducts.reduce((sum, p) => sum + p.revenue, 0);
    let runningRevenue = 0;

    mappedProducts.forEach((p) => {
      if (totalRevenue === 0) {
        p.class = "C";
        return;
      }
      runningRevenue += p.revenue;
      p.cumulativePercentage = (runningRevenue / totalRevenue) * 100;

      if (p.cumulativePercentage <= 80) p.class = "A";
      else if (p.cumulativePercentage <= 95) p.class = "B";
      else p.class = "C";
    });

    return mappedProducts;
  }, [products, filteredSales]);

  const stats = useMemo(() => {
    const s = {
      A: { count: 0, value: 0 },
      B: { count: 0, value: 0 },
      C: { count: 0, value: 0 },
    };
    abcData.forEach((p) => {
      s[p.class].count++;
      s[p.class].value += (p.stock || 0) * (p.cost || 0); // Inventory Value (Cost * Stock)
    });
    return s;
  }, [abcData]);

  const chartData = [
    {
      name: "Clase A",
      value: stats.A.value,
      count: stats.A.count,
      color: "#22c55e",
    },
    {
      name: "Clase B",
      value: stats.B.value,
      count: stats.B.count,
      color: "#eab308",
    },
    {
      name: "Clase C",
      value: stats.C.value,
      count: stats.C.count,
      color: "#ef4444",
    },
  ];

  const handleAction = async () => {
    if (!selectedProduct) return;

    setActionLoading(true);
    try {
      // Logic to update min/max stock based on user input
      // For now, let's assume we are updating Min Stock
      const minStock = parseInt(actionValue);
      if (isNaN(minStock) || minStock < 0) {
        toast.error("Ingrese un valor válido");
        return;
      }

      await api.updateProduct(selectedProduct.id, { minStock });

      // Update local state
      setProducts((prev) =>
        prev.map((p) => (p.id === selectedProduct.id ? { ...p, minStock } : p))
      );

      toast.success(`Stock mínimo actualizado para ${selectedProduct.name}`);
      setSelectedProduct(null);
      setActionValue("");
    } catch (e) {
      console.error(e);
      toast.error("Error al actualizar");
    } finally {
      setActionLoading(false);
    }
  };

  const exportABC = (type: "excel" | "pdf") => {
    const headers = [
      "Producto",
      "Clase",
      "Ingresos",
      "Stock",
      "Valor Inv.",
      "Acción Recomendada",
    ];
    const data = abcData.map((p) => [
      p.name,
      p.class,
      `$${p.revenue.toFixed(2)}`,
      p.stock,
      `$${((p.stock || 0) * (p.cost || 0)).toFixed(2)}`,
      p.class === "A"
        ? "Mantener Stock"
        : p.class === "B"
        ? "Monitorizar"
        : "Reducir/Promoción",
    ]);

    const fileName = `Clasificacion_ABC_${
      new Date().toISOString().split("T")[0]
    }`;
    if (type === "excel") {
      exportClassificationToExcel({ headers, data, fileName });
      toast.success("Exportado a Excel");
    } else {
      exportClassificationToPDF({ headers, data, fileName });
      toast.success("Exportado a PDF");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-sm text-muted-foreground">
          Cargando clasificación...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Action Dialog */}
      <Dialog
        open={!!selectedProduct}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Optimizar Stock: {selectedProduct?.name}</DialogTitle>
            <DialogDescription>
              Producto Clase {selectedProduct?.class}. Ajuste los niveles de
              inventario.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="minStock" className="text-right">
                Min. Stock
              </Label>
              <Input
                id="minStock"
                type="number"
                value={actionValue}
                onChange={(e) => setActionValue(e.target.value)}
                placeholder={String(selectedProduct?.minStock || 0)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedProduct(null)}>
              Cancelar
            </Button>
            <Button onClick={handleAction} disabled={actionLoading}>
              {actionLoading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-3">
        {chartData.map((item) => (
          <Card
            key={item.name}
            className="border-l-4"
            style={{ borderLeftColor: item.color }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
              <CardTitle className="text-sm font-medium">{item.name}</CardTitle>
              <Badge
                style={{ backgroundColor: item.color }}
                variant="outline"
                className="text-white border-none"
              >
                {((item.count / products.length) * 100).toFixed(1)}%
              </Badge>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{item.count} Productos</div>
              <CardDescription className="text-xs">
                Valor: ${item.value.toLocaleString()}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Valor de Inventario</CardTitle>
            <CardDescription>Valor monetario por clase ABC</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `$${Number(value).toLocaleString()}`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Productos Clase A</CardTitle>
            <CardDescription>Mayores generadores de ingresos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {abcData
                .filter((p) => p.class === "A")
                .slice(0, 5)
                .map((p) => (
                  <div key={p.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Ingresos: ${p.revenue.toLocaleString()}
                      </div>
                    </div>
                    <Badge className="bg-green-500">
                      {p.cumulativePercentage.toFixed(1)}%
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Detalle de Clasificación</CardTitle>
            <CardDescription>
              Listado completo de productos y su clasificación
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm">
                <Download className="h-4 w-4 mr-2" /> Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportABC("excel")}>
                Exportar a Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportABC("pdf")}>
                Exportar a PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Clase</TableHead>
                  <TableHead>Ingresos</TableHead>
                  <TableHead>% Acum.</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {abcData.slice(0, 50).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.category}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          p.class === "A"
                            ? "bg-green-500"
                            : p.class === "B"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }
                      >
                        {p.class}
                      </Badge>
                    </TableCell>
                    <TableCell>${p.revenue.toLocaleString()}</TableCell>
                    <TableCell>{p.cumulativePercentage.toFixed(1)}%</TableCell>
                    <TableCell>{p.stock}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedProduct(p);
                          setActionValue(String(p.minStock || 0));
                        }}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
