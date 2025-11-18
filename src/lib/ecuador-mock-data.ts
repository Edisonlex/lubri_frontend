// Ecuador-specific mock data with real coordinates
import type { Customer, Supplier } from '@/lib/api';

// Major cities in Ecuador with their coordinates
export const ECUADOR_CITIES = {
  Quito: { lat: -0.1807, lng: -78.4678 },
  Guayaquil: { lat: -2.1894, lng: -79.8891 },
  Cuenca: { lat: -2.9006, lng: -79.0045 },
  Ambato: { lat: -1.2417, lng: -78.6197 },
  Riobamba: { lat: -1.6700, lng: -78.6479 },
  Machala: { lat: -3.2581, lng: -79.9554 },
  Manta: { lat: -0.9677, lng: -80.7087 },
  Esmeraldas: { lat: 0.9596, lng: -79.6500 },
  Portoviejo: { lat: -1.0546, lng: -80.4545 },
  Loja: { lat: -3.9931, lng: -79.2042 },
  Ibarra: { lat: 0.3516, lng: -78.1221 },
  "Santo Domingo": { lat: -0.2542, lng: -79.1737 },
  Quevedo: { lat: -1.0226, lng: -79.4604 },
  Latacunga: { lat: -0.9337, lng: -78.6147 },
  Tulcán: { lat: 0.8158, lng: -77.7181 }
};

