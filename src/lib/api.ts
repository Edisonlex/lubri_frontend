// src/lib/api.ts - ARCHIVO COMPLETO UNIFICADO

// ===== INTERFACES UNIFICADAS =====
export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  maxStock: number;
  sku: string;
  barcode?: string;
  supplier: string;
  location: string;
  lastUpdated: string;
  status: "active" | "inactive" | "discontinued";
  rotationRate?: number;
  profitMargin?: number;
  imageUrl?: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: "entrada" | "salida" | "ajuste";
  quantity: number;
  date: string;
  reason: string;
  userId: string;
  documentRef?: string;
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
  vehicles: Vehicle[];
  totalPurchases: number;
  lastPurchase: string;
  registrationDate: string;
  status: "active" | "inactive";
  notes: string;
  preferredContact: "phone" | "email" | "whatsapp";
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
  customerId?: string;
}

export interface Sale {
  id: string;
  date: string;
  customerId: string | null;
  customerName: string | null;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod:
    | "efectivo"
    | "tarjeta"
    | "transferencia"
    | "crédito"
    | "cheque";
  status: "completada" | "anulada" | "pendiente";
  userId: string;
  invoiceNumber: string;
  notes?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  category?: string;
  status: "active" | "inactive";
  notes?: string;
  city?: string;
  country?: string;
  ruc?: string;
  paymentTerms?: string;
  productsSupplied?: string[];
  totalOrders?: number;
  lastOrderDate?: string;
  rating?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "cashier" | "manager";
  status: "active" | "inactive";
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  expiresIn: number;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

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

export interface InventoryAnalytics {
  categoryDistribution: { name: string; value: number }[];
  stockLevels: { name: string; value: number }[];
  topSellingProducts: { name: string; value: number }[];
  lowStockProducts: { name: string; value: number }[];
  inventoryValue: { name: string; value: number }[];
}

// ===== INTERFACES DE CONFIGURACIÓN =====
export interface CompanySettings {
  name: string;
  ruc: string;
  address: string;
  phone: string;
  email: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  isMain: boolean;
  status: "active" | "inactive";
}

export interface SRISettings {
  environment: "test" | "production";
  emissionType: "normal" | "contingency";
  certificateFile: string;
  certificatePassword: string;
  isActive: boolean;
}

export interface BackupSettings {
  lastBackup: string;
  autoBackup: boolean;
  backupFrequency: "daily" | "weekly" | "monthly";
}

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  status: "success" | "error" | "warning";
  details: string;
}

