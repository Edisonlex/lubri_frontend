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
import { Input } from "@/components/ui/input";
import { useGIS, type GeographicEntity } from "@/contexts/gis-context";
// Replace direct import with dynamic client-only import to avoid SSR window errors
import dynamic from "next/dynamic";
const LubriSmartMap = dynamic(
  () => import("./map").then((m) => m.LubriSmartMap),
  { ssr: false }
);
import {
  Truck,
  Package,
  Clock,
  AlertTriangle,
  CheckCircle,
  Navigation,
  Filter,
  MapPin,
} from "lucide-react";

interface SupplierMapProps {
  className?: string;
  onViewEntity?: (entity: GeographicEntity) => void;
}

interface DeliveryRoute {
  supplier: GeographicEntity;
  customer: GeographicEntity;
  distance: number;
  estimatedTime: number;
  priority: "high" | "medium" | "low";
  status: "pending" | "in-transit" | "delivered";
}

export function SupplierMap({
  className = "",
  onViewEntity,
}: SupplierMapProps) {
  const { suppliers, customers, getDistance, getEntitiesInRadius } = useGIS();
  const [selectedSupplier, setSelectedSupplier] = useState<string>("all");
  const [routeFilter, setRouteFilter] = useState<
    "all" | "pending" | "in-transit" | "delivered"
  >("all");
  const [priorityFilter, setPriorityFilter] = useState<
    "all" | "high" | "medium" | "low"
  >("all");
  const [maxDistance, setMaxDistance] = useState<number>(100);
  const [showRoutes, setShowRoutes] = useState<boolean>(true);

  // Generate mock delivery routes
  const deliveryRoutes: DeliveryRoute[] = useMemo(() => {
    const routes: DeliveryRoute[] = [];

    customers.forEach((customer) => {
      suppliers.forEach((supplier) => {
        const distance = getDistance(
          customer.coordinates,
          supplier.coordinates
        );
        if (distance <= maxDistance) {
          routes.push({
            supplier,
            customer,
            distance,
            estimatedTime: distance * 2, // 2 minutes per km + stops
            priority: distance < 20 ? "high" : distance < 50 ? "medium" : "low",
            status:
              Math.random() > 0.7
                ? "delivered"
                : Math.random() > 0.4
                ? "in-transit"
                : "pending",
          });
        }
      });
    });

    return routes.sort((a, b) => a.distance - b.distance);
  }, [suppliers, customers, getDistance, maxDistance]);

  // Filter routes based on criteria
  const filteredRoutes = useMemo(() => {
    return deliveryRoutes.filter((route) => {
      const supplierMatch =
        selectedSupplier === "all" || route.supplier.id === selectedSupplier;
      const routeMatch = routeFilter === "all" || route.status === routeFilter;
      const priorityMatch =
        priorityFilter === "all" || route.priority === priorityFilter;

      return supplierMatch && routeMatch && priorityMatch;
    });
  }, [deliveryRoutes, selectedSupplier, routeFilter, priorityFilter]);

  // Calculate logistics metrics
  const logisticsMetrics = useMemo(() => {
    const totalRoutes = filteredRoutes.length;
    const pendingRoutes = filteredRoutes.filter(
      (r) => r.status === "pending"
    ).length;
    const inTransitRoutes = filteredRoutes.filter(
      (r) => r.status === "in-transit"
    ).length;
    const deliveredRoutes = filteredRoutes.filter(
      (r) => r.status === "delivered"
    ).length;

    const avgDistance =
      totalRoutes > 0
        ? filteredRoutes.reduce((sum, route) => sum + route.distance, 0) /
          totalRoutes
        : 0;

    const avgDeliveryTime =
      totalRoutes > 0
        ? filteredRoutes.reduce((sum, route) => sum + route.estimatedTime, 0) /
          totalRoutes
        : 0;

    const efficiency =
      totalRoutes > 0 ? (deliveredRoutes / totalRoutes) * 100 : 0;

    return {
      totalRoutes,
      pendingRoutes,
      inTransitRoutes,
      deliveredRoutes,
      avgDistance,
      avgDeliveryTime,
      efficiency,
    };
  }, [filteredRoutes]);

  // Get entities to display on map
  const getMapEntities = () => {
    const entities: GeographicEntity[] = [];

    // Always show suppliers
    entities.push(...suppliers);

    // Show customers that have routes
    const customerIds = new Set(
      filteredRoutes.map((route) => route.customer.id)
    );
    entities.push(
      ...customers.filter((customer) => customerIds.has(customer.id))
    );

    return entities;
  };

  const mapEntities = getMapEntities();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in-transit":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Logistics Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Panel de Logística y Rutas
          </CardTitle>
          <CardDescription>
            Gestión de rutas de entrega, análisis de distancias y optimización
            logística
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">
                    Rutas Totales
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {logisticsMetrics.totalRoutes}
                  </p>
                </div>
                <Navigation className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 font-medium">
                    Pendientes
                  </p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {logisticsMetrics.pendingRoutes}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">
                    Entregados
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {logisticsMetrics.deliveredRoutes}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">
                    Eficiencia
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    {logisticsMetrics.efficiency.toFixed(1)}%
                  </p>
                </div>
                <Package className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label>Proveedor</Label>
              <Select
                value={selectedSupplier}
                onValueChange={setSelectedSupplier}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Proveedores</SelectItem>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Distancia Máxima (km)</Label>
              <Input
                type="number"
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                min="10"
                max="500"
                step="10"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-4">
            <div className="space-y-2">
              <Label>Estado de Ruta</Label>
              <Select
                value={routeFilter}
                onValueChange={(value) => setRouteFilter(value as any)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="in-transit">En Tránsito</SelectItem>
                  <SelectItem value="delivered">Entregadas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Prioridad</Label>
              <Select
                value={priorityFilter}
                onValueChange={(value) => setPriorityFilter(value as any)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRoutes(!showRoutes)}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                {showRoutes ? "Ocultar" : "Mostrar"} Rutas
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded">
              <div className="flex justify-between">
                <span>Distancia Promedio:</span>
                <span className="font-medium">
                  {logisticsMetrics.avgDistance.toFixed(1)} km
                </span>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="flex justify-between">
                <span>Tiempo Estimado:</span>
                <span className="font-medium">
                  {logisticsMetrics.avgDeliveryTime.toFixed(0)} min
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map and Route Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Mapa de Rutas y Proveedores
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <LubriSmartMap
              height="500px"
              entityFilter={["customer", "supplier"]}
              showLegend={true}
              className="border-0"
              onViewEntity={onViewEntity}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Rutas Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredRoutes.slice(0, 8).map((route, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {route.customer.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {route.supplier.name}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge
                        className={`text-xs ${getStatusColor(route.status)}`}
                      >
                        {route.status === "pending"
                          ? "Pendiente"
                          : route.status === "in-transit"
                          ? "En Tránsito"
                          : "Entregado"}
                      </Badge>
                      <Badge
                        className={`text-xs ${getPriorityColor(
                          route.priority
                        )}`}
                      >
                        {route.priority === "high"
                          ? "Alta"
                          : route.priority === "medium"
                          ? "Media"
                          : "Baja"}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{route.distance.toFixed(1)} km</span>
                    <span>{route.estimatedTime.toFixed(0)} min</span>
                  </div>

                  <div className="mt-2 flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs h-6 px-2"
                      onClick={() => {
                        // Open navigation
                        const url = `https://www.google.com/maps/dir/${route.supplier.coordinates.lat},${route.supplier.coordinates.lng}/${route.customer.coordinates.lat},${route.customer.coordinates.lng}`;
                        window.open(url, "_blank");
                      }}
                    >
                      <Navigation className="w-3 h-3 mr-1" />
                      Navegar
                    </Button>
                  </div>
                </div>
              ))}

              {filteredRoutes.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    No hay rutas que coincidan con los filtros
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