// Ecuador-specific customers with real coordinates
export const ecuadorCustomers: Customer[] = [
  {
    id: "ec-1",
    name: "Juan Pérez García",
    email: "juan.perez@email.com",
    phone: "+593-99-123-4567",
    address: "Av. Amazonas 1234 y Naciones Unidas",
    city: "Quito",
    idNumber: "1712345678",
    customerType: "individual",
    totalPurchases: 1250.50,
    lastPurchase: "2024-01-18",
    registrationDate: "2023-06-15",
    status: "active",
    notes: "Cliente frecuente, prefiere aceites sintéticos",
    preferredContact: "whatsapp",
    vehicles: [
      {
        id: "v-ec-1",
        brand: "Toyota",
        model: "Corolla",
        year: 2020,
        plate: "ABC-1234",
        engine: "1.8L",
        mileage: 45000,
        lastService: "2024-01-10",
        nextService: "2024-04-10",
        oilType: "5W-30 Sintético",
        filterType: "Toyota Original",
        color: "Blanco",
      },
    ],
  },
  {
    id: "ec-2",
    name: "Transportes Rápidos S.A.",
    email: "info@transportesrapidos.com.ec",
    phone: "+593-2-234-5678",
    address: "Av. Simón Bolívar 567 y Eloy Alfaro",
    city: "Quito",
    idNumber: "1791234567001",
    customerType: "business",
    businessName: "Transportes Rápidos S.A.",
    ruc: "1791234567001",
    totalPurchases: 8750.25,
    lastPurchase: "2024-01-20",
    registrationDate: "2022-03-10",
    status: "active",
    notes: "Empresa de transporte, mantenimiento regular de flota",
    preferredContact: "email",
    vehicles: [
      {
        id: "v-ec-2",
        brand: "Chevrolet",
        model: "NPR",
        year: 2019,
        plate: "XYZ-5678",
        engine: "4.3L Diesel",
        mileage: 120000,
        lastService: "2024-01-15",
        nextService: "2024-03-15",
        oilType: "15W-40 Diesel",
        filterType: "Mann Filter",
        color: "Azul",
      },
      {
        id: "v-ec-3",
        brand: "Isuzu",
        model: "ELF",
        year: 2021,
        plate: "DEF-9012",
        engine: "3.0L Diesel",
        mileage: 85000,
        lastService: "2024-01-12",
        nextService: "2024-04-12",
        oilType: "15W-40 Diesel",
        filterType: "Isuzu Original",
        color: "Blanco",
      },
    ],
  },
  {
    id: "ec-3",
    name: "María Rodríguez López",
    email: "maria.rodriguez@email.com",
    phone: "+593-98-765-4321",
    address: "Av. América 890 y República",
    city: "Quito",
    idNumber: "1798765432",
    customerType: "individual",
    totalPurchases: 650.75,
    lastPurchase: "2024-01-16",
    registrationDate: "2023-09-20",
    status: "active",
    notes: "Prefiere productos económicos",
    preferredContact: "phone",
    vehicles: [
      {
        id: "v-ec-4",
        brand: "Nissan",
        model: "Sentra",
        year: 2018,
        plate: "GHI-3456",
        engine: "1.6L",
        mileage: 65000,
        lastService: "2024-01-08",
        nextService: "2024-04-08",
        oilType: "10W-30 Convencional",
        filterType: "Fram",
        color: "Gris",
      },
    ],
  },
  {
    id: "ec-4",
    name: "Taxi Express Cía. Ltda.",
    email: "gerencia@taxiexpress.com.ec",
    phone: "+593-4-345-6789",
    address: "Av. 9 de Octubre 1122 y Boyacá",
    city: "Guayaquil",
    idNumber: "0991234567001",
    customerType: "business",
    businessName: "Taxi Express Cía. Ltda.",
    ruc: "0991234567001",
    totalPurchases: 5420.80,
    lastPurchase: "2024-01-19",
    registrationDate: "2022-11-05",
    status: "active",
    notes: "Flota de taxis, mantenimiento cada 5000 km",
    preferredContact: "email",
    vehicles: [
      {
        id: "v-ec-5",
        brand: "Hyundai",
        model: "Accent",
        year: 2020,
        plate: "JKL-7890",
        engine: "1.4L",
        mileage: 95000,
        lastService: "2024-01-14",
        nextService: "2024-03-14",
        oilType: "5W-30 Semi-sintético",
        filterType: "Hyundai Original",
        color: "Amarillo",
      },
    ],
  },
  {
    id: "ec-5",
    name: "Carlos González Martínez",
    email: "carlos.gonzalez@email.com",
    phone: "+593-4-987-6543",
    address: "Av. Francisco de Orellana 234 y Lizardo García",
    city: "Guayaquil",
    idNumber: "0987654321",
    customerType: "individual",
    totalPurchases: 1890.50,
    lastPurchase: "2024-01-17",
    registrationDate: "2023-04-12",
    status: "active",
    notes: "Cliente premium, siempre solicita productos de alta gama",
    preferredContact: "whatsapp",
    vehicles: [
      {
        id: "v-ec-6",
        brand: "BMW",
        model: "320i",
        year: 2021,
        plate: "MNB-4321",
        engine: "2.0L Turbo",
        mileage: 35000,
        lastService: "2024-01-11",
        nextService: "2024-07-11",
        oilType: "5W-40 Sintético Premium",
        filterType: "BMW Original",
        color: "Negro",
      },
    ],
  },
  {
    id: "ec-6",
    name: "Flota Industrial Cuenca S.A.",
    email: "admin@fic.com.ec",
    phone: "+593-7-987-1234",
    address: "Av. España 567 y Huayna Cápac",
    city: "Cuenca",
    idNumber: "0198765432001",
    customerType: "business",
    businessName: "Flota Industrial Cuenca S.A.",
    ruc: "0198765432001",
    totalPurchases: 12500.75,
    lastPurchase: "2024-01-21",
    registrationDate: "2021-08-15",
    status: "active",
    notes: "Empresa minera con flota pesada",
    preferredContact: "email",
    vehicles: [
      {
        id: "v-ec-7",
        brand: "Volvo",
        model: "FH16",
        year: 2019,
        plate: "POI-0987",
        engine: "16.0L Diesel",
        mileage: 180000,
        lastService: "2024-01-13",
        nextService: "2024-02-13",
        oilType: "15W-40 Diesel Heavy Duty",
        filterType: "Volvo Original",
        color: "Rojo",
      },
    ],
  },
  {
    id: "ec-7",
    name: "Ana María Vélez Romero",
    email: "ana.velez@email.com",
    phone: "+593-3-876-5432",
    address: "Calle Sucre 789 y Bolívar",
    city: "Ambato",
    idNumber: "0387654321",
    customerType: "individual",
    totalPurchases: 890.25,
    lastPurchase: "2024-01-15",
    registrationDate: "2023-07-22",
    status: "active",
    notes: "Profesora, muy cuidadosa con el mantenimiento",
    preferredContact: "phone",
    vehicles: [
      {
        id: "v-ec-8",
        brand: "Kia",
        model: "Rio",
        year: 2019,
        plate: "QWE-6543",
        engine: "1.4L",
        mileage: 42000,
        lastService: "2024-01-09",
        nextService: "2024-05-09",
        oilType: "5W-30 Sintético",
        filterType: "Kia Original",
        color: "Blanco Perla",
      },
    ],
  },
  {
    id: "ec-8",
    name: "Transportes Manta Cía. Ltda.",
    email: "operaciones@tmanta.com.ec",
    phone: "+593-5-765-4321",
    address: "Av. Malecón 1234 y Manta",
    city: "Manta",
    idNumber: "0598765432001",
    customerType: "business",
    businessName: "Transportes Manta Cía. Ltda.",
    ruc: "0598765432001",
    totalPurchases: 7850.90,
    lastPurchase: "2024-01-18",
    registrationDate: "2022-05-10",
    status: "active",
    notes: "Empresa de transporte de carga pesada",
    preferredContact: "email",
    vehicles: [
      {
        id: "v-ec-9",
        brand: "Mercedes-Benz",
        model: "Actros",
        year: 2020,
        plate: "RTY-9876",
        engine: "12.0L Diesel",
        mileage: 145000,
        lastService: "2024-01-16",
        nextService: "2024-03-16",
        oilType: "10W-40 Diesel Premium",
        filterType: "Mercedes Original",
        color: "Azul Metálico",
      },
    ],
  },
];