// ===== DATOS MOCK UNIFICADOS =====
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Aceite Mobil 1 5W-30",
    brand: "Mobil",
    category: "aceites",
    price: 45.5,
    cost: 32.0,
    stock: 3,
    minStock: 10,
    maxStock: 50,
    sku: "MOB-5W30-001",
    barcode: "1234567890123",
    supplier: "Distribuidora Central",
    location: "A1-B2",
    lastUpdated: "2024-01-15",
    status: "active",
    rotationRate: 0.85,
    profitMargin: 0.42,
    imageUrl: "/mobil-1-high-mileage-full-synthetic.jpg",
  },
  {
    id: "2",
    name: "Filtro de Aceite Toyota",
    brand: "Toyota",
    category: "filtros",
    price: 25.0,
    cost: 18.0,
    stock: 15,
    minStock: 15,
    maxStock: 100,
    sku: "TOY-FIL-001",
    supplier: "Repuestos Toyota",
    location: "B2-C1",
    lastUpdated: "2024-01-14",
    status: "active",
    rotationRate: 0.75,
    profitMargin: 0.39,
    imageUrl: "/Filtro de Aceite Toyota.jpg",
  },
  {
    id: "3",
    name: "Lubricante Castrol GTX",
    brand: "Castrol",
    category: "lubricantes",
    price: 52.25,
    cost: 38.0,
    stock: 25,
    minStock: 20,
    maxStock: 80,
    sku: "CAS-GTX-001",
    supplier: "Castrol Ecuador",
    location: "C1-D2",
    lastUpdated: "2024-01-13",
    status: "active",
    rotationRate: 0.65,
    profitMargin: 0.37,
    imageUrl: "/Lubricante Castrol GTX.jpg",
  },
  {
    id: "4",
    name: "Aditivo Limpiador STP",
    brand: "STP",
    category: "aditivos",
    price: 18.5,
    cost: 12.0,
    stock: 0,
    minStock: 25,
    maxStock: 100,
    sku: "STP-LIM-001",
    supplier: "Químicos del Sur",
    location: "D2-E1",
    lastUpdated: "2024-01-12",
    status: "active",
    rotationRate: 0.45,
    profitMargin: 0.54,
    imageUrl: "/Aditivo Limpiador STP.jpg",
  },
  {
    id: "5",
    name: "Aceite Shell Helix",
    brand: "Shell",
    category: "aceites",
    price: 42.0,
    cost: 30.0,
    stock: 45,
    minStock: 15,
    maxStock: 60,
    sku: "SHL-HLX-001",
    supplier: "Shell Ecuador",
    location: "E1-F2",
    lastUpdated: "2024-01-11",
    status: "active",
    rotationRate: 0.72,
    profitMargin: 0.4,
    imageUrl: "/Aceite Shell Helix.jpg",
  },
  {
    id: "6",
    name: "Filtro de Cabina Bosch",
    brand: "Bosch",
    category: "filtros",
    price: 22.5,
    cost: 16.0,
    stock: 28,
    minStock: 12,
    maxStock: 70,
    sku: "BOS-CAB-001",
    supplier: "Distribuidora Central",
    location: "F2-G1",
    lastUpdated: "2024-01-10",
    status: "active",
    rotationRate: 0.68,
    profitMargin: 0.3,
    imageUrl: "/Filtro de Cabina Bosch.jpg",
  },
  {
    id: "7",
    name: "Grasa Multiuso Valvoline",
    brand: "Valvoline",
    category: "lubricantes",
    price: 15.9,
    cost: 9.8,
    stock: 60,
    minStock: 20,
    maxStock: 120,
    sku: "VAL-GRA-001",
    supplier: "Valvoline Ecuador",
    location: "G1-H2",
    lastUpdated: "2024-01-09",
    status: "active",
    rotationRate: 0.81,
    profitMargin: 0.38,
    imageUrl: "/Grasa Multiuso Valvoline.jpg",
  },
  {
    id: "8",
    name: "Aditivo Antihumo Wynn's",
    brand: "Wynn's",
    category: "aditivos",
    price: 13.2,
    cost: 8.9,
    stock: 18,
    minStock: 25,
    maxStock: 90,
    sku: "WYN-ANT-001",
    supplier: "Químicos del Sur",
    location: "H2-I1",
    lastUpdated: "2024-01-08",
    status: "active",
    rotationRate: 0.33,
    profitMargin: 0.32,
    imageUrl: "/Aditivo Antihumo Wynn's.jpg",
  },
  {
    id: "9",
    name: "Aceite Motul 8100 0W-20",
    brand: "Motul",
    category: "aceites",
    price: 49.0,
    cost: 35.0,
    stock: 22,
    minStock: 18,
    maxStock: 60,
    sku: "MOT-0W20-001",
    supplier: "Distribuidora Central",
    location: "I1-J1",
    lastUpdated: "2024-01-07",
    status: "active",
    rotationRate: 0.74,
    profitMargin: 0.4,
    imageUrl: "/Aceite Motul 8100 0W-20.jpg",
  },
  {
    id: "10",
    name: "Filtro de Combustible Fram",
    brand: "Fram",
    category: "filtros",
    price: 27.9,
    cost: 19.5,
    stock: 12,
    minStock: 15,
    maxStock: 80,
    sku: "FRM-COM-001",
    supplier: "Repuestos Toyota",
    location: "J1-K2",
    lastUpdated: "2024-01-06",
    status: "active",
    rotationRate: 0.52,
    profitMargin: 0.43,
    imageUrl: "/Filtro de Combustible Fram.jpg",
  },
  {
    id: "11",
    name: "Aceite Valvoline MaxLife 10W-40",
    brand: "Valvoline",
    category: "aceites",
    price: 39.9,
    cost: 28.0,
    stock: 34,
    minStock: 20,
    maxStock: 70,
    sku: "VAL-10W40-001",
    supplier: "Valvoline Ecuador",
    location: "K2-L1",
    lastUpdated: "2024-01-05",
    status: "active",
    rotationRate: 0.79,
    profitMargin: 0.42,
    imageUrl: "/Aceite Valvoline MaxLife 10W-40.jpg",
  },
  {
    id: "12",
    name: "Lubricante Shell Gadus",
    brand: "Shell",
    category: "lubricantes",
    price: 57.0,
    cost: 41.0,
    stock: 8,
    minStock: 10,
    maxStock: 50,
    sku: "SHL-GAD-001",
    supplier: "Shell Ecuador",
    location: "L1-M1",
    lastUpdated: "2024-01-04",
    status: "active",
    rotationRate: 0.28,
    profitMargin: 0.39,
    imageUrl: "/Lubricante Shell Gadus.jpg",
  },
  {
    id: "13",
    name: "Líquido de Frenos Dot 3",
    brand: "Vagner",
    category: "liquidos",
    price: 8.5,
    cost: 5.0,
    stock: 40,
    minStock: 10,
    maxStock: 50,
    sku: "VAG-DOT3-001",
    supplier: "Distribuidora Central",
    location: "M1-N1",
    lastUpdated: "2024-06-01",
    status: "active",
    rotationRate: 0.05,
    profitMargin: 0.41,
    imageUrl: "/liquido-frenos.jpg",
  },
  {
    id: "14",
    name: "Ambientador Pino",
    brand: "Little Trees",
    category: "accesorios",
    price: 2.5,
    cost: 1.0,
    stock: 100,
    minStock: 20,
    maxStock: 200,
    sku: "LIT-PIN-001",
    supplier: "Químicos del Sur",
    location: "Z1-Z2",
    lastUpdated: "2024-03-15",
    status: "active",
    rotationRate: 0.02,
    profitMargin: 0.6,
    imageUrl: "/ambientador.jpg",
  },
  {
    id: "15",
    name: "Cera Líquida Kit",
    brand: "Kit",
    category: "limpieza",
    price: 12.0,
    cost: 7.5,
    stock: 15,
    minStock: 5,
    maxStock: 30,
    sku: "KIT-WAX-001",
    supplier: "Químicos del Sur",
    location: "Y1-Y2",
    lastUpdated: "2024-05-20",
    status: "active",
    rotationRate: 0.08,
    profitMargin: 0.37,
    imageUrl: "/cera-kit.jpg",
  },
];

const mockStockMovements: StockMovement[] = [
  {
    id: "1",
    productId: "1",
    type: "entrada",
    quantity: 20,
    date: "2024-01-10",
    reason: "Compra a proveedor",
    userId: "1",
    documentRef: "FAC-001-002-003",
  },
  {
    id: "2",
    productId: "1",
    type: "salida",
    quantity: 5,
    date: "2024-01-12",
    reason: "Venta",
    userId: "2",
    documentRef: "VEN-001-002",
  },
  {
    id: "3",
    productId: "1",
    type: "ajuste",
    quantity: -2,
    date: "2024-01-14",
    reason: "Inventario físico",
    userId: "1",
  },
];

