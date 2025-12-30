"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGIS, type GeographicEntity } from "@/contexts/gis-context";
// Replace direct import with dynamic client-only import to avoid SSR window errors
import dynamic from "next/dynamic";
const LubriSmartMap = dynamic(
  () => import("./map").then((m) => m.LubriSmartMap),
  { ssr: false }
);
import { Search, MapPin, Users, Navigation } from "lucide-react";

interface CustomerMapProps {
  customers?: GeographicEntity[];
  className?: string;
}

export function CustomerMap({
  customers: propCustomers,
  className = "",
}: CustomerMapProps) {
  const {
    customers: contextCustomers,
    getEntitiesInRadius,
    setCenter,
  } = useGIS();
  const customers = propCustomers || contextCustomers;

  const [searchTerm, setSearchTerm] = useState("");
  const [radiusFilter, setRadiusFilter] = useState<number>(0);
  const [selectedCustomer, setSelectedCustomer] =
    useState<GeographicEntity | null>(null);

  // Filter customers based on search term
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Apply radius filter if set
  const displayCustomers =
    radiusFilter > 0 && selectedCustomer
      ? getEntitiesInRadius(selectedCustomer.coordinates, radiusFilter).filter(
          (e) => e.type === "customer"
        )
      : filteredCustomers;

  const handleCustomerSelect = (customer: GeographicEntity) => {
    setSelectedCustomer(customer);
    setCenter(customer.coordinates);
  };

  const handleGetDirections = (customer: GeographicEntity) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${customer.coordinates.lat},${customer.coordinates.lng}`,
      "_blank"
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Mapa de Clientes
          </CardTitle>
          <CardDescription>
            Visualiza la ubicación geográfica de tus clientes en La Maná y
            alrededores
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer-search">Buscar Cliente</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="customer-search"
                  placeholder="Buscar por nombre, dirección o ciudad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="radius-filter">Filtrar por Radio (km)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="radius-filter"
                  min={0}
                  max={50}
                  step={5}
                  value={[radiusFilter]}
                  onValueChange={(value) => setRadiusFilter(value[0])}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-12 text-right">
                  {radiusFilter}km
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {displayCustomers.length} clientes
            </Badge>
            {radiusFilter > 0 && (
              <Badge variant="outline" className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Radio: {radiusFilter}km
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Customer List and Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Lista de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {displayCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedCustomer?.id === customer.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={() => handleCustomerSelect(customer)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">{customer.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {customer.city}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{customer.address}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>📍 Coord:</span>
                      <span>
                        {customer.coordinates.lat.toFixed(4)},{" "}
                        {customer.coordinates.lng.toFixed(4)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGetDirections(customer);
                      }}
                      className="text-xs"
                    >
                      <Navigation className="w-3 h-3 mr-1" />
                      Ruta
                    </Button>
                  </div>
                </div>
              ))}

              {displayCustomers.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No se encontraron clientes</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Map */}
        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            <LubriSmartMap
              height="500px"
              entityFilter={["customer"]}
              radiusFilter={
                radiusFilter > 0 && selectedCustomer
                  ? {
                      center: selectedCustomer.coordinates,
                      radiusKm: radiusFilter,
                    }
                  : undefined
              }
              showLegend={false}
              showControls={true}
              provider="google_embed"
              embedUrl="https://www.google.com/maps?q=loc:-0.941723,-79.229129&output=embed"
            />
            <div className="p-3">
              <div className="bg-white border rounded-lg p-3">
                <div className="font-semibold mb-2">Leyenda</div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-blue-500" />
                    Clientes
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Details Panel */}
      {selectedCustomer && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Detalles del Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-1">
                    Información General
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nombre:</span>
                      <span className="font-medium">
                        {selectedCustomer.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dirección:</span>
                      <span className="font-medium">
                        {selectedCustomer.address}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ciudad:</span>
                      <span className="font-medium">
                        {selectedCustomer.city}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-1">
                    Ubicación Geográfica
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Latitud:</span>
                      <span className="font-medium">
                        {selectedCustomer.coordinates.lat.toFixed(6)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Longitud:</span>
                      <span className="font-medium">
                        {selectedCustomer.coordinates.lng.toFixed(6)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tipo:</span>
                      <Badge variant="secondary" className="text-xs">
                        {selectedCustomer.type === "customer"
                          ? "Cliente"
                          : "Otro"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleGetDirections(selectedCustomer)}
                    className="flex items-center gap-1"
                  >
                    <Navigation className="w-4 h-4" />
                    Obtener Ruta
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCenter(selectedCustomer.coordinates)}
                    className="flex items-center gap-1"
                  >
                    <MapPin className="w-4 h-4" />
                    Centrar Mapa
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