// Ecuador-specific suppliers with real coordinates
export const ecuadorSuppliers: Supplier[] = [
  {
    id: "ec-sup-1",
    name: "Mobil Ecuador S.A.",
    contactPerson: "Carlos Mendoza Torres",
    email: "carlos.mendoza@mobil.com.ec",
    phone: "+593-2-234-5678",
    address: "Av. Amazonas 1234 y Naciones Unidas, Edificio Mobil",
    city: "Quito",
    country: "Ecuador",
    ruc: "1791234567001",
    paymentTerms: "30 días",
    status: "active",
    productsSupplied: ["Aceites Sintéticos", "Aceites Convencionales", "Lubricantes Premium"],
    totalOrders: 45,
    lastOrderDate: "2024-01-15",
    rating: 4.8,
    notes: "Proveedor principal de aceites premium, entrega inmediata en Quito",
  },
  {
    id: "ec-sup-2",
    name: "Castrol Distribuidora Ecuador",
    contactPerson: "María González Salazar",
    email: "maria.gonzalez@castrol.com.ec",
    phone: "+593-4-567-8901",
    address: "Km 8.5 Vía a Daule, Parque Industrial Castrol",
    city: "Guayaquil",
    country: "Ecuador",
    ruc: "0991234567001",
    paymentTerms: "45 días",
    status: "active",
    productsSupplied: ["Lubricantes", "Aceites Industriales", "Grasas"],
    totalOrders: 32,
    lastOrderDate: "2024-01-10",
    rating: 4.5,
    notes: "Excelente calidad en lubricantes, cobertura nacional",
  },
  {
    id: "ec-sup-3",
    name: "Toyota Parts Ecuador",
    contactPerson: "Luis Rodríguez Mendoza",
    email: "luis.rodriguez@toyota.com.ec",
    phone: "+593-2-345-6789",
    address: "Av. 6 de Diciembre 2456 y Colón, Centro Toyota",
    city: "Quito",
    country: "Ecuador",
    ruc: "1791234568001",
    paymentTerms: "60 días",
    status: "active",
    productsSupplied: ["Filtros", "Repuestos Originales", "Aceites Toyota"],
    totalOrders: 28,
    lastOrderDate: "2024-01-12",
    rating: 4.9,
    notes: "Repuestos originales Toyota, garantía extendida",
  },
  {
    id: "ec-sup-4",
    name: "Shell Ecuador S.A.",
    contactPerson: "Ana Morales Vélez",
    email: "ana.morales@shell.com.ec",
    phone: "+593-4-234-5678",
    address: "Av. Francisco de Orellana y Juan Tanca Marengo, Torre Shell",
    city: "Guayaquil",
    country: "Ecuador",
    ruc: "0991234568001",
    paymentTerms: "30 días",
    status: "active",
    productsSupplied: ["Aceites Shell", "Aditivos", "Combustibles"],
    totalOrders: 38,
    lastOrderDate: "2024-01-18",
    rating: 4.6,
    notes: "Amplia gama de productos Shell, innovación constante",
  },
  {
    id: "ec-sup-5",
    name: "Distribuidora Industrial Cuenca",
    contactPerson: "Roberto Silva González",
    email: "roberto.silva@dic.com.ec",
    phone: "+593-7-987-6543",
    address: "Av. España 1234 y Huayna Cápac, Bodega Industrial",
    city: "Cuenca",
    country: "Ecuador",
    ruc: "0198765432001",
    paymentTerms: "30 días",
    status: "active",
    productsSupplied: ["Lubricantes Industriales", "Aceites para Maquinaria", "Grasas"],
    totalOrders: 22,
    lastOrderDate: "2024-01-14",
    rating: 4.4,
    notes: "Especialistas en lubricantes industriales para el sector minero",
  },
  {
    id: "ec-sup-6",
    name: "Repuestos Automotrices Ambato",
    contactPerson: "Patricia Romero Vargas",
    email: "patricia.romero@raa.com.ec",
    phone: "+593-3-876-1234",
    address: "Av. Cevallos 567 y Montalvo, Centro Automotriz",
    city: "Ambato",
    country: "Ecuador",
    ruc: "0398765432001",
    paymentTerms: "45 días",
    status: "active",
    productsSupplied: ["Filtros", "Aceites", "Repuestos Multimarca"],
    totalOrders: 18,
    lastOrderDate: "2024-01-16",
    rating: 4.3,
    notes: "Cobertura regional, buenos precios y variedad",
  },
  {
    id: "ec-sup-7",
    name: "Lubricantes del Pacífico",
    contactPerson: "Jorge Paredes Castro",
    email: "jorge.paredes@lubripacifico.com.ec",
    phone: "+593-5-765-4321",
    address: "Av. Malecón 567 y Manta, Zona Franca",
    city: "Manta",
    country: "Ecuador",
    ruc: "0598765432001",
    paymentTerms: "60 días",
    status: "active",
    productsSupplied: ["Aceites Marinos", "Lubricantes Industriales", "Grasas"],
    totalOrders: 15,
    lastOrderDate: "2024-01-13",
    rating: 4.5,
    notes: "Especialistas en lubricantes para la industria pesquera y portuaria",
  },
  {
    id: "ec-sup-8",
    name: "Repuestos y Lubricantes Riobamba",
    contactPerson: "Diana Castillo Mendoza",
    email: "diana.castillo@rlr.com.ec",
    phone: "+593-3-987-4321",
    address: "Av. Daniel León Borja 890 y Veloz",
    city: "Riobamba",
    country: "Ecuador",
    ruc: "0398765438001",
    paymentTerms: "30 días",
    status: "active",
    productsSupplied: ["Aceites", "Filtros", "Repuestos", "Baterías"],
    totalOrders: 12,
    lastOrderDate: "2024-01-17",
    rating: 4.2,
    notes: "Servicio regional en la Sierra Centro del país",
  },
];