const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "Juan Pérez",
    email: "juan@example.com",
    phone: "555-1234",
    address: "Calle Principal 123",
    city: "Caracas",
    idNumber: "V-12345678",
    customerType: "individual",
    vehicles: [
      {
        id: "v1",
        plate: "ABC123",
        brand: "Toyota",
        model: "Corolla",
        year: 2018,
        engine: "1.8L",
        mileage: 45000,
        lastService: "2024-01-10",
        nextService: "2024-07-10",
        oilType: "5W-30",
        filterType: "OF-123",
        color: "Blanco",
      },
    ],
    totalPurchases: 1500,
    lastPurchase: "2024-01-15",
    registrationDate: "2023-05-10",
    status: "active",
    notes: "Cliente frecuente",
    preferredContact: "whatsapp",
  },
  {
    id: "2",
    name: "María González",
    email: "maria@example.com",
    phone: "555-5678",
    address: "Avenida Central 456",
    city: "Valencia",
    idNumber: "V-87654321",
    customerType: "individual",
    vehicles: [
      {
        id: "v2",
        plate: "XYZ789",
        brand: "Honda",
        model: "Civic",
        year: 2020,
        engine: "2.0L",
        mileage: 25000,
        lastService: "2024-01-05",
        nextService: "2024-07-05",
        oilType: "0W-20",
        filterType: "OF-456",
        color: "Gris",
      },
    ],
    totalPurchases: 850,
    lastPurchase: "2024-01-18",
    registrationDate: "2023-08-15",
    status: "active",
    notes: "",
    preferredContact: "email",
  },
  {
    id: "3",
    name: "Automotriz Rodríguez C.A.",
    email: "info@rodriguez.com",
    phone: "555-9012",
    address: "Zona Industrial, Galpón 7",
    city: "Maracaibo",
    idNumber: "J-123456789",
    customerType: "business",
    businessName: "Automotriz Rodríguez C.A.",
    ruc: "J-12345678-9",
    vehicles: [],
    totalPurchases: 5000,
    lastPurchase: "2024-01-12",
    registrationDate: "2023-01-20",
    status: "active",
    notes: "Empresa cliente mayorista",
    preferredContact: "phone",
  },
  {
    id: "4",
    name: "Taller Los Andes",
    email: "contacto@losandes.com",
    phone: "555-4321",
    address: "Av. América 456",
    city: "Quito",
    idNumber: "J-24681012",
    customerType: "business",
    businessName: "Taller Los Andes",
    ruc: "J-24681012-3",
    vehicles: [],
    totalPurchases: 3250,
    lastPurchase: "2025-01-21",
    registrationDate: "2023-03-12",
    status: "active",
    notes: "Compra aceites y filtros al por mayor",
    preferredContact: "email",
  },
  {
    id: "5",
    name: "Luis Herrera",
    email: "luis.herrera@example.com",
    phone: "555-7777",
    address: "Calle 10 #23-45",
    city: "Guayaquil",
    idNumber: "V-13579135",
    customerType: "individual",
    vehicles: [
      {
        id: "v5",
        plate: "PQR456",
        brand: "Chevrolet",
        model: "Onix",
        year: 2022,
        engine: "1.0L Turbo",
        mileage: 18000,
        lastService: "2024-12-01",
        nextService: "2025-06-01",
        oilType: "5W-30",
        filterType: "OF-789",
        color: "Azul",
      },
    ],
    totalPurchases: 420,
    lastPurchase: "2025-01-23",
    registrationDate: "2024-02-14",
    status: "active",
    notes: "Prefiere atención por WhatsApp",
    preferredContact: "whatsapp",
  },
];

