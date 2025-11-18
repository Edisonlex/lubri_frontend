"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Circle,
} from "react-leaflet";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useGIS,
  type GeographicEntity,
  type Coordinates,
} from "@/contexts/gis-context";
import { MapPin, Navigation, Target } from "lucide-react";

// Fix for default markers in react-leaflet
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Map controller component to handle map state changes
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

// Entity marker component
function EntityMarker({
  entity,
  onClick,
  onViewDetails,
}: {
  entity: GeographicEntity;
  onClick: (entity: GeographicEntity) => void;
  onViewDetails?: (entity: GeographicEntity) => void;
}) {
  return (
    <Marker
      position={[entity.coordinates.lat, entity.coordinates.lng]}
      eventHandlers={{
        click: () => onClick(entity),
      }}
    >
      <Popup>
        <div className="p-2 min-w-[200px]">
          <h3 className="font-semibold text-lg mb-2">{entity.name}</h3>
          <p className="text-sm text-gray-600 mb-1">
            <MapPin className="inline w-4 h-4 mr-1" />
            {entity.address}
          </p>
          <p className="text-sm text-gray-600 mb-2">
            <strong>Ciudad:</strong> {entity.city}
          </p>
          {entity.popupContent && (
            <div
              className="text-sm text-gray-700 mb-2"
              dangerouslySetInnerHTML={{ __html: entity.popupContent }}
            />
          )}
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                window.open(
                  `https://www.google.com/maps/dir/?api=1&destination=${entity.coordinates.lat},${entity.coordinates.lng}`,
                  "_blank"
                )
              }
            >
              <Navigation className="w-4 h-4 mr-1" />
              Ruta
            </Button>
            {onViewDetails && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewDetails(entity)}
              >
                <Target className="w-4 h-4 mr-1" />
                Ver detalles
              </Button>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

interface LubriSmartMapProps {
  height?: string | number;
  showControls?: boolean;
  showLegend?: boolean;
  radiusFilter?: { center: Coordinates; radiusKm: number };
  entityFilter?: GeographicEntity["type"][];
  className?: string;
  provider?: "leaflet" | "google_embed";
  embedUrl?: string;
  onViewEntity?: (entity: GeographicEntity) => void;
}

export function LubriSmartMap({
  height = "400px",
  showControls = true,
  showLegend = true,
  radiusFilter,
  entityFilter = ["customer", "supplier", "warehouse"],
  className = "",
  provider = "leaflet",
  embedUrl,
  onViewEntity,
}: LubriSmartMapProps) {
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

  const [mapType, setMapType] = useState<"street" | "satellite" | "terrain">(
    "street"
  );

  // Combine all entities based on filter
  const allEntities = [
    ...(entityFilter.includes("customer") ? customers : []),
    ...(entityFilter.includes("supplier") ? suppliers : []),
    ...(entityFilter.includes("warehouse") ? warehouses : []),
  ];

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

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Mapa Geográfico - LubriSmart
        </h2>
        {showControls && (
          <div className="flex gap-2">
            <select
              value={mapType}
              onChange={(e) => setMapType(e.target.value as typeof mapType)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="street">Callejero</option>
              <option value="satellite">Satélite</option>
              <option value="terrain">Terreno</option>
            </select>
          </div>
        )}
      </div>

      <div className="relative">
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
              height,
              minHeight: "400px",
              width: "100%",
              borderRadius: "8px",
            }}
            className="rounded-lg border"
          >
            <MapController center={center} zoom={zoom} />
            <TileLayer
              url={getTileLayer()}
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
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
              <EntityMarker
                key={entity.id}
                entity={entity}
                onClick={handleEntityClick}
                onViewDetails={onViewEntity}
              />
            ))}
          </MapContainer>
        )}

        {showLegend && provider === "leaflet" && (
          <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg border">
            <div className="font-semibold mb-2">Leyenda</div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-blue-500" />
                Clientes
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-green-500" />
                Proveedores
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-orange-500" />
                Almacenes
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