// Function to get coordinates for a city
export function getCityCoordinates(city: string) {
  // Handle city names that might have spaces or special characters
  const cityKey = city as keyof typeof ECUADOR_CITIES;
  return ECUADOR_CITIES[cityKey] || { lat: -0.1807, lng: -78.4678 }; // Default to Quito
}

// Enhanced function to get detailed city information
export function getCityCoordinatesEnhanced(city: string) {
  const cityKey = city as keyof typeof ECUADOR_CITIES_ENHANCED;
  return ECUADOR_CITIES_ENHANCED[cityKey] || { 
    lat: -0.1807, 
    lng: -78.4678, 
    region: 'Sierra', 
    population: 1731000 
  }; // Default to Quito
}

// Function to get all cities by region
export function getCitiesByRegion(region: string) {
  return Object.entries(ECUADOR_CITIES_ENHANCED)
    .filter(([_, data]) => data.region === region)
    .map(([city, data]) => ({ city, ...data }));
}

// Function to get nearby cities within a radius
export function getNearbyCities(city: string, radiusKm: number = 50) {
  const targetCity = getCityCoordinatesEnhanced(city);
  const nearbyCities = [];
  
  for (const [cityName, cityData] of Object.entries(ECUADOR_CITIES_ENHANCED)) {
    if (cityName !== city) {
      const distance = Math.sqrt(
        Math.pow(cityData.lat - targetCity.lat, 2) + 
        Math.pow(cityData.lng - targetCity.lng, 2)
      ) * 111; // Convert degrees to km
      
      if (distance <= radiusKm) {
        nearbyCities.push({
          city: cityName,
          distance: Math.round(distance),
          ...cityData
        });
      }
    }
  }
  
  return nearbyCities.sort((a, b) => a.distance - b.distance);
}