const mockSales: Sale[] = [
  // Enero 2026 (Mes Actual)
  {
    id: "1",
    date: "2026-01-15T10:30:00Z",
    customerId: "1",
    customerName: "Juan Pérez",
    items: [
      {
        productId: "1",
        productName: "Aceite Mobil 1 5W-30",
        quantity: 2,
        unitPrice: 45.5,
        subtotal: 91.0,
      },
      {
        productId: "2",
        productName: "Filtro de Aceite Toyota",
        quantity: 1,
        unitPrice: 25.0,
        subtotal: 25.0,
      },
    ],
    subtotal: 116.0,
    tax: 18.56,
    total: 134.56,
    paymentMethod: "efectivo",
    status: "completada",
    userId: "1",
    invoiceNumber: "FAC-2026-001",
  },
  {
    id: "2",
    date: "2026-01-10T14:15:00Z",
    customerId: "2",
    customerName: "María González",
    items: [
      {
        productId: "3",
        productName: "Lubricante Castrol GTX",
        quantity: 1,
        unitPrice: 52.25,
        subtotal: 52.25,
      },
    ],
    subtotal: 52.25,
    tax: 8.36,
    total: 60.61,
    paymentMethod: "tarjeta",
    status: "completada",
    userId: "1",
    invoiceNumber: "FAC-2026-002",
  },
  {
    id: "3",
    date: "2026-01-05T09:45:00Z",
    customerId: "3",
    customerName: "Automotriz Rodríguez C.A.",
    items: [
      {
        productId: "5",
        productName: "Aceite Shell Helix",
        quantity: 5,
        unitPrice: 42.0,
        subtotal: 210.0,
      },
      {
        productId: "2",
        productName: "Filtro de Aceite Toyota",
        quantity: 3,
        unitPrice: 25.0,
        subtotal: 75.0,
      },
    ],
    subtotal: 285.0,
    tax: 45.6,
    total: 330.6,
    paymentMethod: "transferencia",
    status: "completada",
    userId: "1",
    invoiceNumber: "FAC-2026-003",
  },

  // Diciembre 2025
  {
    id: "4",
    date: "2025-12-28T11:20:00Z",
    customerId: "4",
    customerName: "Taller Los Andes",
    items: [
      {
        productId: "11",
        productName: "Aceite Valvoline MaxLife 10W-40",
        quantity: 10,
        unitPrice: 39.9,
        subtotal: 399.0,
      },
      {
        productId: "6",
        productName: "Filtro de Cabina Bosch",
        quantity: 10,
        unitPrice: 22.5,
        subtotal: 225.0,
      },
    ],
    subtotal: 624.0,
    tax: 99.84,
    total: 723.84,
    paymentMethod: "transferencia",
    status: "completada",
    userId: "1",
    invoiceNumber: "FAC-2025-128",
  },
  {
    id: "5",
    date: "2025-12-15T16:40:00Z",
    customerId: "1",
    customerName: "Juan Pérez",
    items: [
      {
        productId: "4",
        productName: "Aditivo Limpiador STP",
        quantity: 2,
        unitPrice: 18.5,
        subtotal: 37.0,
      },
      {
        productId: "1",
        productName: "Aceite Mobil 1 5W-30",
        quantity: 1,
        unitPrice: 45.5,
        subtotal: 45.5,
      },
    ],
    subtotal: 82.5,
    tax: 13.2,
    total: 95.7,
    paymentMethod: "efectivo",
    status: "completada",
    userId: "2",
    invoiceNumber: "FAC-2025-115",
  },
  {
    id: "6",
    date: "2025-12-05T10:00:00Z",
    customerId: "5",
    customerName: "Luis Herrera",
    items: [
      {
        productId: "9",
        productName: "Aceite Motul 8100 0W-20",
        quantity: 4,
        unitPrice: 49.0,
        subtotal: 196.0,
      },
    ],
    subtotal: 196.0,
    tax: 31.36,
    total: 227.36,
    paymentMethod: "tarjeta",
    status: "completada",
    userId: "1",
    invoiceNumber: "FAC-2025-105",
  },

  // Noviembre 2025
  {
    id: "7",
    date: "2025-11-25T14:30:00Z",
    customerId: "3",
    customerName: "Automotriz Rodríguez C.A.",
    items: [
      {
        productId: "7",
        productName: "Grasa Multiuso Valvoline",
        quantity: 20,
        unitPrice: 15.9,
        subtotal: 318.0,
      },
    ],
    subtotal: 318.0,
    tax: 50.88,
    total: 368.88,
    paymentMethod: "crédito",
    status: "completada",
    userId: "1",
    invoiceNumber: "FAC-2025-098",
  },
  {
    id: "8",
    date: "2025-11-10T09:15:00Z",
    customerId: "2",
    customerName: "María González",
    items: [
      {
        productId: "10",
        productName: "Filtro de Combustible Fram",
        quantity: 1,
        unitPrice: 27.9,
        subtotal: 27.9,
      },
      {
        productId: "12",
        productName: "Lubricante Shell Gadus",
        quantity: 1,
        unitPrice: 57.0,
        subtotal: 57.0,
      },
    ],
    subtotal: 84.9,
    tax: 13.58,
    total: 98.48,
    paymentMethod: "efectivo",
    status: "completada",
    userId: "2",
    invoiceNumber: "FAC-2025-085",
  },

  // Octubre 2025
  {
    id: "9",
    date: "2025-10-30T11:00:00Z",
    customerId: "4",
    customerName: "Taller Los Andes",
    items: [
      {
        productId: "1",
        productName: "Aceite Mobil 1 5W-30",
        quantity: 15,
        unitPrice: 45.5,
        subtotal: 682.5,
      },
      {
        productId: "2",
        productName: "Filtro de Aceite Toyota",
        quantity: 15,
        unitPrice: 25.0,
        subtotal: 375.0,
      },
    ],
    subtotal: 1057.5,
    tax: 169.2,
    total: 1226.7,
    paymentMethod: "transferencia",
    status: "completada",
    userId: "1",
    invoiceNumber: "FAC-2025-076",
  },
  {
    id: "10",
    date: "2025-10-15T15:45:00Z",
    customerId: "5",
    customerName: "Luis Herrera",
    items: [
      {
        productId: "8",
        productName: "Aditivo Antihumo Wynn's",
        quantity: 2,
        unitPrice: 13.2,
        subtotal: 26.4,
      },
    ],
    subtotal: 26.4,
    tax: 4.22,
    total: 30.62,
    paymentMethod: "efectivo",
    status: "completada",
    userId: "1",
    invoiceNumber: "FAC-2025-065",
  },

  // Septiembre 2025
  {
    id: "11",
    date: "2025-09-20T10:30:00Z",
    customerId: "1",
    customerName: "Juan Pérez",
    items: [
      {
        productId: "5",
        productName: "Aceite Shell Helix",
        quantity: 1,
        unitPrice: 42.0,
        subtotal: 42.0,
      },
    ],
    subtotal: 42.0,
    tax: 6.72,
    total: 48.72,
    paymentMethod: "efectivo",
    status: "completada",
    userId: "2",
    invoiceNumber: "FAC-2025-054",
  },
  {
    id: "12",
    date: "2025-09-05T13:20:00Z",
    customerId: "3",
    customerName: "Automotriz Rodríguez C.A.",
    items: [
      {
        productId: "6",
        productName: "Filtro de Cabina Bosch",
        quantity: 5,
        unitPrice: 22.5,
        subtotal: 112.5,
      },
      {
        productId: "9",
        productName: "Aceite Motul 8100 0W-20",
        quantity: 5,
        unitPrice: 49.0,
        subtotal: 245.0,
      },
    ],
    subtotal: 357.5,
    tax: 57.2,
    total: 414.7,
    paymentMethod: "cheque",
    status: "completada",
    userId: "1",
    invoiceNumber: "FAC-2025-042",
  },

  // Agosto 2025
  {
    id: "13",
    date: "2025-08-25T09:00:00Z",
    customerId: "2",
    customerName: "María González",
    items: [
      {
        productId: "11",
        productName: "Aceite Valvoline MaxLife 10W-40",
        quantity: 1,
        unitPrice: 39.9,
        subtotal: 39.9,
      },
    ],
    subtotal: 39.9,
    tax: 6.38,
    total: 46.28,
    paymentMethod: "efectivo",
    status: "completada",
    userId: "1",
    invoiceNumber: "FAC-2025-031",
  },
  {
    id: "14",
    date: "2025-08-10T16:15:00Z",
    customerId: "4",
    customerName: "Taller Los Andes",
    items: [
      {
        productId: "3",
        productName: "Lubricante Castrol GTX",
        quantity: 10,
        unitPrice: 52.25,
        subtotal: 522.5,
      },
      {
        productId: "4",
        productName: "Aditivo Limpiador STP",
        quantity: 10,
        unitPrice: 18.5,
        subtotal: 185.0,
      },
    ],
    subtotal: 707.5,
    tax: 113.2,
    total: 820.7,
    paymentMethod: "transferencia",
    status: "completada",
    userId: "1",
    invoiceNumber: "FAC-2025-018",
  },
  // Julio 2025
  {
    id: "15",
    date: "2025-07-22T10:45:00Z",
    customerId: "1",
    customerName: "Juan Pérez",
    items: [
      {
        productId: "2",
        productName: "Filtro de Aceite Toyota",
        quantity: 2,
        unitPrice: 25.0,
        subtotal: 50.0,
      },
      {
        productId: "5",
        productName: "Aceite Shell Helix",
        quantity: 2,
        unitPrice: 42.0,
        subtotal: 84.0,
      },
    ],
    subtotal: 134.0,
    tax: 21.44,
    total: 155.44,
    paymentMethod: "efectivo",
    status: "completada",
    userId: "1",
    invoiceNumber: "FAC-2025-010",
  },
  // Junio 2025
  {
    id: "16",
    date: "2025-06-15T15:30:00Z",
    customerId: "3",
    customerName: "Automotriz Rodríguez C.A.",
    items: [
      {
        productId: "9",
        productName: "Aceite Motul 8100 0W-20",
        quantity: 8,
        unitPrice: 49.0,
        subtotal: 392.0,
      },
    ],
    subtotal: 392.0,
    tax: 62.72,
    total: 454.72,
    paymentMethod: "transferencia",
    status: "completada",
    userId: "2",
    invoiceNumber: "FAC-2025-005",
  },
  // Mayo 2025
  {
    id: "17",
    date: "2025-05-08T09:15:00Z",
    customerId: "2",
    customerName: "María González",
    items: [
      {
        productId: "1",
        productName: "Aceite Mobil 1 5W-30",
        quantity: 1,
        unitPrice: 45.5,
        subtotal: 45.5,
      },
      {
        productId: "4",
        productName: "Aditivo Limpiador STP",
        quantity: 1,
        unitPrice: 18.5,
        subtotal: 18.5,
      },
    ],
    subtotal: 64.0,
    tax: 10.24,
    total: 74.24,
    paymentMethod: "tarjeta",
    status: "completada",
    userId: "1",
    invoiceNumber: "FAC-2025-002",
  },
  // Abril 2025
  {
    id: "18",
    date: "2025-04-12T11:50:00Z",
    customerId: "5",
    customerName: "Luis Herrera",
    items: [
      {
        productId: "7",
        productName: "Grasa Multiuso Valvoline",
        quantity: 5,
        unitPrice: 15.9,
        subtotal: 79.5,
      },
    ],
    subtotal: 79.5,
    tax: 12.72,
    total: 92.22,
    paymentMethod: "efectivo",
    status: "completada",
    userId: "1",
    invoiceNumber: "FAC-2025-001",
  },
  // Marzo 2025
  {
    id: "19",
    date: "2025-03-25T14:20:00Z",
    customerId: "1",
    customerName: "Juan Pérez",
    items: [
      {
        productId: "11",
        productName: "Aceite Valvoline MaxLife",
        quantity: 2,
        unitPrice: 39.9,
        subtotal: 79.8,
      },
      {
        productId: "2",
        productName: "Filtro de Aceite Toyota",
        quantity: 2,
        unitPrice: 25.0,
        subtotal: 50.0,
      },
    ],
    subtotal: 129.8,
    tax: 20.77,
    total: 150.57,
    paymentMethod: "tarjeta",
    status: "completada",
    userId: "1",
    invoiceNumber: "FAC-2025-015",
  },
  // Febrero 2025
  {
    id: "20",
    date: "2025-02-14T09:00:00Z",
    customerId: "3",
    customerName: "Automotriz Rodríguez C.A.",
    items: [
      {
        productId: "5",
        productName: "Aceite Shell Helix",
        quantity: 10,
        unitPrice: 42.0,
        subtotal: 420.0,
      },
      {
        productId: "6",
        productName: "Filtro de Cabina Bosch",
        quantity: 5,
        unitPrice: 22.5,
        subtotal: 112.5,
      },
    ],
    subtotal: 532.5,
    tax: 85.2,
    total: 617.7,
    paymentMethod: "transferencia",
    status: "completada",
    userId: "2",
    invoiceNumber: "FAC-2025-008",
  },
  // Enero 2025
  {
    id: "21",
    date: "2025-01-20T10:30:00Z",
    customerId: "4",
    customerName: "Taller Los Andes",
    items: [
      {
        productId: "3",
        productName: "Lubricante Castrol GTX",
        quantity: 15,
        unitPrice: 52.25,
        subtotal: 783.75,
      },
    ],
    subtotal: 783.75,
    tax: 125.4,
    total: 909.15,
    paymentMethod: "cheque",
    status: "completada",
    userId: "1",
    invoiceNumber: "FAC-2025-004",
  },
];

