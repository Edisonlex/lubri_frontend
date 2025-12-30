"use client";

import { useEffect, useState, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Circle,
  ZoomControl,
} from "react-leaflet";
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
import {
  MapPin,
  Navigation,
  Target,
  Layers,
  Maximize2,
  Minimize2,
  Filter,
} from "lucide-react";
import {
  useGIS,
  type GeographicEntity,
  type Coordinates,
} from "@/contexts/gis-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";

// Fix for default markers in react-leaflet
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./map-styles.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom icons for different entity types
const createCustomIcon = (color: string, type: string) => {
  return new L.DivIcon({
    className: "custom-marker",
    html: `<div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg" style="background-color: ${color}">
      ${type === "customer" ? "👤" : type === "supplier" ? "🏭" : "🏢"}
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Map controller component
function MapController({
  center,
  zoom,
}: {
  center: Coordinates;
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView([center.lat, center.lng], zoom);
  }, [map, center, zoom]);

  return null;
}

// Custom hook to detect sidebar state
function useSidebarAwareness() {
  const [sidebarWidth, setSidebarWidth] = useState(280); // Default expanded width
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Listen for sidebar state changes
    const checkSidebarState = () => {
      const sidebar = document.querySelector('[data-sidebar]');
      if (sidebar) {
        const width = sidebar.clientWidth;
        setSidebarWidth(width);
        setIsCollapsed(width < 150); // Consider collapsed if width is less than 150px
      }
    };

    checkSidebarState();
    window.addEventListener('resize', checkSidebarState);
    
    // Also observe attribute changes on sidebar
    const observer = new MutationObserver(checkSidebarState);
    const sidebar = document.querySelector('[data-sidebar]');
    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ['style', 'class'] });
    }

    return () => {
      window.removeEventListener('resize', checkSidebarState);
      observer.disconnect();
    };
  }, []);

  return { sidebarWidth, isCollapsed };
}

// Enhanced entity marker component
function EnhancedEntityMarker({
  entity,
  onClick,
  onViewDetails,
  isSelected,
}: {
  entity: GeographicEntity;
  onClick: (entity: GeographicEntity) => void;
  onViewDetails?: (entity: GeographicEntity) => void;
  isSelected?: boolean;
}) {
  const iconColor =
    entity.type === "customer"
      ? "#3b82f6"
      : entity.type === "supplier"
      ? "#10b981"
      : "#f59e0b";
  const customIcon = createCustomIcon(iconColor, entity.type);

  return (
    <Marker
      position={[entity.coordinates.lat, entity.coordinates.lng]}
      icon={customIcon}
      eventHandlers={{
        click: () => onClick(entity),
      }}
    >
      <Popup className="enhanced-popup">
        <div className="p-3 min-w-[250px]">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
              style={{ backgroundColor: iconColor }}
            >
              {entity.type === "customer"
                ? "👤"
                : entity.type === "supplier"
                ? "🏭"
                : "🏢"}
            </div>
            <h3 className="font-semibold text-lg truncate">{entity.name}</h3>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{entity.address}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                {entity.city}
              </span>
              <Badge
                variant={entity.status === "active" ? "default" : "secondary"}
                className="text-xs"
              >
                {entity.status === "active" ? "Activo" : "Inactivo"}
              </Badge>
            </div>

            {entity.metadata && (
              <div className="border-t pt-2 mt-2 space-y-1">
                {entity.metadata.email && (
                  <div className="text-xs text-gray-600">
                    <strong>Email:</strong> {entity.metadata.email}
                  </div>
                )}
                {entity.metadata.phone && (
                  <div className="text-xs text-gray-600">
                    <strong>Tel:</strong> {entity.metadata.phone}
                  </div>
                )}
                {entity.metadata.totalPurchases && (
                  <div className="text-xs text-gray-600">
                    <strong>Compras:</strong> $
                    {entity.metadata.totalPurchases?.toLocaleString()}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                window.open(
                  `https://www.google.com/maps/dir/?api=1&destination=${entity.coordinates.lat},${entity.coordinates.lng}`,
                  "_blank"
                )
              }
              className="flex-1"
            >
              <Navigation className="w-4 h-4 mr-1" />
              Ruta
            </Button>
            {onViewDetails && (
              <Button
                size="sm"
                variant="default"
                onClick={() => onViewDetails(entity)}
                className="flex-1"
              >
                <Target className="w-4 h-4 mr-1" />
                Detalles
              </Button>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

interface EnhancedMapProps {
  height?: string | number;
  showControls?: boolean;
  showLegend?: boolean;
  showFilters?: boolean;
  radiusFilter?: { center: Coordinates; radiusKm: number };
  entityFilter?: GeographicEntity["type"][];
  className?: string;
  provider?: "leaflet" | "google_embed";
  embedUrl?: string;
  onViewEntity?: (entity: GeographicEntity) => void;
  title?: string;
}

export function EnhancedMap({
  height = "400px",
  showControls = true,
  showLegend = true,
  showFilters = true,
  radiusFilter,
  entityFilter = ["customer", "supplier", "warehouse"],
  className = "",
  provider = "leaflet",
  embedUrl,
  onViewEntity,
  title = "Mapa Geográfico",
}: EnhancedMapProps) {
  const {
    center,
    zoom,
    setCenter,
    setZoom,
    setSelectedEntity,
    customers,
    suppliers,
    warehouses,
  } = useGIS();

  const isMobile = useIsMobile();
  const { sidebarWidth, isCollapsed } = useSidebarAwareness();
  const [mapType, setMapType] = useState<"street" | "satellite" | "terrain">("street");
  const [showFiltersPanel, setShowFiltersPanel] = useState(!isMobile);
  const [selectedEntityType, setSelectedEntityType] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");

  // Combine all entities based on filter
  const allEntities = useMemo(() => {
    let entities = [
      ...(entityFilter.includes("customer") ? customers : []),
      ...(entityFilter.includes("supplier") ? suppliers : []),
      ...(entityFilter.includes("warehouse") ? warehouses : []),
    ];

    // Apply additional filters
    if (selectedEntityType !== "all") {
      entities = entities.filter(
        (entity) => entity.type === selectedEntityType
      );
    }

    if (selectedCity !== "all") {
      entities = entities.filter((entity) => entity.city === selectedCity);
    }

    return entities;
  }, [
    customers,
    suppliers,
    warehouses,
    entityFilter,
    selectedEntityType,
    selectedCity,
  ]);

  const handleEntityClick = (entity: GeographicEntity) => {
    setSelectedEntity(entity);
    setCenter(entity.coordinates);
  };

  const getTileLayer = () => {
    switch (mapType) {
      case "satellite":
        return "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      case "terrain":
        return "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
      default:
        return "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    }
  };

  const getUniqueCities = () => {
    const cities = allEntities.map((entity) => entity.city);
    return [...new Set(cities)].sort();
  };

  const entityColors = {
    customer: "#3b82f6",
    supplier: "#10b981",
    warehouse: "#f59e0b",
  };

  return (
    <Card className={`p-4 ${className} ${isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
          <h2 className="text-base sm:text-lg lg:text-xl font-semibold truncate">{title}</h2>
          <Badge variant="secondary" className="text-xs flex-shrink-0">
            {allEntities.length} entidades
          </Badge>
        </div>

        <div className="flex gap-2 w-full sm:w-auto flex-shrink-0">
          {showFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className="sm:hidden flex-1 sm:flex-none"
            >
              <Filter className="w-4 h-4 mr-1" />
              Filtros
            </Button>
          )}

          {showControls && (
            <Select
              value={mapType}
              onValueChange={(value) => setMapType(value as typeof mapType)}
            >
              <SelectTrigger className="w-28 sm:w-32 h-8 sm:h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="street">Callejero</SelectItem>
                <SelectItem value="satellite">Satélite</SelectItem>
                <SelectItem value="terrain">Terreno</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFiltersPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 sm:mb-4 overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/30 rounded-lg">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Entidad</label>
                <Select
                  value={selectedEntityType}
                  onValueChange={setSelectedEntityType}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="customer">Clientes</SelectItem>
                    <SelectItem value="supplier">Proveedores</SelectItem>
                    <SelectItem value="warehouse">Almacenes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ciudad</label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {getUniqueCities().map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Acciones</label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedEntityType("all");
                      setSelectedCity("all");
                    }}
                    className="flex-1"
                  >
                    Limpiar
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => setCenter(center)}
                    className="flex-1"
                  >
                    Centrar
                  </Button>
                </div>
              </div>

              {showLegend && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Leyenda</label>
                  <div className="space-y-1 text-xs">
                    {Object.entries(entityColors).map(([type, color]) => (
                      <div key={type} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span className="capitalize">
                          {type === "customer"
                            ? "Cliente"
                            : type === "supplier"
                            ? "Proveedor"
                            : "Almacén"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Container */}
      <div className="relative map-with-sidebar">
        {provider === "google_embed" && embedUrl ? (
          <iframe
            src={embedUrl}
            width="100%"
            height={typeof height === "number" ? `${height}px` : height}
            style={{ border: 0, borderRadius: "8px" }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="rounded-lg border"
          />
        ) : (
          <MapContainer
            center={[center.lat, center.lng]}
            zoom={zoom}
            style={{
              height: isMobile ? (typeof height === "number" ? `${Math.min(height, 300)}px` : "300px") : height,
              minHeight: isMobile ? "250px" : "400px",
              width: "100%",
              borderRadius: "8px",
            }}
            className="rounded-lg border"
            zoomControl={false}
            tap={isMobile ? true : false}
            dragging={true}
            touchZoom={true}
            scrollWheelZoom={true}
            doubleClickZoom={true}
            boxZoom={!isMobile}
            keyboard={!isMobile}
          >
            <MapController center={center} zoom={zoom} />
            <TileLayer
              url={getTileLayer()}
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <ZoomControl position="bottomright" />

            {radiusFilter && (
              <Circle
                center={[radiusFilter.center.lat, radiusFilter.center.lng]}
                radius={radiusFilter.radiusKm * 1000}
                pathOptions={{
                  color: "#3b82f6",
                  fillColor: "#3b82f6",
                  fillOpacity: 0.1,
                  weight: 2,
                }}
              />
            )}

            {allEntities.map((entity) => (
              <EnhancedEntityMarker
                key={entity.id}
                entity={entity}
                onClick={handleEntityClick}
                onViewDetails={onViewEntity}
              />
            ))}
          </MapContainer>
        )}

        {/* Floating Stats Panel - Simplified positioning */}
        <div 
          className="floating-stats-panel top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border max-w-xs"
          style={{ 
            transform: isMobile ? 'scale(0.9)' : 'none',
            transformOrigin: 'top right'
          }}
        >
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Clientes:</span>
              <span className="font-semibold text-blue-600">
                {allEntities.filter((e) => e.type === "customer").length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Proveedores:</span>
              <span className="font-semibold text-green-600">
                {allEntities.filter((e) => e.type === "supplier").length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Almacenes:</span>
              <span className="font-semibold text-amber-600">
                {allEntities.filter((e) => e.type === "warehouse").length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}