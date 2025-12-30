"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Navigation, Target, Filter, Layers } from "lucide-react";
import { useGIS, type GeographicEntity, type Coordinates } from "@/contexts/gis-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import "./map-styles.css";

// Dynamic import to avoid SSR issues
const SidebarAwareMap = dynamic(
  () => import("./sidebar-aware-map").then((m) => m.SidebarAwareMap),
  { ssr: false, loading: () => <MapLoadingSkeleton /> }
);

// Loading skeleton for the map
function MapLoadingSkeleton() {
  return (
    <Card className="p-4">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    </Card>
  );
}

interface UniversalMapProps {
  mode?: "analytics" | "customers" | "suppliers" | "inventory" | "delivery";
  height?: string | number;
  showControls?: boolean;
  showFilters?: boolean;
  showLegend?: boolean;
  radiusFilter?: { center: Coordinates; radiusKm: number };
  className?: string;
  title?: string;
  onEntitySelect?: (entity: GeographicEntity) => void;
  customFilters?: {
    entityTypes?: GeographicEntity["type"][];
    cities?: string[];
    status?: ("active" | "inactive")[];
  };
}

export function UniversalMap({
  mode = "analytics",
  height = "400px",
  showControls = true,
  showFilters = true,
  showLegend = true,
  radiusFilter,
  className = "",
  title,
  onEntitySelect,
  customFilters,
}: UniversalMapProps) {
  const isMobile = useIsMobile();
  
  // Get appropriate title based on mode
  const mapTitle = title || getTitleByMode(mode);
  
  // Get entity filter based on mode
  const entityFilter = useMemo(() => {
    if (customFilters?.entityTypes) return customFilters.entityTypes;
    return getEntityFilterByMode(mode);
  }, [mode, customFilters?.entityTypes]);

  // Get mode-specific configuration
  const mapConfig = useMemo(() => {
    return {
      entityFilter,
      showLegend,
      showControls,
      showFilters,
      height,
      title: mapTitle,
    };
  }, [entityFilter, showLegend, showControls, showFilters, height, mapTitle]);

  const handleEntitySelect = (entity: GeographicEntity) => {
    if (onEntitySelect) {
      onEntitySelect(entity);
    }
  };

  return (
    <SidebarAwareMap
      {...mapConfig}
      className={className}
      onViewEntity={handleEntitySelect}
      radiusFilter={radiusFilter}
    />
  );
}

// Helper functions
function getTitleByMode(mode: UniversalMapProps["mode"]): string {
  switch (mode) {
    case "analytics":
      return "Análisis Geográfico";
    case "customers":
      return "Mapa de Clientes";
    case "suppliers":
      return "Mapa de Proveedores";
    case "inventory":
      return "Mapa de Inventario";
    case "delivery":
      return "Mapa de Entregas";
    default:
      return "Mapa Geográfico";
  }
}

function getEntityFilterByMode(mode: UniversalMapProps["mode"]): GeographicEntity["type"][] {
  switch (mode) {
    case "analytics":
      return ["customer", "supplier", "warehouse"];
    case "customers":
      return ["customer"];
    case "suppliers":
      return ["supplier"];
    case "inventory":
      return ["warehouse", "supplier"];
    case "delivery":
      return ["customer", "warehouse"];
    default:
      return ["customer", "supplier", "warehouse"];
  }
}

// Export a simple map component for quick usage
export function SimpleMap({
  height = "300px",
  center,
  zoom = 12,
  markers = [],
  className = "",
}: {
  height?: string | number;
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    id: string;
    lat: number;
    lng: number;
    title?: string;
    description?: string;
    color?: string;
  }>;
  className?: string;
}) {
  const { center: contextCenter, setCenter } = useGIS();
  const mapCenter = center || contextCenter;

  return (
    <UniversalMap
      height={height}
      className={className}
      showControls={false}
      showFilters={false}
      showLegend={false}
    />
  );
}

// Export a customer-focused map
export function CustomerMap({
  height = "400px",
  className = "",
  onCustomerSelect,
}: {
  height?: string | number;
  className?: string;
  onCustomerSelect?: (customer: GeographicEntity) => void;
}) {
  return (
    <UniversalMap
      mode="customers"
      height={height}
      className={className}
      onEntitySelect={onCustomerSelect}
      showFilters={true}
      showLegend={true}
    />
  );
}

// Export a supplier-focused map
export function SupplierMap({
  height = "400px",
  className = "",
  onSupplierSelect,
}: {
  height?: string | number;
  className?: string;
  onSupplierSelect?: (supplier: GeographicEntity) => void;
}) {
  return (
    <UniversalMap
      mode="suppliers"
      height={height}
      className={className}
      onEntitySelect={onSupplierSelect}
      showFilters={true}
      showLegend={true}
    />
  );
}

// Export a delivery route map
export function DeliveryMap({
  height = "400px",
  className = "",
  deliveryRoute,
}: {
  height?: string | number;
  className?: string;
  deliveryRoute?: {
    origin: { lat: number; lng: number };
    destination: { lat: number; lng: number };
    waypoints?: Array<{ lat: number; lng: number }>;
  };
}) {
  return (
    <UniversalMap
      mode="delivery"
      height={height}
      className={className}
      showFilters={true}
      showLegend={true}
      radiusFilter={deliveryRoute ? {
        center: deliveryRoute.origin,
        radiusKm: 50,
      } : undefined}
    />
  );
}