const mockSuppliers: Supplier[] = [
  {
    id: "1",
    name: "Distribuidora Central",
    contactPerson: "Pedro Ramírez",
    email: "pedro@distribuidoracentral.com",
    phone: "555-1111",
    address: "Zona Industrial, Calle 5",
    category: "Distribuidor",
    status: "active",
    notes: "Proveedor principal con entrega rápida",
  },
  {
    id: "2",
    name: "Repuestos Toyota",
    contactPerson: "Ana Martínez",
    email: "ana@repuestostoyota.com",
    phone: "555-2222",
    address: "Av. Principal, Edificio Torre A, Piso 3",
    category: "Repuestos",
    status: "active",
    notes: "Especialistas en repuestos originales Toyota",
  },
  {
    id: "3",
    name: "Castrol Ecuador",
    contactPerson: "Carlos Jiménez",
    email: "carlos@castrolecuador.com",
    phone: "555-3333",
    address: "Centro Comercial Automotriz, Local 15",
    category: "Lubricantes",
    status: "active",
    notes: "Aceites de alta calidad para todo tipo de vehículos",
  },
  {
    id: "4",
    name: "Químicos del Sur",
    contactPerson: "María López",
    email: "maria@quimicossur.com",
    phone: "555-4444",
    address: "Parque Industrial Sur, Galpón 12",
    category: "Químicos",
    status: "active",
    notes: "Productos químicos para limpieza automotriz",
  },
  {
    id: "5",
    name: "Shell Ecuador",
    contactPerson: "Roberto Silva",
    email: "roberto@shellecuador.com",
    phone: "555-5555",
    address: "Torre Empresarial, Piso 8",
    category: "Combustibles",
    status: "active",
    notes: "Combustibles premium y lubricantes Shell",
  },
];

const mockUsers: User[] = [
  {
    id: "1",
    name: "Admin Principal",
    email: "admin@lubricadora.com",
    role: "admin",
    status: "active",
  },
  {
    id: "2",
    name: "Cajero 1",
    email: "cajero1@lubricadora.com",
    role: "cashier",
    status: "active",
  },
  {
    id: "3",
    name: "Gerente Ventas",
    email: "gerente@lubricadora.com",
    role: "manager",
    status: "active",
  },
];

const stockAlerts: StockAlert[] = [
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
];

