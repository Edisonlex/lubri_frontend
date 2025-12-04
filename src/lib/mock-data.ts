// src/lib/mock-data.ts
export interface StockAlert {
  id: string;
  productName: string;
  currentStock: number;
  minStock: number;
  category: string;
  urgency: "critical" | "high" | "medium" | "low";
  supplier: string;
  sku: string;
  lastUpdated: string;
  trend: "improving" | "stable" | "worsening";
  price: number;
  unit: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  ruc: string;
  paymentTerms: string;
  status: "active" | "inactive";
  productsSupplied: string[];
  totalOrders: number;
  lastOrderDate: string;
  rating: number;
  notes: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  idNumber: string;
  customerType: "individual" | "business";
  businessName?: string;
  ruc?: string;
  totalPurchases: number;
  lastPurchase: string;
  registrationDate: string;
  status: "active" | "inactive";
  notes: string;
  preferredContact: "phone" | "email" | "whatsapp";
  vehicles: Vehicle[];
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  engine: string;
  mileage: number;
  lastService: string;
  nextService: string;
  oilType: string;
  filterType: string;
  color?: string;
}

export interface InventoryAnalytics {
  categoryDistribution: { name: string; value: number }[];
  stockLevels: { name: string; value: number }[];
  topSellingProducts: { name: string; value: number }[];
  lowStockProducts: { name: string; value: number }[];
  inventoryValue: { name: string; value: number }[];
}

export const stockAlerts: StockAlert[] = [
  {
    id: "1",
    productName: "Aceite Mobil 1 5W-30",
    currentStock: 3,
    minStock: 10,
    category: "Aceites Sintéticos",
    urgency: "critical",
    supplier: "Mobil Ecuador",
    sku: "MOB-5W30-001",
    lastUpdated: "2024-01-20",
    trend: "worsening",
    price: 45.5,
    unit: "unidad",
  },
  {
    id: "2",
    productName: "Filtro Aire Toyota Corolla",
    currentStock: 5,
    minStock: 15,
    category: "Filtros",
    urgency: "high",
    supplier: "Toyota Parts",
    sku: "TOY-AIR-001",
    lastUpdated: "2024-01-19",
    trend: "stable",
    price: 28.75,
    unit: "unidad",
  },
  {
    id: "3",
    productName: "Lubricante Castrol GTX",
    currentStock: 8,
    minStock: 20,
    category: "Lubricantes",
    urgency: "medium",
    supplier: "Castrol Ecuador",
    sku: "CAS-GTX-001",
    lastUpdated: "2024-01-18",
    trend: "improving",
    price: 52.25,
    unit: "unidad",
  },
  {
    id: "4",
    productName: "Aditivo Limpiador STP",
    currentStock: 0,
    minStock: 25,
    category: "Aditivos",
    urgency: "critical",
    supplier: "Químicos del Sur",
    sku: "STP-LIM-001",
    lastUpdated: "2024-01-21",
    trend: "worsening",
    price: 18.5,
    unit: "unidad",
  },
  {
    id: "5",
    productName: "Filtro de Aceite Mann",
    currentStock: 12,
    minStock: 20,
    category: "Filtros",
    urgency: "high",
    supplier: "Mann Ecuador",
    sku: "MAN-FIL-002",
    lastUpdated: "2024-01-17",
    trend: "stable",
    price: 22.0,
    unit: "unidad",
  },
  {
    id: "6",
    productName: "Aceite Shell Helix",
    currentStock: 16,
    minStock: 15,
    category: "Aceites",
    urgency: "low",
    supplier: "Shell Ecuador",
    sku: "SHL-HLX-001",
    lastUpdated: "2024-01-16",
    trend: "stable",
    price: 42.0,
    unit: "unidad",
  },
  {
    id: "7",
    productName: "Refrigerante Prestone",
    currentStock: 9,
    minStock: 18,
    category: "Refrigerantes",
    urgency: "medium",
    supplier: "Prestone Ecuador",
    sku: "PRE-REF-001",
    lastUpdated: "2024-01-15",
    trend: "worsening",
    price: 19.9,
    unit: "unidad",
  },
  {
    id: "8",
    productName: "Filtro de Aire Mann C27005",
    currentStock: 22,
    minStock: 15,
    category: "Filtros",
    urgency: "low",
    supplier: "Mann Ecuador",
    sku: "MAN-AIR-27005",
    lastUpdated: "2024-02-03",
    trend: "stable",
    price: 29.5,
    unit: "unidad",
  },
  {
    id: "9",
    productName: "Aceite Valvoline MaxLife 10W-40",
    currentStock: 12,
    minStock: 20,
    category: "Aceites",
    urgency: "medium",
    supplier: "Distribuidora Central",
    sku: "VAL-ML-1040",
    lastUpdated: "2024-02-05",
    trend: "worsening",
    price: 36.9,
    unit: "unidad",
  },
  {
    id: "10",
    productName: "Aditivo Liqui Moly Limpiador",
    currentStock: 40,
    minStock: 25,
    category: "Aditivos",
    urgency: "low",
    supplier: "Químicos del Sur",
    sku: "LM-INJ-001",
    lastUpdated: "2024-02-08",
    trend: "improving",
    price: 24.75,
    unit: "unidad",
  },
  {
    id: "11",
    productName: "Filtro Aceite Bosch 0986AF022",
    currentStock: 12,
    minStock: 20,
    category: "Filtros",
    urgency: "high",
    supplier: "Bosch Repuestos",
    sku: "BOS-FIL-022",
    lastUpdated: "2024-02-10",
    trend: "worsening",
    price: 23.9,
    unit: "unidad",
  },
  {
    id: "12",
    productName: "Castrol EDGE 0W-20",
    currentStock: 6,
    minStock: 15,
    category: "Lubricantes",
    urgency: "high",
    supplier: "Castrol Ecuador",
    sku: "CAS-EDGE-020",
    lastUpdated: "2024-02-18",
    trend: "worsening",
    price: 58.9,
    unit: "unidad",
  },
];

