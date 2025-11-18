"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { geocodeAddress, reverseGeocode, batchGeocode, isGeocodingError } from '@/lib/geocoding'
import { 
  getCityCoordinates,
  getCityCoordinatesEnhanced,
  getCitiesByRegion as getCitiesByRegionFunc,
  getNearbyCities as getNearbyCitiesFunc,
  generateWarehouseLocations as generateWarehouseLocationsFunc,
  createGeographicCluster as createGeographicClusterFunc,
  sampleEcuadorCoordinates,
  getRegionalStatistics as getRegionalStatisticsFunc
} from '@/lib/ecuador-mock-data';
import { api } from '@/lib/api';

// Geographic coordinates for Ecuador locations
export interface Coordinates {
  lat: number
  lng: number
}

export interface GeographicEntity {
  id: string
  name: string
  coordinates: Coordinates
  address: string
  city: string
  type: 'customer' | 'supplier' | 'warehouse' | 'delivery'
  popupContent?: string
  status?: 'active' | 'inactive'
  metadata?: Record<string, any>
}

export interface GISContextType {
  // Map state
  center: Coordinates
  zoom: number
  selectedEntity: GeographicEntity | null
  
  // Map controls
  setCenter: (coords: Coordinates) => void
  setZoom: (zoom: number) => void
  setSelectedEntity: (entity: GeographicEntity | null) => void
  
  // Geographic data
  customers: GeographicEntity[]
  suppliers: GeographicEntity[]
  warehouses: GeographicEntity[]
  
  // Operations
  addEntity: (entity: GeographicEntity) => void
  removeEntity: (id: string) => void
  updateEntity: (id: string, updates: Partial<GeographicEntity>) => void
  
  // Utility functions
  getDistance: (from: Coordinates, to: Coordinates) => number
  getEntitiesByType: (type: GeographicEntity['type']) => GeographicEntity[]
  getEntitiesInRadius: (center: Coordinates, radius: number, type?: GeographicEntity['type']) => GeographicEntity[];
  
  // Geocoding functions
  geocodeAddress: (address: string, city?: string) => Promise<Coordinates | null>;
  reverseGeocode: (lat: number, lon: number) => Promise<string | null>;
  geocodeEntities: () => Promise<void>;
  // Enhanced Ecuador-specific functions
  getEnhancedCityCoordinates: (city: string) => { lat: number; lng: number; region: string; population: number };
  getCitiesByRegion: (region: string) => Array<{ city: string; lat: number; lng: number; region: string; population: number }>;
  getNearbyCities: (city: string, radiusKm?: number) => Array<{ city: string; distance: number; lat: number; lng: number; region: string; population: number }>;
  generateWarehouseLocations: (city: string) => Array<{ name: string; coordinates: { lat: number; lng: number }; address: string; capacity: number; city: string; region: string }>;
  createGeographicCluster: (centerCity: string, clusterSize?: number) => Array<{ coordinates: { lat: number; lng: number }; city: string; region: string; distanceFromCenter: number }>;
  getRegionalStatistics: () => Record<string, { cities: string[]; totalPopulation: number; coordinates: { lat: number; lng: number }; cityCount: number }>;
  loadEnhancedEcuadorData: () => void;
}

// Default center on La Maná, Cotopaxi, Ecuador
const DEFAULT_CENTER: Coordinates = {
  lat: -0.941723,
  lng: -79.229129
}

const GISContext = createContext<GISContextType | undefined>(undefined)