const inventoryAnalyticsData: InventoryAnalytics = {
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

// ===== DATOS MOCK DE CONFIGURACIÓN =====
const mockCompanySettings: CompanySettings = {
  name: "Lubricadora El Motor",
  ruc: "1234567890001",
  address: "Av. Principal 123, La Maná, Cotopaxi, Ecuador",
  phone: "02-2345678",
  email: "info@elmotor.com",
};

const mockBranches: Branch[] = [
  {
    id: "1",
    name: "Sucursal Principal",
    address: "Av. Principal 123, La Maná, Cotopaxi, Ecuador",
    phone: "02-2345678",
    email: "principal@elmotor.com",
    isMain: true,
    status: "active",
  },
  {
    id: "2",
    name: "Sucursal Norte",
    address: "Av. 6 de Diciembre 456, La Maná, Cotopaxi, Ecuador",
    phone: "02-2345679",
    email: "norte@elmotor.com",
    isMain: false,
    status: "active",
  },
];

const mockSriSettings: SRISettings = {
  environment: "test",
  emissionType: "normal",
  certificateFile: "",
  certificatePassword: "",
  isActive: false,
};

const mockBackupSettings: BackupSettings = {
  lastBackup: "2024-06-15T14:30:00",
  autoBackup: true,
  backupFrequency: "daily",
};

const mockAuditLogs: AuditLog[] = [
  {
    id: "1",
    action: "Inicio de sesión",
    user: "juan@lubrismart.com",
    timestamp: "2024-06-15T09:30:00",
    status: "success",
    details: "Inicio de sesión exitoso",
  },
  {
    id: "2",
    action: "Venta registrada",
    user: "maria@lubrismart.com",
    timestamp: "2024-06-15T10:15:00",
    status: "success",
    details: "Venta #001-002 completada",
  },
  {
    id: "3",
    action: "Ajuste de inventario",
    user: "juan@lubrismart.com",
    timestamp: "2024-06-15T11:45:00",
    status: "success",
    details: "Ajuste de stock completado",
  },
];

const mockResetCodes: Record<string, string> = {};

// ===== FUNCIONES API =====
export const api = {
  // Productos
  getProducts: async (): Promise<Product[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockProducts]), 500);
    });
  },

  getProductById: async (id: string): Promise<Product | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const product = mockProducts.find((p) => p.id === id) || null;
        resolve(product);
      }, 300);
    });
  },

  createProduct: async (product: Omit<Product, "id">): Promise<Product> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const inferred = classifyProductCategory(product);
        const newProduct = {
          ...product,
          category: inferred.category as Product["category"],
          id: Math.random().toString(36).substring(2, 9),
          lastUpdated: new Date().toISOString().split("T")[0],
        };
        mockProducts.push(newProduct);
        resolve(newProduct);
      }, 700);
    });
  },

  updateProduct: async (
    id: string,
    product: Partial<Product>
  ): Promise<Product> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockProducts.findIndex((p) => p.id === id);
        if (index !== -1) {
          const base = { ...mockProducts[index], ...product };
          const inferred = classifyProductCategory(base);
          mockProducts[index] = {
            ...base,
            category: inferred.category as Product["category"],
            lastUpdated: new Date().toISOString().split("T")[0],
          };
          resolve(mockProducts[index]);
        } else {
          reject(new Error("Producto no encontrado"));
        }
      }, 700);
    });
  },

  deleteProduct: async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockProducts.findIndex((p) => p.id === id);
        if (index !== -1) {
          mockProducts.splice(index, 1);
          resolve(void 0);
        } else {
          reject(new Error("Producto no encontrado"));
        }
      }, 700);
    });
  },

  // Movimientos de stock
  getStockMovements: async (productId?: string): Promise<StockMovement[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let movements = [...mockStockMovements];
        if (productId) {
          movements = movements.filter((m) => m.productId === productId);
        }
        resolve(movements);
      }, 500);
    });
  },

  createStockMovement: async (
    movement: Omit<StockMovement, "id">
  ): Promise<StockMovement> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newMovement = {
          ...movement,
          id: Math.random().toString(36).substring(2, 9),
        };
        mockStockMovements.push(newMovement);
        resolve(newMovement);
      }, 700);
    });
  },

  // Clientes
  getCustomers: async (): Promise<Customer[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockCustomers]), 500);
    });
  },

  getCustomerById: async (id: string): Promise<Customer | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const customer = mockCustomers.find((c) => c.id === id) || null;
        resolve(customer);
      }, 300);
    });
  },

  createCustomer: async (customer: Omit<Customer, "id">): Promise<Customer> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newCustomer = {
          ...customer,
          id: Math.random().toString(36).substring(2, 9),
        };
        mockCustomers.push(newCustomer);
        resolve(newCustomer);
      }, 700);
    });
  },

  updateCustomer: async (
    id: string,
    customer: Partial<Customer>
  ): Promise<Customer> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockCustomers.findIndex((c) => c.id === id);
        if (index !== -1) {
          mockCustomers[index] = { ...mockCustomers[index], ...customer };
          resolve(mockCustomers[index]);
        } else {
          reject(new Error("Cliente no encontrado"));
        }
      }, 700);
    });
  },

  deleteCustomer: async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockCustomers.findIndex((c) => c.id === id);
        if (index !== -1) {
          mockCustomers.splice(index, 1);
          resolve(void 0);
        } else {
          reject(new Error("Cliente no encontrado"));
        }
      }, 700);
    });
  },

  // Ventas
  getSales: async (): Promise<Sale[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockSales]), 500);
    });
  },

  createSale: async (sale: Omit<Sale, "id">): Promise<Sale> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newSale = {
          ...sale,
          id: Math.random().toString(36).substring(2, 9),
        };
        mockSales.push(newSale);
        resolve(newSale);
      }, 700);
    });
  },

  // Análisis
  getInventoryAnalytics: async (): Promise<any> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const totalProducts = mockProducts.length;
        const lowStockCount = mockProducts.filter(
          (p) => p.stock < p.minStock
        ).length;
        const outOfStockCount = mockProducts.filter(
          (p) => p.stock === 0
        ).length;
        const totalValue = mockProducts.reduce(
          (sum, p) => sum + p.cost * p.stock,
          0
        );

        resolve({
          totalProducts,
          lowStockCount,
          outOfStockCount,
          totalValue,
          categoryDistribution: inventoryAnalyticsData.categoryDistribution,
          stockLevels: inventoryAnalyticsData.stockLevels,
          topSellingProducts: inventoryAnalyticsData.topSellingProducts,
          lowStockProducts: inventoryAnalyticsData.lowStockProducts,
          inventoryValue: inventoryAnalyticsData.inventoryValue,
        });
      }, 800);
    });
  },

  getSalesAnalytics: async (): Promise<any> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          totalSales: mockSales.length,
          totalRevenue: mockSales.reduce((sum, s) => sum + s.total, 0),
          averageTicket:
            mockSales.length > 0
              ? mockSales.reduce((sum, s) => sum + s.total, 0) /
                mockSales.length
              : 0,
          salesByCategory: {
            aceites: 12500,
            filtros: 8200,
            lubricantes: 15300,
            aditivos: 4800,
          },
          salesByMonth: {
            Ene: 8500,
            Feb: 9200,
            Mar: 10500,
            Abr: 9800,
            May: 11200,
            Jun: 12500,
          },
        });
      }, 800);
    });
  },

  // Alertas de stock
  getStockAlerts: async (): Promise<StockAlert[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...stockAlerts]), 500);
    });
  },

  // Pronóstico de demanda
  getDemandForecast: async (): Promise<any> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          forecastByProduct: [
            {
              id: "1",
              name: "Aceite Mobil 1 5W-30",
              forecast: 35,
              confidence: 0.85,
            },
            {
              id: "2",
              name: "Filtro de Aceite Toyota",
              forecast: 42,
              confidence: 0.78,
            },
            {
              id: "3",
              name: "Lubricante Castrol GTX",
              forecast: 28,
              confidence: 0.82,
            },
            {
              id: "4",
              name: "Aditivo Limpiador STP",
              forecast: 15,
              confidence: 0.65,
            },
            {
              id: "5",
              name: "Aceite Shell Helix",
              forecast: 30,
              confidence: 0.75,
            },
          ],
          forecastByCategory: {
            aceites: 120,
            filtros: 85,
            lubricantes: 65,
            aditivos: 40,
          },
        });
      }, 1000);
    });
  },

  // Clasificación automática de productos
  getProductClassification: async (): Promise<any> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const byCategory = mockProducts.reduce(
          (acc: Record<string, Product[]>, p) => {
            (acc[p.category] = acc[p.category] || []).push(p);
            return acc;
          },
          {}
        );
        resolve({
          byCategory,
          accuracyEstimate: 0.95,
        });
      }, 800);
    });
  },

  // Optimización de precios
  getPriceOptimization: async (): Promise<any> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          recommendations: [
            {
              productId: "1",
              currentPrice: 45.5,
              recommendedPrice: 48.99,
              potentialRevenue: 350,
            },
            {
              productId: "3",
              currentPrice: 52.25,
              recommendedPrice: 54.99,
              potentialRevenue: 275,
            },
            {
              productId: "4",
              currentPrice: 18.5,
              recommendedPrice: 16.99,
              potentialRevenue: 125,
            },
          ],
        });
      }, 1200);
    });
  },

  // Productos obsoletos
  getObsoleteProducts: async (): Promise<any> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          obsoleteProducts: [
            {
              id: "4",
              name: "Aditivo Limpiador STP",
              daysSinceLastSale: 45,
              stock: 0,
            },
          ],
          atRiskProducts: [
            {
              id: "3",
              name: "Lubricante Castrol GTX",
              daysSinceLastSale: 25,
              stock: 25,
            },
          ],
        });
      }, 700);
    });
  },

  getObsolescenceMetrics: async (): Promise<{
    count: number;
    avgDays: number;
    impact: number;
  }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const now = new Date().getTime();
        const obsolete = mockProducts.filter((p) => {
          const rot = p.rotationRate || 0;
          const last = new Date(p.lastUpdated).getTime();
          const days = Math.floor((now - last) / (1000 * 60 * 60 * 24));
          return (rot <= 0.4 || days >= 180) && (p.stock || 0) > 0;
        });
        const count = obsolete.length;
        const avgDays =
          count === 0
            ? 0
            : Math.round(
                obsolete.reduce((s, p) => {
                  const last = new Date(p.lastUpdated).getTime();
                  const days = Math.floor((now - last) / (1000 * 60 * 60 * 24));
                  return s + days;
                }, 0) / count
              );
        const impact = obsolete.reduce(
          (s, p) => s + (p.cost || 0) * (p.stock || 0),
          0
        );
        resolve({ count, avgDays, impact });
      }, 500);
    });
  },

  // Proveedores
  getSuppliers: async (): Promise<Supplier[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockSuppliers]), 500);
    });
  },

  createSupplier: async (supplier: Omit<Supplier, "id">): Promise<Supplier> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newSupplier = {
          ...supplier,
          id: Math.random().toString(36).substring(2, 9),
        };
        mockSuppliers.push(newSupplier);
        resolve(newSupplier);
      }, 700);
    });
  },

  updateSupplier: async (
    id: string,
    supplier: Partial<Supplier>
  ): Promise<Supplier> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockSuppliers.findIndex((s) => s.id === id);
        if (index !== -1) {
          mockSuppliers[index] = { ...mockSuppliers[index], ...supplier };
          resolve(mockSuppliers[index]);
        } else {
          reject(new Error("Proveedor no encontrado"));
        }
      }, 700);
    });
  },

  deleteSupplier: async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockSuppliers.findIndex((s) => s.id === id);
        if (index !== -1) {
          mockSuppliers.splice(index, 1);
          resolve(void 0);
        } else {
          reject(new Error("Proveedor no encontrado"));
        }
      }, 700);
    });
  },

  // Usuarios
  getUsers: async (): Promise<User[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockUsers]), 500);
    });
  },

  createUser: async (user: Omit<User, "id">): Promise<User> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser = {
          ...user,
          id: Math.random().toString(36).substring(2, 9),
        };
        mockUsers.push(newUser);
        resolve(newUser);
      }, 700);
    });
  },

  updateUser: async (id: string, user: Partial<User>): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockUsers.findIndex((u) => u.id === id);
        if (index !== -1) {
          mockUsers[index] = { ...mockUsers[index], ...user };
          resolve(mockUsers[index]);
        } else {
          reject(new Error("Usuario no encontrado"));
        }
      }, 700);
    });
  },

  deleteUser: async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockUsers.findIndex((u) => u.id === id);
        if (index !== -1) {
          mockUsers.splice(index, 1);
          resolve(void 0);
        } else {
          reject(new Error("Usuario no encontrado"));
        }
      }, 700);
    });
  },

  // Configuración de empresa
  getCompanySettings: async (): Promise<CompanySettings> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ ...mockCompanySettings }), 500);
    });
  },

  updateCompanySettings: async (
    settings: CompanySettings
  ): Promise<CompanySettings> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        Object.assign(mockCompanySettings, settings);
        resolve({ ...mockCompanySettings });
      }, 700);
    });
  },

  // Sucursales
  getBranches: async (): Promise<Branch[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockBranches]), 500);
    });
  },

  createBranch: async (branch: Omit<Branch, "id">): Promise<Branch> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newBranch = {
          ...branch,
          id: Math.random().toString(36).substring(2, 9),
        };
        mockBranches.push(newBranch);
        resolve(newBranch);
      }, 700);
    });
  },

  updateBranch: async (
    id: string,
    branch: Partial<Branch>
  ): Promise<Branch> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockBranches.findIndex((b) => b.id === id);
        if (index !== -1) {
          mockBranches[index] = { ...mockBranches[index], ...branch };
          resolve(mockBranches[index]);
        } else {
          reject(new Error("Sucursal no encontrada"));
        }
      }, 700);
    });
  },

  deleteBranch: async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockBranches.findIndex((b) => b.id === id);
        if (index !== -1) {
          mockBranches.splice(index, 1);
          resolve(void 0);
        } else {
          reject(new Error("Sucursal no encontrada"));
        }
      }, 700);
    });
  },

  // Configuración SRI
  getSriSettings: async (): Promise<SRISettings> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ ...mockSriSettings }), 500);
    });
  },

  updateSriSettings: async (settings: SRISettings): Promise<SRISettings> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        Object.assign(mockSriSettings, settings);
        resolve({ ...mockSriSettings });
      }, 700);
    });
  },

  // Configuración de respaldos
  getBackupSettings: async (): Promise<BackupSettings> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ ...mockBackupSettings }), 500);
    });
  },

  updateBackupSettings: async (
    settings: BackupSettings
  ): Promise<BackupSettings> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        Object.assign(mockBackupSettings, settings);
        resolve({ ...mockBackupSettings });
      }, 700);
    });
  },

  generateBackup: async (): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const timestamp = new Date().toISOString();
        mockBackupSettings.lastBackup = timestamp;
        resolve(timestamp);
      }, 2000);
    });
  },

  restoreBackup: async (backupFile: File): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simular proceso de restauración
        console.log("Restaurando desde:", backupFile.name);
        resolve(void 0);
      }, 3000);
    });
  },

  // Logs de auditoría
  getAuditLogs: async (): Promise<AuditLog[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockAuditLogs]), 500);
    });
  },

  createAuditLog: async (log: Omit<AuditLog, "id">): Promise<AuditLog> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newLog = {
          ...log,
          id: Math.random().toString(36).substring(2, 9),
        };
        mockAuditLogs.unshift(newLog);
        resolve(newLog);
      }, 300);
    });
  },

  // Autenticación: recuperación de contraseña (simulado)
  requestPasswordReset: async (
    email: string
  ): Promise<{ success: boolean; exists?: boolean; demoCode?: string }> => {
    if (API_BASE) {
      const res = await fetch(`${API_BASE}/auth/password/reset/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("requestPasswordReset failed");
      return res.json();
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        const userExists = mockUsers.some((u) => u.email === email);
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        if (userExists) {
          mockResetCodes[email] = code;
          resolve({ success: true, exists: true, demoCode: code });
        } else {
          resolve({ success: true, exists: false });
        }
      }, 600);
    });
  },

  verifyPasswordResetCode: async (
    email: string,
    code: string
  ): Promise<boolean> => {
    if (API_BASE) {
      const res = await fetch(`${API_BASE}/auth/password/reset/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      if (!res.ok) throw new Error("verifyPasswordResetCode failed");
      const data = await res.json();
      return !!data.valid;
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockResetCodes[email] === code);
      }, 400);
    });
  },

  checkEmailExists: async (email: string): Promise<boolean> => {
    if (API_BASE) {
      const res = await fetch(`${API_BASE}/auth/check-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("checkEmailExists failed");
      const data = await res.json();
      return !!data.exists;
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockUsers.some((u) => u.email === email));
      }, 200);
    });
  },

  resetPassword: async (
    email: string,
    newPassword: string
  ): Promise<boolean> => {
    if (API_BASE) {
      const res = await fetch(`${API_BASE}/auth/password/reset/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });
      if (!res.ok) throw new Error("resetPassword failed");
      const data = await res.json();
      return !!data.success;
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        delete mockResetCodes[email];
        resolve(true);
      }, 700);
    });
  },
  authLogin: async (payload: LoginPayload): Promise<AuthResponse> => {
    if (API_BASE) {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("authLogin failed");
      const data = await res.json();
      return data as AuthResponse;
    }
    const user =
      mockUsers.find((u) => u.email === payload.email) || mockUsers[0];
    return {
      token: Math.random().toString(36).slice(2),
      refreshToken: Math.random().toString(36).slice(2),
      expiresIn: 3600,
      user,
    };
  },
};

