"use client";

import { useGIS } from '@/contexts/gis-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

export function EcuadorGeocodingDemo() {
  const {
    getEnhancedCityCoordinates,
    getCitiesByRegion,
    getNearbyCities,
    generateWarehouseLocations,
    createGeographicCluster,
    getRegionalStatistics,
    loadEnhancedEcuadorData,
    customers,
    suppliers,
    warehouses
  } = useGIS();

  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [nearbyCities, setNearbyCities] = useState<Array<{ city: string; distance: number; lat: number; lng: number; region: string; population: number }>>([]);
  const [warehouseLocations, setWarehouseLocations] = useState<Array<{ name: string; coordinates: { lat: number; lng: number }; address: string; capacity: number; city: string; region: string }>>([]);
  const [geographicCluster, setGeographicCluster] = useState<Array<{ coordinates: { lat: number; lng: number }; city: string; region: string; distanceFromCenter: number }>>([]);
  const [regionalStats, setRegionalStats] = useState<Record<string, { cities: string[]; totalPopulation: number; coordinates: { lat: number; lng: number }; cityCount: number }> | null>(null);

  const regions = ['Costa', 'Sierra', 'Oriente', 'Galápagos'];
  const majorCities = ['Quito', 'Guayaquil', 'Cuenca', 'Manta', 'Ambato', 'Riobamba', 'Loja', 'Esmeraldas'];

  const handleGetCitiesByRegion = (region: string) => {
    const cities = getCitiesByRegion(region);
    setSelectedRegion(region);
    console.log(`Cities in ${region}:`, cities);
  };

  const handleGetNearbyCities = (city: string) => {
    const nearby = getNearbyCities(city, 100);
    setNearbyCities(nearby);
    setSelectedCity(city);
    console.log(`Cities near ${city}:`, nearby);
  };

  const handleGenerateWarehouses = (city: string) => {
    const warehouses = generateWarehouseLocations(city);
    setWarehouseLocations(warehouses);
    console.log(`Warehouse locations for ${city}:`, warehouses);
  };

  const handleCreateGeographicCluster = (city: string) => {
    const cluster = createGeographicCluster(city, 8);
    setGeographicCluster(cluster);
    console.log(`Geographic cluster for ${city}:`, cluster);
  };

  const handleGetRegionalStatistics = () => {
    const stats = getRegionalStatistics();
    setRegionalStats(stats);
    console.log('Regional statistics:', stats);
  };

  const handleLoadEnhancedData = () => {
    loadEnhancedEcuadorData();
    console.log('Enhanced Ecuador data loaded');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Demo de Mejora de Geocodificación para Ecuador</CardTitle>
          <CardDescription>
            Funcionalidad mejorada de geocodificación con datos regionales, ciudades cercanas, generación de almacenes y agrupamiento geográfico
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleLoadEnhancedData} variant="outline">
              Cargar Datos Mejorados
            </Button>
            <Button onClick={handleGetRegionalStatistics} variant="outline">
              Obtener Estadísticas Regionales
            </Button>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Obtener Ciudades por Región</h4>
            <div className="flex flex-wrap gap-2">
              {regions.map(region => (
                <Button
                  key={region}
                  onClick={() => handleGetCitiesByRegion(region)}
                  variant={selectedRegion === region ? "default" : "outline"}
                  size="sm"
                >
                  {region}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Obtener Ciudades Cercanas (radio 100km)</h4>
            <div className="flex flex-wrap gap-2">
              {majorCities.map(city => (
                <Button
                  key={city}
                  onClick={() => handleGetNearbyCities(city)}
                  variant={selectedCity === city ? "default" : "outline"}
                  size="sm"
                >
                  {city}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Generar Ubicaciones de Almacenes</h4>
            <div className="flex flex-wrap gap-2">
              {majorCities.map(city => (
                <Button
                  key={city}
                  onClick={() => handleGenerateWarehouses(city)}
                  variant="outline"
                  size="sm"
                >
                  {city}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Crear Grupo Geográfico</h4>
            <div className="flex flex-wrap gap-2">
              {majorCities.map(city => (
                <Button
                  key={city}
                  onClick={() => handleCreateGeographicCluster(city)}
                  variant="outline"
                  size="sm"
                >
                  {city}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Resumen de Datos Actuales</h4>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="bg-blue-50 p-2 rounded">
                <div className="font-medium">Clientes</div>
                <div>{customers.length}</div>
              </div>
              <div className="bg-green-50 p-2 rounded">
                <div className="font-medium">Proveedores</div>
                <div>{suppliers.length}</div>
              </div>
              <div className="bg-purple-50 p-2 rounded">
                <div className="font-medium">Almacenes</div>
                <div>{warehouses.length}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {nearbyCities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ciudades Cercanas a {selectedCity}</CardTitle>
            <CardDescription>Ciudades dentro de un radio de 100km</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {nearbyCities.map((city, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-medium">{city.city}</span>
                  <span className="text-sm text-gray-600">
                    {city.distance?.toFixed(1)}km
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {warehouseLocations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ubicaciones de Almacenes</CardTitle>
            <CardDescription>Posiciones generadas de almacenes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {warehouseLocations.map((warehouse, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded">
                  <div className="font-medium">{warehouse.name}</div>
                  <div className="text-sm text-gray-600">
                    {warehouse.address}, {warehouse.city}
                  </div>
                  <div className="text-xs text-gray-500">
                    Lat: {warehouse.coordinates.lat.toFixed(4)}, Lng: {warehouse.coordinates.lng.toFixed(4)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {geographicCluster.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Grupo Geográfico</CardTitle>
            <CardDescription>Grupo de ubicaciones alrededor de la ciudad seleccionada</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {geographicCluster.map((location, index) => (
                <div key={index} className="flex justify-between items-center p-2 border rounded">
                  <span className="font-medium">{location.city}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{location.distanceFromCenter}km</Badge>
                    <Badge variant="secondary">{location.region}</Badge>
                    <span className="text-sm text-gray-500">
                      {location.coordinates.lat.toFixed(4)}, {location.coordinates.lng.toFixed(4)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {regionalStats && (
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas Regionales</CardTitle>
            <CardDescription>Datos de población y económicos por región</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {Object.entries(regionalStats).map(([region, data]) => (
                <div key={region} className="p-3 border rounded">
                  <div className="font-medium text-lg mb-2">{region}</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Ciudades: {data.cityCount}</div>
                    <div>Población: {data.totalPopulation.toLocaleString()}</div>
                    <div>Centro: {data.coordinates.lat.toFixed(2)}, {data.coordinates.lng.toFixed(2)}</div>
                    <div>Ciudades Ejemplo: {data.cities.slice(0, 3).join(', ')}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Current Data Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{customers.length}</div>
              <div className="text-sm text-gray-600">Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{suppliers.length}</div>
              <div className="text-sm text-gray-600">Suppliers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{customers.length + suppliers.length + warehouses.length}</div>
              <div className="text-sm text-gray-600">Sample Coordinates</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}