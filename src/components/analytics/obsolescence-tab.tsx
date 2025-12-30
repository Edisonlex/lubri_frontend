"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Calendar, DollarSign, AlertTriangle, RefreshCw, Settings, TrendingDown, Download } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import { api, type Product, type Sale } from "@/lib/api";
import { exportToExcel, exportToPDF, exportObsolescenceHistoryToPDF, exportObsolescenceHistoryToExcel } from "@/lib/export-utils";
import { useAlerts } from "@/contexts/alerts-context";
import { toast } from "sonner";

interface ObsolescencePoint {
  label: string;
  obsoleteCount: number;
  financialImpact: number;
}

export function ObsolescenceTab() {
  const isMobile = useIsMobile();
  const { checkAndCreateAlerts, refreshAlerts } = useAlerts();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [rotationThreshold, setRotationThreshold] = useState(0.4);
  const [staleDaysThreshold, setStaleDaysThreshold] = useState(180);
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [data, salesData] = await Promise.all([
          api.getProducts(),
          api.getSales(),
        ]);
        setProducts(data);
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
      return (rot <= rotationThreshold || staleDays >= staleDaysThreshold) && (p.stock || 0) > 0;
    });
  }, [products, rotationThreshold, staleDaysThreshold, lastSaleByProduct]);

  const metrics = useMemo(() => {
    const count = obsoleteProducts.length;
    const avgDays = count === 0 ? 0 : Math.round(
      obsoleteProducts.reduce((sum, p) => {
        const lastSaleTs = lastSaleByProduct[p.id];
        const d = lastSaleTs
          ? Math.floor((Date.now() - lastSaleTs) / (1000 * 60 * 60 * 24))
          : daysSinceDate(p.lastUpdated);
        return sum + d;
      }, 0) / count
    );
    const impact = obsoleteProducts.reduce((sum, p) => sum + (p.cost || 0) * (p.stock || 0), 0);
    return { count, avgDays, impact };
  }, [obsoleteProducts, lastSaleByProduct]);

  const history: ObsolescencePoint[] = useMemo(() => {
    const byMonth = new Map<string, { label: string; obsoleteCount: number; financialImpact: number }>();
    products.forEach((p) => {
      const lastTs = lastSaleByProduct[p.id] ?? new Date(p.lastUpdated).getTime();
      const d = new Date(lastTs);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString("es-ES", { month: "short", year: "numeric" });
      const rot = p.rotationRate || 0;
      const staleDays = Math.floor((Date.now() - lastTs) / (1000 * 60 * 60 * 24));
      const isObsolete = (rot <= rotationThreshold || staleDays >= staleDaysThreshold) && (p.stock || 0) > 0;
      const prev = byMonth.get(key) || { label, obsoleteCount: 0, financialImpact: 0 };
      byMonth.set(key, {
        label,
        obsoleteCount: prev.obsoleteCount + (isObsolete ? 1 : 0),
        financialImpact: prev.financialImpact + (isObsolete ? (p.cost || 0) * (p.stock || 0) : 0),
      });
    });
    return Array.from(byMonth.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([, v]) => ({ label: v.label, obsoleteCount: v.obsoleteCount, financialImpact: Math.round(v.financialImpact) }));
  }, [products, rotationThreshold, staleDaysThreshold, lastSaleByProduct]);

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
      `$${(((p.cost || 0) * (p.stock || 0)) || 0).toFixed(2)}`,
    ]);
    const fileName = `Reporte_Obsolescencia_${new Date().toISOString().split("T")[0]}`;
    if (type === "excel") {
      exportToExcel({ headers, data, fileName });
      toast.success("Reporte exportado a Excel");
    } else {
      exportToPDF({ headers, data, fileName });
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
    const fileName = `Historico_Obsolescencia_${new Date().toISOString().split("T")[0]}`;
    if (type === "excel") {
      exportObsolescenceHistoryToExcel({ headers, data, fileName });
      toast.success("Histórico exportado a Excel");
    } else {
      exportObsolescenceHistoryToPDF({ headers, data, fileName });
      toast.success("Histórico exportado a PDF");
    }
  };

  const applyCorrectiveAction = (p: Product, action: string) => {
    toast.info(`${action} aplicado a ${p.name}`);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
            <CardTitle className="text-sm font-medium">Productos Obsoletos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{metrics.count}</div>
            <CardDescription className="text-xs">Rotación baja o sin movimiento</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
            <CardTitle className="text-sm font-medium">Tiempo Promedio en Inventario</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{metrics.avgDays} días</div>
            <CardDescription className="text-xs">Desde última actualización</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
            <CardTitle className="text-sm font-medium">Impacto Financiero</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">${metrics.impact.toLocaleString()}</div>
            <CardDescription className="text-xs">Costo inmovilizado en stock</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
            <CardTitle className="text-sm font-medium">Umbrales</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            <div className="text-xs">Rotación ≤ {rotationThreshold.toFixed(2)}</div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={rotationThreshold}
              onChange={(e) => setRotationThreshold(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-xs">Antigüedad ≥ {staleDaysThreshold} días</div>
            <input
              type="range"
              min={30}
              max={360}
              step={15}
              value={staleDaysThreshold}
              onChange={(e) => setStaleDaysThreshold(Number(e.target.value))}
              className="w-full"
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className={isMobile ? "px-4 pt-4" : "px-6 pt-6"}>
          <CardTitle className={isMobile ? "text-base" : "text-lg"}>Histórico de Obsolescencia</CardTitle>
          <CardDescription className={isMobile ? "text-xs" : "text-sm"}>Tendencia de productos obsoletos e impacto</CardDescription>
          <div className="mt-2 flex items-center gap-2">
            <Button variant="default" size="sm" onClick={() => exportHistory("excel")}>
              <Download className="h-4 w-4 mr-2" /> Exportar resumen
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportHistory("pdf")}>
              <Download className="h-4 w-4 mr-2" /> Exportar PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className={isMobile ? "px-2 pb-3" : "px-6 pb-6"}>
          <div className={`h-48 ${isMobile ? "" : "sm:h-60 md:h-80"}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={history} margin={{ bottom: 20, left: 0, right: 0, top: 10 }} barCategoryGap={0} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis dataKey="label" tick={{ fontSize: isMobile ? 10 : 12 }} padding={{ left: 0, right: 0 }} />
                <YAxis yAxisId="left" tick={{ fontSize: isMobile ? 10 : 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: isMobile ? 10 : 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                  }}
                  formatter={(value, name) => [
                    name === "Impacto" ? `$${Number(value).toLocaleString()}` : `${value}`,
                    name,
                  ]}
                />
                <Legend iconType="circle" />
                <Bar dataKey="obsoleteCount" name="Obsoletos" fill="#16a34a" radius={[3,3,0,0]} yAxisId="left" />
                <Bar dataKey="financialImpact" name="Impacto" fill="#059669" radius={[3,3,0,0]} yAxisId="right" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm">Productos con Bajo Movimiento</CardTitle>
              <CardDescription className="text-xs">Top 10 por menor rotación</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={generateAlerts}>
                <AlertTriangle className="h-4 w-4 mr-2" /> Generar alertas
              </Button>
              <Button variant="default" size="sm" onClick={() => exportReport("excel")}>
                <RefreshCw className="h-4 w-4 mr-2" /> Exportar reporte
              </Button>
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
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <TrendingDown className="h-3 w-3" /> {(p.rotationRate || 0).toFixed(2)}
                      </Badge>
                    </TableCell>
                    <TableCell>{p.stock}</TableCell>
                    <TableCell>${(((p.cost || 0) * (p.stock || 0)) || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => applyCorrectiveAction(p, "Descuento")}>Descuento</Button>
                        <Button variant="outline" size="sm" onClick={() => applyCorrectiveAction(p, "Bundle")}>Bundle</Button>
                        <Button variant="outline" size="sm" onClick={() => applyCorrectiveAction(p, "Devolución")}>Devolución</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {lowMovement.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">Sin productos con bajo movimiento</TableCell>
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