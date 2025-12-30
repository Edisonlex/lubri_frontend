"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGIS, type GeographicEntity } from "@/contexts/gis-context";
// Replace direct map import with dynamic client-only import to avoid SSR errors
import dynamic from "next/dynamic";
const SidebarAwareMap = dynamic(
  () => import("./sidebar-aware-map").then((m) => m.SidebarAwareMap),
  { ssr: false }
);
import {
  BarChart3,
  TrendingUp,
  MapPin,
  Users,
  Package,
  DollarSign,
  Target,
  X,
  User,
} from "lucide-react";

interface AnalyticsMapProps {
  className?: string;
}

type AnalyticsView =
  | "sales-heatmap"
  | "customer-density"
  | "supplier-coverage"
  | "market-penetration";

interface SalesData {
  location: GeographicEntity;
  sales: number;
  visits: number;
  lastVisit: string;
  growth: number;
}

export function AnalyticsMap({ className = "" }: AnalyticsMapProps) {
  const { customers, suppliers, getDistance } = useGIS();
  const [analyticsView, setAnalyticsView] =
    useState<AnalyticsView>("customer-density");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedEntity, setSelectedEntity] = useState<GeographicEntity | null>(
    null
  );

  // Mock sales data for demonstration - usar valores estáticos para evitar funciones impuras
  const salesData: SalesData[] = useMemo(() => {
    return customers.map((customer, index) => ({
      location: customer,
      sales: 5000 + (index * 1234) % 10000, // Valores pseudoaleatorios basados en índice
      visits: 20 + (index * 7) % 50, // Valores pseudoaleatorios basados en índice
      lastVisit: new Date(
        new Date().getTime() - ((index * 7) % 30) * 24 * 60 * 60 * 1000
      ).toISOString(),
      growth: ((index % 40) - 20), // Valores entre -20% y +20%
    }));
  }, [customers]);

  // Calculate analytics metrics
  const analytics = useMemo(() => {
    const totalCustomers = customers.length;
    const totalSuppliers = suppliers.length;
    const totalSales = salesData.reduce((sum, data) => sum + data.sales, 0);
    const avgGrowth =
      salesData.reduce((sum, data) => sum + data.growth, 0) / salesData.length;

    // Group customers by city for market penetration analysis
    const customersByCity = customers.reduce((acc, customer) => {
      const city = customer.city;
      if (!acc[city]) acc[city] = 0;
      acc[city]++;
      return acc;
    }, {} as Record<string, number>);

    // Calculate supplier coverage (distance to nearest supplier)
    const supplierCoverage = customers.map((customer) => {
      const distances = suppliers.map((supplier) =>
        getDistance(customer.coordinates, supplier.coordinates)
      );
      const nearestSupplier = Math.min(...distances);
      return {
        customer: customer.name,
        nearestSupplierDistance: nearestSupplier,
        city: customer.city,
      };
    });

    return {
      totalCustomers,
      totalSuppliers,
      totalSales,
      avgGrowth,
      customersByCity,
      supplierCoverage,
    };
  }, [customers, suppliers, salesData, getDistance]);

  // Get entity data based on analytics view
  const getEntityData = () => {
    switch (analyticsView) {
      case "sales-heatmap":
        return salesData.map((data) => ({
          ...data.location,
          popupContent: `
            <div class="p-2">
              <h4 class="font-semibold">${data.location.name}</h4>
              <p class="text-sm text-gray-600">Ventas: $${data.sales.toLocaleString()}</p>
              <p class="text-sm text-gray-600">Visitas: ${data.visits}</p>
              <p class="text-sm ${
                data.growth >= 0 ? "text-green-600" : "text-red-600"
              }">
                Crecimiento: ${data.growth.toFixed(1)}%
              </p>
            </div>
          `,
        }));

      case "customer-density":
        return customers;

      case "supplier-coverage":
        return [...customers, ...suppliers];

      case "market-penetration":
        return customers;

      default:
        return customers;
    }
  };

  const getMapConfig = () => {
    switch (analyticsView) {
      case "sales-heatmap":
        return {
          entityFilter: ["customer"] as GeographicEntity["type"][],
          showLegend: false,
        };
      case "supplier-coverage":
        return {
          entityFilter: ["customer", "supplier"] as GeographicEntity["type"][],
          showLegend: false,
        };
      default:
        return {
          entityFilter: ["customer"] as GeographicEntity["type"][],
          showLegend: false,
        };
    }
  };

  const mapConfig = getMapConfig();

  const handleViewEntity = (entity: GeographicEntity) => {
    setSelectedEntity(entity);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Analytics Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Análisis Geográfico de Ventas
          </CardTitle>
          <CardDescription>
            Visualiza patrones geográficos de ventas, densidad de clientes y
            cobertura de proveedores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">
                    Total Clientes
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {analytics.totalCustomers}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">
                    Total Proveedores
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {analytics.totalSuppliers}
                  </p>
                </div>
                <Package className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600 font-medium">
                    Ventas Totales
                  </p>
                  <p className="text-2xl font-bold text-amber-900">
                    ${analytics.totalSales.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-amber-500" />
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">
                    Crecimiento Promedio
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      analytics.avgGrowth >= 0
                        ? "text-green-900"
                        : "text-red-900"
                    }`}
                  >
                    {analytics.avgGrowth.toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <Label>Tipo de Análisis</Label>
              <Select
                value={analyticsView}
                onValueChange={(value) =>
                  setAnalyticsView(value as AnalyticsView)
                }
              >
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer-density">
                    Densidad de Clientes
                  </SelectItem>
                  <SelectItem value="sales-heatmap">
                    Mapa de Calor de Ventas
                  </SelectItem>
                  <SelectItem value="supplier-coverage">
                    Cobertura de Proveedores
                  </SelectItem>
                  <SelectItem value="market-penetration">
                    Penetración de Mercado
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Región</Label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las Regiones</SelectItem>
                  <SelectItem value="la-mana">La Maná</SelectItem>
                  <SelectItem value="quito">Quito</SelectItem>
                  <SelectItem value="guayaquil">Guayaquil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Analysis Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Mapa de Análisis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <SidebarAwareMap
              height="400px"
              {...mapConfig}
              className="border-0"
              provider="leaflet"
              onViewEntity={handleViewEntity}
              title="Análisis Geográfico"
              showFilters={true}
            />
            <div className="p-3">
              <div className="bg-white border rounded-lg p-3">
                <div className="font-semibold mb-2">Leyenda</div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-blue-500" />
                    Clientes
                  </div>
                  {analyticsView === "supplier-coverage" && (
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-full bg-green-500" />
                      Proveedores
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5" />
              Resumen por Ciudad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.customersByCity).map(
                ([city, count]) => (
                  <div
                    key={city}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                  >
                    <span className="font-medium text-sm">{city}</span>
                    <Badge variant="secondary">{count} clientes</Badge>
                  </div>
                )
              )}
            </div>

            <div className="mt-4 pt-4 border-t">
              <h4 className="font-semibold text-sm mb-2">
                Cobertura de Proveedores
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Distancia promedio:</span>
                  <span className="font-medium">
                    {(
                      analytics.supplierCoverage.reduce(
                        (sum, cov) => sum + cov.nearestSupplierDistance,
                        0
                      ) / analytics.supplierCoverage.length
                    ).toFixed(1)}{" "}
                    km
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cobertura:</span>
                  <Badge variant="outline">Excelente</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Análisis Detallado por Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Cliente</th>
                  <th className="text-left p-2">Ciudad</th>
                  <th className="text-right p-2">Ventas</th>
                  <th className="text-right p-2">Visitas</th>
                  <th className="text-right p-2">Crecimiento</th>
                  <th className="text-right p-2">Dist. Proveedor</th>
                </tr>
              </thead>
              <tbody>
                {salesData.slice(0, 10).map((data, index) => {
                  const coverage = analytics.supplierCoverage.find(
                    (cov) => cov.customer === data.location.name
                  );
                  return (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{data.location.name}</td>
                      <td className="p-2">{data.location.city}</td>
                      <td className="p-2 text-right">
                        ${data.sales.toLocaleString()}
                      </td>
                      <td className="p-2 text-right">{data.visits}</td>
                      <td
                        className={`p-2 text-right font-medium ${
                          data.growth >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {data.growth.toFixed(1)}%
                      </td>
                      <td className="p-2 text-right">
                        {coverage
                          ? `${coverage.nearestSupplierDistance.toFixed(1)} km`
                          : "N/A"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedEntity}
        onOpenChange={(open) => !open && setSelectedEntity(null)}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEntity?.type === "customer" ? (
                <User className="w-5 h-5" />
              ) : (
                <Package className="w-5 h-5" />
              )}
              {selectedEntity?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Tipo</p>
                <p className="font-medium capitalize">{selectedEntity?.type}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Ciudad</p>
                <p className="font-medium">{selectedEntity?.city}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Dirección</p>
                <p className="font-medium">{selectedEntity?.address || "—"}</p>
              </div>
              {selectedEntity?.metadata && (
                <>
                  {selectedEntity.metadata.email && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Correo</p>
                      <p className="font-medium">
                        {selectedEntity.metadata.email}
                      </p>
                    </div>
                  )}
                  {selectedEntity.metadata.phone && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Teléfono</p>
                      <p className="font-medium">
                        {selectedEntity.metadata.phone}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedEntity(null)}
              >
                <X className="w-4 h-4 mr-2" />
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