// Function to generate warehouse locations
export function generateWarehouseLocations(city: string) {
  const cityCenter = getCityCoordinatesEnhanced(city);
  const warehouses = [];
  
  // Generate 2-3 warehouse locations per city
  const warehouseCount = Math.floor(Math.random() * 2) + 2;
  
  for (let i = 0; i < warehouseCount; i++) {
    const offsetLat = (Math.random() - 0.5) * 0.02; // ~2km radius
    const offsetLng = (Math.random() - 0.5) * 0.02;
    
    warehouses.push({
      name: `Depósito ${city} ${i + 1}`,
      coordinates: {
        lat: cityCenter.lat + offsetLat,
        lng: cityCenter.lng + offsetLng
      },
      address: `Zona Industrial ${city}, Parque ${i + 1}`,
      capacity: Math.floor(Math.random() * 5000) + 1000, // 1000-6000 units
      city: city,
      region: cityCenter.region
    });
  }
  
  return warehouses;
}

// Function to create geographic clusters of customers/suppliers
export function createGeographicCluster(centerCity: string, clusterSize: number = 5) {
  const center = getCityCoordinatesEnhanced(centerCity);
  const cluster = [];
  
  // Get nearby cities first
  const nearbyCities = getNearbyCities(centerCity, 100);
  const availableCities = [centerCity, ...nearbyCities.map(c => c.city)];
  
  for (let i = 0; i < clusterSize; i++) {
    const randomCity = availableCities[Math.floor(Math.random() * availableCities.length)];
    const cityData = getCityCoordinatesEnhanced(randomCity);
    
    // Add some randomness to coordinates within 5km of city center
    const randomLat = cityData.lat + (Math.random() - 0.5) * 0.05;
    const randomLng = cityData.lng + (Math.random() - 0.5) * 0.05;
    
    cluster.push({
      coordinates: { lat: randomLat, lng: randomLng },
      city: randomCity,
      region: cityData.region,
      distanceFromCenter: randomCity === centerCity ? 0 : 
        nearbyCities.find(c => c.city === randomCity)?.distance || 0
    });
  }
  
  return cluster;
}

// Sample data with coordinates for testing
export const sampleEcuadorCoordinates = {
  customers: [
    { id: "sample-1", name: "Cliente Quito Norte", lat: -0.1500, lng: -78.4800, city: "Quito", type: "business" },
    { id: "sample-2", name: "Cliente Quito Sur", lat: -0.2100, lng: -78.4500, city: "Quito", type: "individual" },
    { id: "sample-3", name: "Cliente Guayaquil Centro", lat: -2.1800, lng: -79.8800, city: "Guayaquil", type: "business" },
    { id: "sample-4", name: "Cliente Cuenca Este", lat: -2.8800, lng: -78.9800, city: "Cuenca", type: "individual" },
    { id: "sample-5", name: "Cliente Manta Puerto", lat: -0.9500, lng: -80.7000, city: "Manta", type: "business" },
  ],
  suppliers: [
    { id: "sample-sup-1", name: "Proveedor Quito Industrial", lat: -0.1700, lng: -78.4600, city: "Quito", type: "industrial" },
    { id: "sample-sup-2", name: "Proveedor Guayaquil Puerto", lat: -2.2000, lng: -79.8600, city: "Guayaquil", type: "importador" },
    { id: "sample-sup-3", name: "Proveedor Cuenca Técnico", lat: -2.9200, lng: -79.0200, city: "Cuenca", type: "especializado" },
  ],
  warehouses: [
    { id: "wh-1", name: "Depósito Principal Quito", lat: -0.1800, lng: -78.4700, city: "Quito", capacity: 10000 },
    { id: "wh-2", name: "Depósito Costa Guayaquil", lat: -2.1900, lng: -79.8900, city: "Guayaquil", capacity: 15000 },
    { id: "wh-3", name: "Depósito Sierra Cuenca", lat: -2.9000, lng: -79.0000, city: "Cuenca", capacity: 8000 },
    { id: "wh-4", name: "Depósito Costa Manta", lat: -0.9670, lng: -80.7080, city: "Manta", capacity: 5000 },
  ]
};

