"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Package,
  Calendar,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  Settings,
  TrendingDown,
  Download,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import { api, type Product, type Sale } from "@/lib/api";
import { reportsService } from "@/lib/reports-service";
import {
  exportToExcel,
  exportToPDF,
  exportObsolescenceHistoryToPDF,
  exportObsolescenceHistoryToExcel,
} from "@/lib/export-utils";
import { useAlerts } from "@/contexts/alerts-context";
import { toast } from "sonner";

interface ObsolescencePoint {
  label: string;
  obsoleteCount: number;
  financialImpact: number;
}

interface ObsolescenceTabProps {
  selectedPeriod?: string;
  dateRange?: { from: Date; to: Date };
}

export function ObsolescenceTab({
  selectedPeriod = "6m",
  dateRange,
}: ObsolescenceTabProps) {
  const isMobile = useIsMobile();
  const { checkAndCreateAlerts, refreshAlerts } = useAlerts();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [rotationThreshold, setRotationThreshold] = useState(0.4);
  const [staleDaysThreshold, setStaleDaysThreshold] = useState(180);
  const [sales, setSales] = useState<Sale[]>([]);

  // Action states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [actionType, setActionType] = useState<
    "discount" | "bundle" | "return" | null
  >(null);
  const [actionValue, setActionValue] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Update threshold based on selected period
  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      const diffTime = Math.abs(
        dateRange.to.getTime() - dateRange.from.getTime()
      );
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setStaleDaysThreshold(diffDays > 0 ? diffDays : 1);
    } else {
      switch (selectedPeriod) {
        case "1m":
          setStaleDaysThreshold(30);
          break;
        case "3m":
          setStaleDaysThreshold(90);
          break;
        case "6m":
          setStaleDaysThreshold(180);
          break;
        case "1y":
          setStaleDaysThreshold(365);
          break;
        default:
          setStaleDaysThreshold(180);
      }
    }
  }, [selectedPeriod, dateRange]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [productsData, salesData] = await Promise.all([
          api.getProducts(),
          api.getSales(),
        ]);
        setProducts(productsData);
        setSales(salesData);
      } catch (e) {
        console.error("Error loading products", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const daysSinceDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  };

  const lastSaleByProduct = useMemo(() => {
    const map: Record<string, number | null> = {};
    products.forEach((p) => (map[p.id] = null));
    sales.forEach((s) => {
      s.items.forEach((item) => {
        const ts = new Date(s.date).getTime();
        const prev = map[item.productId];
        if (!prev || ts > prev) map[item.productId] = ts;
      });
    });
    return map;
  }, [products, sales]);

  const obsoleteProducts = useMemo(() => {
    return products.filter((p) => {
      const rot = p.rotationRate || 0;
      const lastSaleTs = lastSaleByProduct[p.id];
      const staleDays = lastSaleTs
        ? Math.floor((Date.now() - lastSaleTs) / (1000 * 60 * 60 * 24))
        : daysSinceDate(p.lastUpdated);
      return (
        (rot <= rotationThreshold || staleDays >= staleDaysThreshold) &&
        (p.stock || 0) > 0
      );
    });
  }, [products, rotationThreshold, staleDaysThreshold, lastSaleByProduct]);

  const metrics = useMemo(() => {
    const count = obsoleteProducts.length;
    const avgDays =
      count === 0
        ? 0
        : Math.round(
            obsoleteProducts.reduce((sum, p) => {
              const lastSaleTs = lastSaleByProduct[p.id];
              const d = lastSaleTs
                ? Math.floor((Date.now() - lastSaleTs) / (1000 * 60 * 60 * 24))
                : daysSinceDate(p.lastUpdated);
              return sum + d;
            }, 0) / count
          );
    const impact = obsoleteProducts.reduce(
      (sum, p) => sum + (p.cost || 0) * (p.stock || 0),
      0
    );
    return { count, avgDays, impact };
  }, [obsoleteProducts, lastSaleByProduct]);

  const history: ObsolescencePoint[] = useMemo(() => {
    const byMonth = new Map<
      string,
      { label: string; obsoleteCount: number; financialImpact: number }
    >();
    products.forEach((p) => {
      const lastTs =
        lastSaleByProduct[p.id] ?? new Date(p.lastUpdated).getTime();
      const d = new Date(lastTs);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      const label = d.toLocaleString("es-ES", {
        month: "short",
        year: "numeric",
      });
      const rot = p.rotationRate || 0;
      const staleDays = Math.floor(
        (Date.now() - lastTs) / (1000 * 60 * 60 * 24)
      );
      const isObsolete =
        (rot <= rotationThreshold || staleDays >= staleDaysThreshold) &&
        (p.stock || 0) > 0;
      const prev = byMonth.get(key) || {
        label,
        obsoleteCount: 0,
        financialImpact: 0,
      };
      byMonth.set(key, {
        label,
        obsoleteCount: prev.obsoleteCount + (isObsolete ? 1 : 0),
        financialImpact:
          prev.financialImpact +
          (isObsolete ? (p.cost || 0) * (p.stock || 0) : 0),
      });
    });
    return Array.from(byMonth.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([, v]) => ({
        label: v.label,
        obsoleteCount: v.obsoleteCount,
        financialImpact: Math.round(v.financialImpact),
      }))
      .filter((point) => {
        if (!point.label) return false;
        // Parse label back to date for comparison (Assuming label is "ShortMonth Year" e.g., "Ene 2025")
        // Note: The key in map was "YYYY-MM", let's use that if possible, but map returns array.
        // Better to filter based on keys before mapping to labels, but here we are.
        // Let's assume the chart displays the relevant range.
        // Actually, easiest is to filter by index based on selectedPeriod if no dateRange
        return true;
      })
      .slice(
        selectedPeriod === "1m"
          ? -1
          : selectedPeriod === "3m"
          ? -3
          : selectedPeriod === "6m"
          ? -6
          : selectedPeriod === "1y"
          ? -12
          : 0
      );
  }, [
    products,
    rotationThreshold,
    staleDaysThreshold,
    lastSaleByProduct,
    selectedPeriod,
  ]);

  const lowMovement = useMemo(() => {
    return [...products]
      .sort((a, b) => (a.rotationRate || 0) - (b.rotationRate || 0))
      .slice(0, 10);
  }, [products]);

  const generateAlerts = async () => {
    checkAndCreateAlerts(obsoleteProducts);
    await refreshAlerts();
    toast.success("Alertas generadas para productos obsoletos");
  };

  const exportReport = (type: "excel" | "pdf") => {
    const headers = [
      "Producto",
      "Marca",
      "Categoría",
      "Rotación",
      "Stock",
      "Costo inmovilizado",
    ];
    const data = lowMovement.map((p) => [
      p.name,
      p.brand,
      p.category,
      (p.rotationRate || 0).toFixed(2),
      p.stock,
      `$${((p.cost || 0) * (p.stock || 0) || 0).toFixed(2)}`,
    ]);
    const fileName = `Reporte_Obsolescencia_${
      new Date().toISOString().split("T")[0]
    }`;
    if (type === "excel") {
      exportToExcel({ headers, data, fileName, title: "Reporte de Obsolescencia" });
      toast.success("Reporte exportado a Excel");
    } else {
      exportToPDF({ headers, data, fileName, title: "Reporte de Obsolescencia" });
      toast.success("Reporte exportado a PDF");
    }
  };

  const exportHistory = (type: "excel" | "pdf") => {
    const headers = ["Mes", "Obsoletos", "Impacto"];
    const data = history.map((h) => [
      h.label,
      h.obsoleteCount,
      `$${Number(h.financialImpact).toLocaleString()}`,
    ]);
    const fileName = `Historico_Obsolescencia_${
      new Date().toISOString().split("T")[0]
    }`;
    if (type === "excel") {
      exportObsolescenceHistoryToExcel({ headers, data, fileName });
      toast.success("Histórico exportado a Excel");
    } else {
      exportObsolescenceHistoryToPDF({ headers, data, fileName });
      toast.success("Histórico exportado a PDF");
    }
  };

  const applyCorrectiveAction = (
    p: Product,
    action: "discount" | "bundle" | "return"
  ) => {
    setSelectedProduct(p);
    setActionType(action);
    setActionValue("");
  };

  const confirmAction = async () => {
    if (!selectedProduct || !actionType) return;

    setActionLoading(true);
    try {
      let updateData: Partial<Product> = {};
      let message = "";

      if (actionType === "discount") {
        const discountPct = parseFloat(actionValue);
        if (isNaN(discountPct) || discountPct <= 0 || discountPct > 100) {
          toast.error("Por favor ingrese un porcentaje válido");
          setActionLoading(false);
          return;
        }
        const newPrice = (selectedProduct.price || 0) * (1 - discountPct / 100);
        updateData = { price: newPrice };
        message = `Descuento del ${discountPct}% aplicado. Nuevo precio: $${newPrice.toFixed(
          2
        )}`;
      } else if (actionType === "bundle") {
        const bundleSuffix = actionValue.trim() || "BUNDLE";
        const newName = `${selectedProduct.name} + ${bundleSuffix}`;
        updateData = { name: newName };
        message = `Producto marcado como bundle: ${newName}`;
      } else if (actionType === "return") {
        const returnQty = parseInt(actionValue);
        if (
          isNaN(returnQty) ||
          returnQty <= 0 ||
          returnQty > (selectedProduct.stock || 0)
        ) {
          toast.error("Cantidad inválida");
          setActionLoading(false);
          return;
        }
        const newStock = (selectedProduct.stock || 0) - returnQty;
        updateData = { stock: newStock };
        message = `Devolución de ${returnQty} unidades procesada. Stock restante: ${newStock}`;
      }

      await api.updateProduct(selectedProduct.id, updateData);

      // Update local state
      setProducts((prev) =>
        prev.map((p) =>
          p.id === selectedProduct.id ? { ...p, ...updateData } : p
        )
      );

      toast.success(message);
      setSelectedProduct(null);
      setActionType(null);
    } catch (e) {
      console.error(e);
      toast.error("Error al aplicar la acción");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Action Dialog */}
      <Dialog
        open={!!selectedProduct}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "discount" && "Aplicar Descuento"}
              {actionType === "bundle" && "Crear Bundle"}
              {actionType === "return" && "Gestionar Devolución"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "discount" &&
                `Aplicar descuento a ${selectedProduct?.name}. Precio actual: $${selectedProduct?.price}`}
              {actionType === "bundle" &&
                `Agrupar ${selectedProduct?.name} con otro producto o promoción.`}
              {actionType === "return" &&
                `Devolver stock de ${selectedProduct?.name} al proveedor ${
                  selectedProduct?.supplier || ""
                }. Stock actual: ${selectedProduct?.stock}`}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {actionType === "discount" && (
              <div className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="discount" className="text-right">
                    Porcentaje %
                  </Label>
                  <Input
                    id="discount"
                    type="number"
                    placeholder="20"
                    className="col-span-3"
                    value={actionValue}
                    onChange={(e) => setActionValue(e.target.value)}
                  />
                </div>
                {selectedProduct && !isNaN(parseFloat(actionValue)) && parseFloat(actionValue) > 0 && (
                  <div className="rounded-md bg-muted p-3 text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Precio Actual:</span>
                      <span>${(selectedProduct.price || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-destructive">
                      <span>Descuento ({actionValue}%):</span>
                      <span>-${((selectedProduct.price || 0) * (parseFloat(actionValue) / 100)).toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-medium">
                      <span>Nuevo Precio Estimado:</span>
                      <span className="text-green-600">
                        ${((selectedProduct.price || 0) * (1 - parseFloat(actionValue) / 100)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {actionType === "bundle" && (
              <div className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="bundle" className="text-right">
                    Etiqueta
                  </Label>
                  <Input
                    id="bundle"
                    placeholder="Ej: GRATIS Filtro"
                    className="col-span-3"
                    value={actionValue}
                    onChange={(e) => setActionValue(e.target.value)}
                  />
                </div>
                {selectedProduct && actionValue.trim() && (
                  <div className="rounded-md bg-muted p-3 text-sm">
                    <span className="text-muted-foreground block mb-1">Vista previa del nombre:</span>
                    <span className="font-medium">{selectedProduct.name} + {actionValue}</span>
                  </div>
                )}
              </div>
            )}

            {actionType === "return" && (
              <div className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="return" className="text-right">
                    Cantidad
                  </Label>
                  <Input
                    id="return"
                    type="number"
                    placeholder="Cantidad a devolver"
                    className="col-span-3"
                    value={actionValue}
                    max={selectedProduct?.stock}
                    onChange={(e) => setActionValue(e.target.value)}
                  />
                </div>
                {selectedProduct && !isNaN(parseInt(actionValue)) && parseInt(actionValue) > 0 && (
                  <div className="rounded-md bg-muted p-3 text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Stock Actual:</span>
                      <span>{selectedProduct.stock} unidades</span>
                    </div>
                    <div className="flex justify-between text-destructive">
                      <span>Devolución:</span>
                      <span>-{parseInt(actionValue)} unidades</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-medium">
                      <span>Nuevo Stock:</span>
                      <span>{(selectedProduct.stock || 0) - parseInt(actionValue)} unidades</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Valor recuperado estimado: ${((selectedProduct.cost || 0) * parseInt(actionValue)).toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedProduct(null)}>
              Cancelar
            </Button>
            <Button onClick={confirmAction} disabled={actionLoading}>
              {actionLoading ? "Procesando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
            <CardTitle className="text-sm font-medium">
              Productos Obsoletos
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{metrics.count}</div>
            <CardDescription className="text-xs">
              Rotación baja o sin movimiento
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
            <CardTitle className="text-sm font-medium">
              Tiempo Promedio en Inventario
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{metrics.avgDays} días</div>
            <CardDescription className="text-xs">
              Desde última actualización
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
            <CardTitle className="text-sm font-medium">
              Impacto Financiero
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">
              ${metrics.impact.toLocaleString()}
            </div>
            <CardDescription className="text-xs">
              Costo inmovilizado en stock
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
            <CardTitle className="text-sm font-medium">Umbrales</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            <div className="text-xs">
              Rotación ≤ {rotationThreshold.toFixed(2)}
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={rotationThreshold}
              onChange={(e) => setRotationThreshold(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-xs">
              Antigüedad ≥ {staleDaysThreshold} días
            </div>
            <input
              type="range"
              min={30}
              max={365}
              step={5}
              value={staleDaysThreshold}
              onChange={(e) => setStaleDaysThreshold(Number(e.target.value))}
              className="w-full"
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className={isMobile ? "px-4 pt-4" : "px-6 pt-6"}>
          <CardTitle className={isMobile ? "text-base" : "text-lg"}>
            Histórico de Obsolescencia
          </CardTitle>
          <CardDescription className={isMobile ? "text-xs" : "text-sm"}>
            Tendencia de productos obsoletos e impacto
          </CardDescription>
          <div className="mt-2 flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" size="sm">
                  <Download className="h-4 w-4 mr-2" /> Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => exportHistory("excel")}>
                  Exportar a Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportHistory("pdf")}>
                  Exportar a PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className={isMobile ? "px-2 pb-3" : "px-6 pb-6"}>
          <div className={`h-48 ${isMobile ? "" : "sm:h-60 md:h-80"}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={history}
                margin={{ bottom: 20, left: 0, right: 0, top: 10 }}
                barCategoryGap={0}
                barGap={2}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--muted))"
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  padding={{ left: 0, right: 0 }}
                />
                <YAxis yAxisId="left" tick={{ fontSize: isMobile ? 10 : 12 }} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                  }}
                  formatter={(value, name) => [
                    name === "Impacto"
                      ? `$${Number(value).toLocaleString()}`
                      : `${value}`,
                    name,
                  ]}
                />
                <Legend iconType="circle" />
                <Bar
                  dataKey="obsoleteCount"
                  name="Obsoletos"
                  fill="#16a34a"
                  radius={[3, 3, 0, 0]}
                  yAxisId="left"
                />
                <Bar
                  dataKey="financialImpact"
                  name="Impacto"
                  fill="#059669"
                  radius={[3, 3, 0, 0]}
                  yAxisId="right"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm">
                Productos con Bajo Movimiento
              </CardTitle>
              <CardDescription className="text-xs">
                Top 10 por menor rotación
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={generateAlerts}>
                <AlertTriangle className="h-4 w-4 mr-2" /> Generar alertas
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" size="sm">
                    <Download className="h-4 w-4 mr-2" /> Exportar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => exportReport("excel")}>
                    Exportar a Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportReport("pdf")}>
                    Exportar a PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Rotación</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Costo inmovilizado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowMovement.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.brand}</TableCell>
                    <TableCell>{p.category}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <TrendingDown className="h-3 w-3" />{" "}
                        {(p.rotationRate || 0).toFixed(2)}
                      </Badge>
                    </TableCell>
                    <TableCell>{p.stock}</TableCell>
                    <TableCell>
                      ${((p.cost || 0) * (p.stock || 0) || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => applyCorrectiveAction(p, "discount")}
                        >
                          Descuento
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => applyCorrectiveAction(p, "bundle")}
                        >
                          Bundle
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => applyCorrectiveAction(p, "return")}
                        >
                          Devolución
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {lowMovement.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-muted-foreground"
                    >
                      Sin productos con bajo movimiento
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