export const mockSuppliers: Supplier[] = [
  {
    id: "1",
    name: "Mobil Ecuador S.A.",
    contactPerson: "Carlos Mendoza",
    email: "carlos.mendoza@mobil.com.ec",
    phone: "+593-2-234-5678",
    address: "Av. Amazonas 1234",
    city: "Quito",
    country: "Ecuador",
    ruc: "1791234567001",
    paymentTerms: "30 días",
    status: "active",
    productsSupplied: ["Aceites Sintéticos", "Aceites Convencionales"],
    totalOrders: 45,
    lastOrderDate: "2024-01-15",
    rating: 4.8,
    notes: "Proveedor principal de aceites premium",
  },
  {
    id: "2",
    name: "Castrol Distribuidora",
    contactPerson: "María González",
    email: "maria.gonzalez@castrol.com.ec",
    phone: "+593-4-567-8901",
    address: "Km 8.5 Vía a Daule",
    city: "Guayaquil",
    country: "Ecuador",
    ruc: "0991234567001",
    paymentTerms: "45 días",
    status: "active",
    productsSupplied: ["Lubricantes", "Aceites Industriales"],
    totalOrders: 32,
    lastOrderDate: "2024-01-10",
    rating: 4.5,
    notes: "Excelente calidad en lubricantes",
  },
  {
    id: "3",
    name: "Toyota Parts Ecuador",
    contactPerson: "Luis Rodríguez",
    email: "luis.rodriguez@toyota.com.ec",
    phone: "+593-2-345-6789",
    address: "Av. 6 de Diciembre 2456",
    city: "Quito",
    country: "Ecuador",
    ruc: "1791234568001",
    paymentTerms: "60 días",
    status: "active",
    productsSupplied: ["Filtros", "Repuestos Originales"],
    totalOrders: 28,
    lastOrderDate: "2024-01-12",
    rating: 4.9,
    notes: "Repuestos originales Toyota",
  },
  {
    id: "4",
    name: "Shell Ecuador",
    contactPerson: "Ana Morales",
    email: "ana.morales@shell.com.ec",
    phone: "+593-4-234-5678",
    address: "Av. Francisco de Orellana",
    city: "Guayaquil",
    country: "Ecuador",
    ruc: "0991234568001",
    paymentTerms: "30 días",
    status: "active",
    productsSupplied: ["Aceites Shell", "Aditivos"],
    totalOrders: 38,
    lastOrderDate: "2024-01-18",
    rating: 4.6,
    notes: "Amplia gama de productos Shell",
  },
  {
    id: "5",
    name: "Bosch Repuestos",
    contactPerson: "Diego Herrera",
    email: "diego.herrera@bosch.com.ec",
    phone: "+593-2-456-7890",
    address: "Av. República E2-123",
    city: "Quito",
    country: "Ecuador",
    ruc: "1791122233001",
    paymentTerms: "30 días",
    status: "active",
    productsSupplied: ["Filtros", "Repuestos eléctricos"],
    totalOrders: 18,
    lastOrderDate: "2024-02-10",
    rating: 4.4,
    notes: "Entrega rápida",
  },
  {
    id: "6",
    name: "Liqui Moly Ecuador",
    contactPerson: "Sofía Rivas",
    email: "sofia.rivas@liquimoly.com.ec",
    phone: "+593-4-678-9012",
    address: "Av. Las Monjas 234",
    city: "Guayaquil",
    country: "Ecuador",
    ruc: "0991099887001",
    paymentTerms: "45 días",
    status: "active",
    productsSupplied: ["Aditivos", "Lubricantes"],
    totalOrders: 22,
    lastOrderDate: "2024-02-08",
    rating: 4.7,
    notes: "Amplio catálogo de aditivos",
  },
];