// Function to get regional statistics
export function getRegionalStatistics() {
  const regions: Record<string, {
    cities: string[];
    totalPopulation: number;
    coordinates: { lat: number; lng: number };
    cityCount: number;
  }> = {};
  
  for (const [city, data] of Object.entries(ECUADOR_CITIES_ENHANCED)) {
    if (!regions[data.region]) {
      regions[data.region] = {
        cities: [],
        totalPopulation: 0,
        coordinates: { lat: 0, lng: 0 },
        cityCount: 0
      };
    }
    
    regions[data.region].cities.push(city);
    regions[data.region].totalPopulation += data.population;
    regions[data.region].coordinates.lat += data.lat;
    regions[data.region].coordinates.lng += data.lng;
    regions[data.region].cityCount += 1;
  }
  
  // Calculate average coordinates for each region
  for (const region of Object.keys(regions)) {
    regions[region].coordinates.lat /= regions[region].cityCount;
    regions[region].coordinates.lng /= regions[region].cityCount;
  }
  
  return regions;
}

// Function to generate random coordinates around a city center
export function generateCoordinatesNearCity(city: string, radiusKm: number = 5) {
  const cityCenter = getCityCoordinates(city);
  
  // Convert km to degrees (approximate)
  const radiusDeg = radiusKm / 111;
  
  // Generate random offset within radius
  const randomLat = cityCenter.lat + (Math.random() - 0.5) * 2 * radiusDeg;
  const randomLng = cityCenter.lng + (Math.random() - 0.5) * 2 * radiusDeg;
  
  return {
    lat: randomLat,
    lng: randomLng
  };
}

// Enhanced Ecuador cities with more detailed coordinates
export const ECUADOR_CITIES_ENHANCED = {
  // Costa (Coast)
  'Guayaquil': { lat: -2.1894, lng: -79.8891, region: 'Costa', population: 2698000 },
  'Manta': { lat: -0.9677, lng: -80.7087, region: 'Costa', population: 183000 },
  'Portoviejo': { lat: -1.0546, lng: -80.4545, region: 'Costa', population: 179000 },
  'Machala': { lat: -3.2581, lng: -79.9554, region: 'Costa', population: 158000 },
  'Esmeraldas': { lat: 0.9675, lng: -79.6500, region: 'Costa', population: 131000 },
  'Quevedo': { lat: -1.0222, lng: -79.4600, region: 'Costa', population: 123000 },
  'Santo Domingo': { lat: -0.2525, lng: -79.1754, region: 'Costa', population: 270000 },
  'Babahoyo': { lat: -1.8000, lng: -79.5333, region: 'Costa', population: 91000 },
  'La Libertad': { lat: -2.2167, lng: -80.9167, region: 'Costa', population: 67000 },
  'Santa Elena': { lat: -2.2264, lng: -80.8585, region: 'Costa', population: 111000 },
  
  // Sierra (Highlands)
  'Quito': { lat: -0.1807, lng: -78.4678, region: 'Sierra', population: 1731000 },
  'Cuenca': { lat: -2.9000, lng: -79.0000, region: 'Sierra', population: 331000 },
  'Ambato': { lat: -1.2417, lng: -78.6197, region: 'Sierra', population: 178000 },
  'Riobamba': { lat: -1.6710, lng: -78.6474, region: 'Sierra', population: 124000 },
  'Loja': { lat: -3.9931, lng: -79.2042, region: 'Sierra', population: 118000 },
  'Ibarra': { lat: 0.3420, lng: -78.1220, region: 'Sierra', population: 139000 },
  'Latacunga': { lat: -0.9333, lng: -78.6167, region: 'Sierra', population: 63000 },
  'Tulcán': { lat: 0.8114, lng: -77.7133, region: 'Sierra', population: 53000 },
  'Azogues': { lat: -2.7375, lng: -78.8406, region: 'Sierra', population: 48000 },
  
  // Oriente (Amazon)
  'Tena': { lat: -0.9931, lng: -77.8097, region: 'Oriente', population: 34000 },
  'Puyo': { lat: -1.4858, lng: -77.9972, region: 'Oriente', population: 33000 },
  'Coca': { lat: -0.4586, lng: -76.9875, region: 'Oriente', population: 79000 },
  'Macas': { lat: -2.3094, lng: -78.1156, region: 'Oriente', population: 23000 },
  'Zamora': { lat: -4.0667, lng: -78.9500, region: 'Oriente', population: 15000 },
  
  // Galápagos
  'Puerto Baquerizo Moreno': { lat: -0.9045, lng: -89.6109, region: 'Galápagos', population: 7000 },
  'Puerto Ayora': { lat: -0.7444, lng: -90.3153, region: 'Galápagos', population: 12000 },
};