export function GISProvider({ children }: { children: ReactNode }) {
  const [center, setCenter] = useState<Coordinates>(DEFAULT_CENTER)
  const [zoom, setZoom] = useState<number>(12)
  const [selectedEntity, setSelectedEntity] = useState<GeographicEntity | null>(null)
  
  const [customers, setCustomers] = useState<GeographicEntity[]>([]);
  const [suppliers, setSuppliers] = useState<GeographicEntity[]>([]);

  // Load data from API (which is backed by mock-data.ts)
  useEffect(() => {
    (async () => {
      try {
        const [apiCustomers, apiSuppliers] = await Promise.all([
          api.getCustomers(),
          api.getSuppliers(),
        ]);

        const mappedCustomers: GeographicEntity[] = apiCustomers.map((c: any) => {
          const coords = getCityCoordinatesEnhanced(c.city || 'Quito');
          return {
            id: c.id,
            name: c.name,
            type: 'customer',
            coordinates: coords,
            address: c.address,
            city: c.city || 'Quito',
            status: c.status as 'active' | 'inactive',
            metadata: {
              customerType: c.customerType,
              totalPurchases: c.totalPurchases,
              lastPurchase: c.lastPurchase,
              email: c.email,
              phone: c.phone,
            },
          };
        });

        const mappedSuppliers: GeographicEntity[] = apiSuppliers.map((s: any) => {
          const coords = getCityCoordinatesEnhanced(s.city || 'Quito');
          return {
            id: s.id,
            name: s.name,
            type: 'supplier',
            coordinates: coords,
            address: s.address,
            city: s.city || 'Quito',
            status: s.status as 'active' | 'inactive',
            metadata: {
              contactPerson: s.contactPerson,
              email: s.email,
              phone: s.phone,
              rating: s.rating,
              totalOrders: s.totalOrders,
            },
          };
        });

        setCustomers(mappedCustomers);
        setSuppliers(mappedSuppliers);
      } catch (e) {
        console.error('Error loading GIS data from API', e);
      }
    })();
  }, []);

  const [warehouses, setWarehouses] = useState<GeographicEntity[]>(() => [
    {
      id: 'warehouse-lamana',
      name: 'Lubricadora La Maná (Principal)',
      type: 'warehouse',
      coordinates: { lat: -0.941723, lng: -79.229129 },
      address: 'La Maná, Cotopaxi',
      city: 'La Maná',
      status: 'active',
      metadata: {
        capacity: '8000 unidades',
        currentStock: '5200 unidades',
        manager: 'Administrador'
      }
    },
    {
      id: 'warehouse-1',
      name: 'Bodega Principal Quito',
      type: 'warehouse',
      coordinates: getCityCoordinates('Quito'),
      address: 'Av. Amazonas 1234, Quito',
      city: 'Quito',
      status: 'active',
      metadata: {
        capacity: '5000 unidades',
        currentStock: '3200 unidades',
        manager: 'Juan Pérez'
      }
    },
    {
      id: 'warehouse-2',
      name: 'Bodega Guayaquil',
      type: 'warehouse',
      coordinates: getCityCoordinates('Guayaquil'),
      address: 'Av. 9 de Octubre 1122, Guayaquil',
      city: 'Guayaquil',
      status: 'active',
      metadata: {
        capacity: '3000 unidades',
        currentStock: '2100 unidades',
        manager: 'María González'
      }
    },
    {
      id: 'warehouse-3',
      name: 'Bodega Cuenca',
      type: 'warehouse',
      coordinates: getCityCoordinates('Cuenca'),
      address: 'Av. España 567, Cuenca',
      city: 'Cuenca',
      status: 'active',
      metadata: {
        capacity: '2000 unidades',
        currentStock: '1500 unidades',
        manager: 'Carlos Rodríguez'
      }
    }
  ])
  
  // Utility function to calculate distance between two coordinates (Haversine formula)
  const getDistance = useCallback((from: Coordinates, to: Coordinates): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (to.lat - from.lat) * Math.PI / 180;
    const dLng = (to.lng - from.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, [])
  
  const getEntitiesByType = useCallback((type: GeographicEntity['type']): GeographicEntity[] => {
    switch (type) {
      case 'customer':
        return customers
      case 'supplier':
        return suppliers
      case 'warehouse':
        return warehouses
      case 'delivery':
        return [] // Could be added later
      default:
        return []
    }
  }, [customers, suppliers, warehouses])
  
  const getEntitiesInRadius = useCallback((center: Coordinates, radiusKm: number, type?: GeographicEntity['type']): GeographicEntity[] => {
    const allEntities = [...customers, ...suppliers, ...warehouses]
    return allEntities.filter(entity => {
      const distance = getDistance(center, entity.coordinates)
      const typeMatch = type ? entity.type === type : true
      return distance <= radiusKm && typeMatch
    })
  }, [customers, suppliers, warehouses, getDistance])
  
  const addEntity = useCallback((entity: GeographicEntity) => {
    switch (entity.type) {
      case 'customer':
        setCustomers(prev => [...prev, entity])
        break
      case 'supplier':
        setSuppliers(prev => [...prev, entity])
        break
      case 'warehouse':
        setWarehouses(prev => [...prev, entity])
        break
    }
  }, [])
  
  const removeEntity = useCallback((id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id))
    setSuppliers(prev => prev.filter(s => s.id !== id))
    setWarehouses(prev => prev.filter(w => w.id !== id))
  }, [])
  
  const updateEntity = useCallback((id: string, updates: Partial<GeographicEntity>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
    setWarehouses(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w))
  }, [])
  
  // Geocoding functions
  const geocodeAddressHandler = useCallback(async (address: string, city?: string): Promise<Coordinates | null> => {
    try {
      const result = await geocodeAddress(address, city)
      if (isGeocodingError(result)) {
        console.error('Geocoding error:', result.message)
        return null
      }
      return { lat: result.lat, lng: result.lon }
    } catch (error) {
      console.error('Geocoding failed:', error)
      return null
    }
  }, [])
  
  const reverseGeocodeHandler = useCallback(async (lat: number, lon: number): Promise<string | null> => {
    try {
      const result = await reverseGeocode(lat, lon)
      if (isGeocodingError(result)) {
        console.error('Reverse geocoding error:', result.message)
        return null
      }
      return result
    } catch (error) {
      console.error('Reverse geocoding failed:', error)
      return null
    }
  }, [])
  
  const geocodeEntities = useCallback(async () => {
    const allEntities = [...customers, ...suppliers, ...warehouses]
    const entitiesToGeocode = allEntities.filter(entity => 
      entity.coordinates.lat === 0 && entity.coordinates.lng === 0
    )
    if (entitiesToGeocode.length === 0) return
    
    const addresses = entitiesToGeocode.map(entity => ({
      id: entity.id,
      address: entity.address || entity.name,
      city: entity.city
    }))
    
    const results = await batchGeocode(addresses)
    results.forEach(({ id, result }) => {
      if (!isGeocodingError(result)) {
        updateEntity(id, { coordinates: { lat: result.lat, lng: result.lon } })
      }
    })
  }, [customers, suppliers, warehouses, updateEntity])

  // Enhanced Ecuador-specific functions
  const getEnhancedCityCoordinates = useCallback((city: string) => {
    return getCityCoordinatesEnhanced(city);
  }, []);

  const getCitiesByRegion = useCallback((region: string) => {
    return getCitiesByRegionFunc(region);
  }, []);

  const getNearbyCities = useCallback((city: string, radiusKm: number = 50) => {
    return getNearbyCitiesFunc(city, radiusKm);
  }, []);

  const generateWarehouseLocations = useCallback((city: string) => {
    return generateWarehouseLocationsFunc(city);
  }, []);

  const createGeographicCluster = useCallback((centerCity: string, clusterSize: number = 5) => {
    return createGeographicClusterFunc(centerCity, clusterSize);
  }, []);

  const getRegionalStatistics = useCallback(() => {
    return getRegionalStatisticsFunc();
  }, []);

  const loadEnhancedEcuadorData = useCallback(async () => {
    try {
      const [apiCustomers, apiSuppliers] = await Promise.all([
        api.getCustomers(),
        api.getSuppliers(),
      ]);

      const enhancedCustomers = apiCustomers.map((customer: any) => ({
        id: customer.id,
        name: customer.name,
        type: 'customer' as const,
        coordinates: getCityCoordinatesEnhanced(customer.city || 'Quito'),
        address: customer.address,
        city: customer.city || 'Quito',
        status: customer.status as 'active' | 'inactive',
        metadata: {
          customerType: customer.customerType,
          totalPurchases: customer.totalPurchases,
          lastPurchase: customer.lastPurchase,
          email: customer.email,
          phone: customer.phone,
        },
      }));

      const enhancedSuppliers = apiSuppliers.map((supplier: any) => ({
        id: supplier.id,
        name: supplier.name,
        type: 'supplier' as const,
        coordinates: getCityCoordinatesEnhanced(supplier.city || 'Quito'),
        address: supplier.address,
        city: supplier.city || 'Quito',
        status: supplier.status as 'active' | 'inactive',
        metadata: {
          contactPerson: supplier.contactPerson,
          email: supplier.email,
          phone: supplier.phone,
          rating: supplier.rating,
          totalOrders: supplier.totalOrders,
        },
      }));

      setCustomers(enhancedCustomers);
      setSuppliers(enhancedSuppliers);
    } catch (e) {
      console.error('Error loading enhanced data', e);
    }
  }, [])
  
  const value: GISContextType = {
    center,
    zoom,
    selectedEntity,
    setCenter,
    setZoom,
    setSelectedEntity,
    customers,
    suppliers,
    warehouses,
    addEntity,
    removeEntity,
    updateEntity,
    getDistance,
    getEntitiesByType,
    getEntitiesInRadius,
    geocodeAddress: geocodeAddressHandler,
    reverseGeocode: reverseGeocodeHandler,
    geocodeEntities,
    // Enhanced Ecuador-specific functions
    getEnhancedCityCoordinates,
    getCitiesByRegion,
    getNearbyCities,
    generateWarehouseLocations,
    createGeographicCluster,
    getRegionalStatistics,
    loadEnhancedEcuadorData
  }
  
  return <GISContext.Provider value={value}>{children}</GISContext.Provider>
}

export function useGIS() {
  const context = useContext(GISContext)
  if (context === undefined) {
    throw new Error("useGIS debe ser usado dentro de un GISProvider")
  }
  return context
}