export const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "Juan Pérez",
    email: "juan.perez@email.com",
    phone: "+593-99-123-4567",
    address: "Av. Patria 1234",
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
        id: "v1",
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
    id: "2",
    name: "Transportes Rápidos S.A.",
    email: "info@transportesrapidos.com",
    phone: "+593-2-234-5678",
    address: "Av. Simón Bolívar 567",
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
        id: "v2",
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
        id: "v3",
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
    id: "3",
    name: "María Rodríguez",
    email: "maria.rodriguez@email.com",
    phone: "+593-98-765-4321",
    address: "Av. América 890",
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
        id: "v4",
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
    id: "4",
    name: "Taxi Express Cía. Ltda.",
    email: "gerencia@taxiexpress.com",
    phone: "+593-4-345-6789",
    address: "Av. 9 de Octubre 1122",
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
        id: "v5",
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
    id: "5",
    name: "Automotriz Rodríguez C.A.",
    email: "ventas@auto-rodriguez.com",
    phone: "+593-7-321-4567",
    address: "Av. España 567",
    city: "Cuenca",
    idNumber: "0191234567001",
    customerType: "business",
    businessName: "Automotriz Rodríguez C.A.",
    ruc: "0191234567001",
    totalPurchases: 3120.0,
    lastPurchase: "2024-02-12",
    registrationDate: "2021-05-03",
    status: "active",
    notes: "Compra al por mayor de filtros y aceites",
    preferredContact: "email",
    vehicles: [
      { id: "v6", brand: "Toyota", model: "Hilux", year: 2019, plate: "CUC-1122", engine: "2.8L Diesel", mileage: 98000, lastService: "2024-02-01", nextService: "2024-05-01", oilType: "15W-40 Diesel", filterType: "Toyota Original", color: "Negro" },
    ],
  },
  {
    id: "6",
    name: "Marcos Estévez",
    email: "marcos.estevez@email.com",
    phone: "+593-99-555-1212",
    address: "Av. Del Maestro 12",
    city: "Quito",
    idNumber: "1712341212",
    customerType: "individual",
    totalPurchases: 420.2,
    lastPurchase: "2024-02-10",
    registrationDate: "2023-02-11",
    status: "active",
    notes: "Compra cada 3 meses",
    preferredContact: "whatsapp",
    vehicles: [
      { id: "v7", brand: "Kia", model: "Rio", year: 2017, plate: "PKO-7890", engine: "1.4L", mileage: 82000, lastService: "2024-01-20", nextService: "2024-04-20", oilType: "5W-30 Semi-sintético", filterType: "Kia Original", color: "Rojo" },
    ],
  },
];

export const inventoryAnalyticsData: InventoryAnalytics = {
  categoryDistribution: [
    { name: "Aceites Sintéticos", value: 35 },
    { name: "Aceites Convencionales", value: 28 },
    { name: "Filtros", value: 22 },
    { name: "Lubricantes", value: 18 },
    { name: "Aditivos", value: 12 },
  ],
  stockLevels: [
    { name: "Sin Stock", value: 5 },
    { name: "Stock Bajo", value: 15 },
    { name: "Stock Normal", value: 45 },
    { name: "Stock Alto", value: 35 },
  ],
  topSellingProducts: [
    { name: "Aceite Mobil 1 5W-30", value: 120 },
    { name: "Filtro Aire Toyota", value: 95 },
    { name: "Castrol GTX 20W-50", value: 85 },
    { name: "Shell Helix Ultra", value: 75 },
    { name: "Valvoline MaxLife", value: 65 },
  ],
  lowStockProducts: [
    { name: "Aceite Mobil 1 5W-30", value: 3 },
    { name: "Filtro Aire Toyota", value: 5 },
    { name: "Aditivo STP", value: 2 },
    { name: "Lubricante Castrol", value: 8 },
    { name: "Shell V-Power", value: 4 },
  ],
  inventoryValue: [
    { name: "Aceites Sintéticos", value: 15750 },
    { name: "Aceites Convencionales", value: 8500 },
    { name: "Filtros", value: 4200 },
    { name: "Lubricantes", value: 6800 },
    { name: "Aditivos", value: 2100 },
  ],
};