// Additional Ecuador customers with precise coordinates
export const ecuadorCustomersEnhanced = [
  {
    id: "ec-9",
    name: "Transportes Portoviejo S.A.",
    email: "info@transportesportoviejo.com.ec",
    phone: "+593-5-234-5678",
    address: "Av. Universitaria 1234 y Ayacucho, Parque Industrial",
    city: "Portoviejo",
    idNumber: "0592345678001",
    customerType: "business",
    businessName: "Transportes Portoviejo S.A.",
    ruc: "0592345678001",
    totalPurchases: 15420.50,
    lastPurchase: "2024-01-20",
    registrationDate: "2020-03-15",
    status: "active",
    notes: "Empresa de transporte interprovincial de carga",
    preferredContact: "email",
    vehicles: [
      {
        id: "v-ec-10",
        brand: "Hino",
        model: "500",
        year: 2021,
        plate: "PVO-1234",
        engine: "8.0L Diesel",
        mileage: 95000,
        lastService: "2024-01-19",
        nextService: "2024-03-19",
        oilType: "15W-40 Diesel Heavy Duty",
        filterType: "Hino Original",
        color: "Blanco",
      },
      {
        id: "v-ec-11",
        brand: "Isuzu",
        model: "NPR",
        year: 2020,
        plate: "PVO-5678",
        engine: "5.2L Diesel",
        mileage: 120000,
        lastService: "2024-01-10",
        nextService: "2024-04-10",
        oilType: "10W-40 Diesel Premium",
        filterType: "Isuzu Original",
        color: "Azul",
      },
    ],
  },
  {
    id: "ec-10",
    name: "Juan Carlos Pérez Salazar",
    email: "juan.perez@email.com",
    phone: "+593-3-765-4321",
    address: "Calle 5 de Junio 456 y 9 de Octubre",
    city: "Machala",
    idNumber: "0398765432",
    customerType: "individual",
    totalPurchases: 2340.75,
    lastPurchase: "2024-01-22",
    registrationDate: "2022-11-08",
    status: "active",
    notes: "Agricultor de banano, requiere mantenimiento frecuente",
    preferredContact: "phone",
    vehicles: [
      {
        id: "v-ec-12",
        brand: "Toyota",
        model: "Hilux",
        year: 2018,
        plate: "MCH-9876",
        engine: "2.8L Diesel",
        mileage: 135000,
        lastService: "2024-01-21",
        nextService: "2024-04-21",
        oilType: "5W-30 Diesel Sintético",
        filterType: "Toyota Original",
        color: "Gris Metálico",
      },
      {
        id: "v-ec-13",
        brand: "Chevrolet",
        model: "D-Max",
        year: 2016,
        plate: "MCH-5432",
        engine: "3.0L Diesel",
        mileage: 180000,
        lastService: "2024-01-05",
        nextService: "2024-02-05",
        oilType: "15W-40 Diesel Heavy Duty",
        filterType: "Chevrolet Original",
        color: "Rojo",
      },
    ],
  },
  {
    id: "ec-11",
    name: "Flota Bananera Esmeraldas Cía. Ltda.",
    email: "admin@flotaesmeraldas.com.ec",
    phone: "+593-6-987-6543",
    address: "Av. Carlos Concha Torres 789 y Malecón",
    city: "Esmeraldas",
    idNumber: "0698765432001",
    customerType: "business",
    businessName: "Flota Bananera Esmeraldas Cía. Ltda.",
    ruc: "0698765432001",
    totalPurchases: 28950.25,
    lastPurchase: "2024-01-23",
    registrationDate: "2019-07-30",
    status: "active",
    notes: "Empresa exportadora de banano con flota pesada",
    preferredContact: "email",
    vehicles: [
      {
        id: "v-ec-14",
        brand: "Freightliner",
        model: "Cascadia",
        year: 2019,
        plate: "ESM-2468",
        engine: "15.0L Diesel",
        mileage: 165000,
        lastService: "2024-01-20",
        nextService: "2024-03-20",
        oilType: "15W-40 Diesel Heavy Duty",
        filterType: "Freightliner Original",
        color: "Verde",
      },
      {
        id: "v-ec-15",
        brand: "Kenworth",
        model: "T680",
        year: 2020,
        plate: "ESM-1357",
        engine: "12.9L Diesel",
        mileage: 140000,
        lastService: "2024-01-15",
        nextService: "2024-02-15",
        oilType: "10W-40 Diesel Premium",
        filterType: "Kenworth Original",
        color: "Blanco",
      },
    ],
  },
  {
    id: "ec-12",
    name: "María Isabel Rodríguez Castillo",
    email: "maria.rodriguez@email.com",
    phone: "+593-2-876-5432",
    address: "Calle Bolívar 234 y Sucre, Barrio Centro",
    city: "Ibarra",
    idNumber: "0298765432",
    customerType: "individual",
    totalPurchases: 1450.50,
    lastPurchase: "2024-01-19",
    registrationDate: "2023-09-12",
    status: "active",
    notes: "Comerciante, muy organizada con mantenimientos",
    preferredContact: "phone",
    vehicles: [
      {
        id: "v-ec-16",
        brand: "Hyundai",
        model: "Accent",
        year: 2020,
        plate: "IBR-9876",
        engine: "1.6L",
        mileage: 48000,
        lastService: "2024-01-18",
        nextService: "2024-05-18",
        oilType: "5W-20 Sintético",
        filterType: "Hyundai Original",
        color: "Azul Marino",
      },
    ],
  },
];