export function classifyProductCategory(product: Partial<Product>): {
  category: Product["category"];
  confidence: number;
  reasons: string[];
} {
  const text = [product.name, product.brand, product.sku, product.supplier]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const has = (k: string) => text.includes(k);

  const scores: Record<Product["category"], number> = {
    aceites: 0,
    filtros: 0,
    lubricantes: 0,
    aditivos: 0,
  };
  const reasons: string[] = [];

  const aceiteKeywords = [
    "aceite",
    "5w",
    "10w",
    "0w",
    "mobil",
    "shell",
    "valvoline",
    "motul",
    "helix",
  ];
  const filtroKeywords = [
    "filtro",
    "filter",
    "aire",
    "aceite",
    "combustible",
    "cabina",
  ];
  const lubricanteKeywords = ["lubricante", "grasa", "grease", "gtx"];
  const aditivoKeywords = ["aditivo", "limpiador", "stp", "tratamiento"];

  aceiteKeywords.forEach((k) => {
    if (has(k)) {
      scores.aceites += 2;
      reasons.push(`Coincidencia: ${k}`);
    }
  });
  filtroKeywords.forEach((k) => {
    if (has(k)) {
      scores.filtros += 2;
      reasons.push(`Coincidencia: ${k}`);
    }
  });
  lubricanteKeywords.forEach((k) => {
    if (has(k)) {
      scores.lubricantes += 2;
      reasons.push(`Coincidencia: ${k}`);
    }
  });
  aditivoKeywords.forEach((k) => {
    if (has(k)) {
      scores.aditivos += 2;
      reasons.push(`Coincidencia: ${k}`);
    }
  });

  // Reglas adicionales por formato de nombre
  if (/\b\d{1,2}w-\d{2}\b/.test(text)) {
    scores.aceites += 3;
    reasons.push("Formato viscosidad detectado");
  }

  const best = Object.entries(scores).sort(
    (a, b) => b[1] - a[1]
  )[0][0] as Product["category"];
  const maxScore = Math.max(...Object.values(scores));
  const confidence = Math.min(1, maxScore / 6);

  return { category: best, confidence, reasons };
}

export default api;