// Additional Ecuador suppliers with precise coordinates
export const ecuadorSuppliersEnhanced = [
  {
    id: "ec-sup-9",
    name: "Lubricantes Industriales Loja S.A.",
    contactPerson: "Fernando Zambrano Vargas",
    email: "fernando.zambrano@liloja.com.ec",
    phone: "+593-7-234-5678",
    address: "Av. Universitaria 1234 y Pío Jaramillo, Parque Industrial",
    city: "Loja",
    country: "Ecuador",
    ruc: "0192345678001",
    paymentTerms: "30 días",
    status: "active",
    productsSupplied: ["Aceites Industriales", "Lubricantes para Maquinaria", "Grasas Especiales"],
    totalOrders: 25,
    lastOrderDate: "2024-01-21",
    rating: 4.7,
    notes: "Especialistas en lubricantes para la industria azucarera y agroindustrial",
  },
  {
    id: "ec-sup-10",
    name: "Repuestos Automotrices Santo Domingo",
    contactPerson: "Carmen Paredes Mendoza",
    email: "carmen.paredes@rasd.com.ec",
    phone: "+593-2-876-5432",
    address: "Av. Quito 567 y General Enríquez, Centro Comercial",
    city: "Santo Domingo",
    country: "Ecuador",
    ruc: "1798765432001",
    paymentTerms: "45 días",
    status: "active",
    productsSupplied: ["Filtros", "Aceites", "Baterías", "Repuestos Multimarca"],
    totalOrders: 20,
    lastOrderDate: "2024-01-19",
    rating: 4.4,
    notes: "Cobertura regional en la provincia de Santo Domingo de los Tsáchilas",
  },
  {
    id: "ec-sup-11",
    name: "Distribuidora de Lubricantes Tena",
    contactPerson: "Luis Alberto Guamán Castro",
    email: "luis.guaman@dltena.com.ec",
    phone: "+593-6-987-1234",
    address: "Av. Amazonas 890 y 15 de Noviembre, Bodega Comercial",
    city: "Tena",
    country: "Ecuador",
    ruc: "0698765432001",
    paymentTerms: "30 días",
    status: "active",
    productsSupplied: ["Aceites para Motores de Selva", "Lubricantes Ambientales", "Grasas Biodegradables"],
    totalOrders: 15,
    lastOrderDate: "2024-01-22",
    rating: 4.6,
    notes: "Especialistas en lubricantes para condiciones de selva húmeda",
  },
  {
    id: "ec-sup-12",
    name: "Lubricantes del Oriente Puyo",
    contactPerson: "Rosa María Valdivieso Vargas",
    email: "rosa.valdivieso@lubrioriente.com.ec",
    phone: "+593-3-765-4321",
    address: "Av. 16 de Abril 1234 y Pastaza, Zona Industrial",
    city: "Puyo",
    country: "Ecuador",
    ruc: "0397654321001",
    paymentTerms: "60 días",
    status: "active",
    productsSupplied: ["Aceites para Maquinaria de Exploración", "Lubricantes para Clima Tropical", "Grasas de Alta Temperatura"],
    totalOrders: 12,
    lastOrderDate: "2024-01-20",
    rating: 4.5,
    notes: "Proveedor especializado para la industria petrolera y de exploración",
  },
];