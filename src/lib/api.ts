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
  paymentMethod: "efectivo" | "tarjeta" | "transferencia" | "crédito";
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

import {
  mockCustomers as mdCustomers,
  mockSuppliers as mdSuppliers,
  inventoryAnalyticsData as mdInventoryAnalyticsData,
  stockAlerts as mdStockAlerts,
} from "./mock-data";

// ===== INTERFACES DE CONFIGURACIÓN =====
export interface CompanySettings {
  name: string
  ruc: string
  address: string
  phone: string
  email: string
}

export interface Branch {
  id: string
  name: string
  address: string
  phone: string
  email: string
  isMain: boolean
  status: "active" | "inactive"
}

export interface SRISettings {
  environment: "test" | "production"
  emissionType: "normal" | "contingency"
  certificateFile: string
  certificatePassword: string
  isActive: boolean
}

export interface BackupSettings {
  lastBackup: string
  autoBackup: boolean
  backupFrequency: "daily" | "weekly" | "monthly"
}

export interface AuditLog {
  id: string
  action: string
  user: string
  timestamp: string
  status: "success" | "error" | "warning"
  details: string
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
  },
  {
    id: "6",
    name: "Refrigerante Prestone 50/50",
    brand: "Prestone",
    category: "refrigerantes",
    price: 21.9,
    cost: 14.0,
    stock: 18,
    minStock: 12,
    maxStock: 60,
    sku: "PRE-5050-001",
    supplier: "Prestone Ecuador",
    location: "F1-G2",
    lastUpdated: "2024-02-01",
    status: "active",
    rotationRate: 0.58,
    profitMargin: 0.36,
  },
  {
    id: "7",
    name: "Filtro de Aire Mann C27005",
    brand: "Mann",
    category: "filtros",
    price: 29.5,
    cost: 20.5,
    stock: 22,
    minStock: 15,
    maxStock: 80,
    sku: "MAN-AIR-27005",
    supplier: "Mann Ecuador",
    location: "G1-H1",
    lastUpdated: "2024-02-03",
    status: "active",
    rotationRate: 0.62,
    profitMargin: 0.44,
  },
  {
    id: "8",
    name: "Aceite Valvoline MaxLife 10W-40",
    brand: "Valvoline",
    category: "aceites",
    price: 36.9,
    cost: 25.0,
    stock: 12,
    minStock: 20,
    maxStock: 80,
    sku: "VAL-ML-1040",
    supplier: "Distribuidora Central",
    location: "H2-I1",
    lastUpdated: "2024-02-05",
    status: "active",
    rotationRate: 0.51,
    profitMargin: 0.48,
  },
  {
    id: "9",
    name: "Lubricante Chevron Delo 400",
    brand: "Chevron",
    category: "lubricantes",
    price: 55.0,
    cost: 39.5,
    stock: 30,
    minStock: 20,
    maxStock: 100,
    sku: "CHV-DELO-400",
    supplier: "Chevron Ecuador",
    location: "I1-J1",
    lastUpdated: "2024-02-07",
    status: "active",
    rotationRate: 0.67,
    profitMargin: 0.39,
  },
  {
    id: "10",
    name: "Aditivo Liqui Moly Limpiador de Inyectores",
    brand: "Liqui Moly",
    category: "aditivos",
    price: 24.75,
    cost: 16.8,
    stock: 40,
    minStock: 25,
    maxStock: 120,
    sku: "LM-INJ-001",
    supplier: "Químicos del Sur",
    location: "J2-K1",
    lastUpdated: "2024-02-08",
    status: "active",
    rotationRate: 0.73,
    profitMargin: 0.47,
  },
  {
    id: "11",
    name: "Filtro de Aceite Bosch 0986AF022",
    brand: "Bosch",
    category: "filtros",
    price: 23.9,
    cost: 15.5,
    stock: 55,
    minStock: 20,
    maxStock: 120,
    sku: "BOS-FIL-022",
    supplier: "Bosch Repuestos",
    location: "K1-L1",
    lastUpdated: "2024-02-10",
    status: "active",
    rotationRate: 0.68,
    profitMargin: 0.54,
  },
  {
    id: "12",
    name: "Aceite Total Quartz 9000 5W-40",
    brand: "Total",
    category: "aceites",
    price: 39.9,
    cost: 27.0,
    stock: 28,
    minStock: 18,
    maxStock: 90,
    sku: "TTL-Q9000-540",
    supplier: "Total Ecuador",
    location: "L2-M1",
    lastUpdated: "2024-02-12",
    status: "active",
    rotationRate: 0.57,
    profitMargin: 0.48,
  },
  {
    id: "13",
    name: "Aceite Motul 8100 X-cess 5W-40",
    brand: "Motul",
    category: "aceites",
    price: 49.9,
    cost: 34.0,
    stock: 9,
    minStock: 20,
    maxStock: 70,
    sku: "MTL-8100-540",
    supplier: "Distribuidora Central",
    location: "M2-N1",
    lastUpdated: "2024-02-14",
    status: "active",
    rotationRate: 0.46,
    profitMargin: 0.47,
  },
  {
    id: "14",
    name: "Filtro de Combustible Wix 33312",
    brand: "Wix",
    category: "filtros",
    price: 27.5,
    cost: 18.0,
    stock: 14,
    minStock: 15,
    maxStock: 80,
    sku: "WIX-FUEL-33312",
    supplier: "Wix Ecuador",
    location: "N2-O1",
    lastUpdated: "2024-02-16",
    status: "active",
    rotationRate: 0.52,
    profitMargin: 0.53,
  },
  {
    id: "15",
    name: "Lubricante Castrol EDGE 0W-20",
    brand: "Castrol",
    category: "lubricantes",
    price: 58.9,
    cost: 41.0,
    stock: 6,
    minStock: 15,
    maxStock: 50,
    sku: "CAS-EDGE-020",
    supplier: "Castrol Ecuador",
    location: "O2-P1",
    lastUpdated: "2024-02-18",
    status: "active",
    rotationRate: 0.41,
    profitMargin: 0.44,
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
  {
    id: "4",
    productId: "7",
    type: "entrada",
    quantity: 30,
    date: "2024-02-03",
    reason: "Compra a proveedor",
    userId: "1",
    documentRef: "FAC-004-005-006",
  },
  {
    id: "5",
    productId: "8",
    type: "salida",
    quantity: 4,
    date: "2024-02-06",
    reason: "Venta",
    userId: "2",
  },
  {
    id: "6",
    productId: "10",
    type: "entrada",
    quantity: 50,
    date: "2024-02-08",
    reason: "Compra a proveedor",
    userId: "1",
    documentRef: "FAC-010-011-012",
  },
  {
    id: "7",
    productId: "11",
    type: "ajuste",
    quantity: -3,
    date: "2024-02-10",
    reason: "Inventario físico",
    userId: "1",
  },
];

const mockCustomers: Customer[] = mdCustomers.map((c: any) => ({
  id: c.id,
  name: c.name,
  email: c.email,
  phone: c.phone,
  address: c.address,
  city: c.city,
  idNumber: c.idNumber,
  customerType: c.customerType,
  businessName: c.businessName,
  ruc: c.ruc,
  vehicles: c.vehicles || [],
  totalPurchases: c.totalPurchases || 0,
  lastPurchase: c.lastPurchase || "",
  registrationDate: c.registrationDate || "",
  status: c.status,
  notes: c.notes || "",
  preferredContact: c.preferredContact || "phone",
}));

const mockSales: Sale[] = [
  {
    id: "1",
    date: new Date().toISOString(),
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
    invoiceNumber: "FAC-2024-001",
  },
  {
    id: "2",
    date: "2025-01-18",
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
    invoiceNumber: "FAC-2024-002",
  },
  {
    id: "3",
    date: "2025-01-20",
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
    invoiceNumber: "FAC-2024-003",
  },
  {
    id: "4",
    date: "2025-01-22",
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
    ],
    subtotal: 37.0,
    tax: 5.92,
    total: 42.92,
    paymentMethod: "efectivo",
    status: "completada",
    userId: "1",
    invoiceNumber: "FAC-2024-004",
  },
  {
    id: "5",
    date: "2025-02-01",
    customerId: "2",
    customerName: "Transportes Rápidos S.A.",
    items: [
      { productId: "7", productName: "Filtro de Aire Mann C27005", quantity: 4, unitPrice: 29.5, subtotal: 118.0 },
      { productId: "9", productName: "Lubricante Chevron Delo 400", quantity: 2, unitPrice: 55.0, subtotal: 110.0 },
    ],
    subtotal: 228.0,
    tax: 36.48,
    total: 264.48,
    paymentMethod: "transferencia",
    status: "completada",
    userId: "1",
    invoiceNumber: "FAC-2025-005",
  },
  {
    id: "6",
    date: "2025-02-02",
    customerId: "3",
    customerName: "María Rodríguez",
    items: [
      { productId: "6", productName: "Refrigerante Prestone 50/50", quantity: 1, unitPrice: 21.9, subtotal: 21.9 },
      { productId: "11", productName: "Filtro de Aceite Bosch 0986AF022", quantity: 1, unitPrice: 23.9, subtotal: 23.9 },
    ],
    subtotal: 45.8,
    tax: 7.33,
    total: 53.13,
    paymentMethod: "efectivo",
    status: "pendiente",
    userId: "2",
    invoiceNumber: "FAC-2025-006",
  },
  {
    id: "7",
    date: "2025-02-03",
    customerId: "4",
    customerName: "Taxi Express Cía. Ltda.",
    items: [
      { productId: "10", productName: "Aditivo Liqui Moly Limpiador de Inyectores", quantity: 6, unitPrice: 24.75, subtotal: 148.5 },
      { productId: "8", productName: "Aceite Valvoline MaxLife 10W-40", quantity: 8, unitPrice: 36.9, subtotal: 295.2 },
    ],
    subtotal: 443.7,
    tax: 71.0,
    total: 514.7,
    paymentMethod: "tarjeta",
    status: "completada",
    userId: "2",
    invoiceNumber: "FAC-2025-007",
  },
  {
    id: "8",
    date: "2025-11-24",
    customerId: "2",
    customerName: "María González",
    items: [
      { productId: "12", productName: "Aceite Total Quartz 9000 5W-40", quantity: 2, unitPrice: 39.9, subtotal: 79.8 },
      { productId: "11", productName: "Filtro de Aceite Bosch 0986AF022", quantity: 1, unitPrice: 23.9, subtotal: 23.9 },
    ],
    subtotal: 103.7,
    tax: 16.59,
    total: 120.29,
    paymentMethod: "efectivo",
    status: "completada",
    userId: "2",
    invoiceNumber: "FAC-2025-008",
  },
  {
    id: "9",
    date: "2025-11-25",
    customerId: "5",
    customerName: "Transporte La Maná S.A.",
    items: [
      { productId: "9", productName: "Lubricante Chevron Delo 400", quantity: 5, unitPrice: 55.0, subtotal: 275.0 },
      { productId: "5", productName: "Aceite Shell Helix", quantity: 3, unitPrice: 42.0, subtotal: 126.0 },
    ],
    subtotal: 401.0,
    tax: 64.16,
    total: 465.16,
    paymentMethod: "transferencia",
    status: "completada",
    userId: "1",
    invoiceNumber: "FAC-2025-009",
  },
  {
    id: "10",
    date: "2025-11-26",
    customerId: "1",
    customerName: "Juan Pérez",
    items: [
      { productId: "1", productName: "Aceite Mobil 1 5W-30", quantity: 1, unitPrice: 45.5, subtotal: 45.5 },
      { productId: "3", productName: "Lubricante Castrol GTX", quantity: 1, unitPrice: 52.25, subtotal: 52.25 },
    ],
    subtotal: 97.75,
    tax: 15.64,
    total: 113.39,
    paymentMethod: "tarjeta",
    status: "pendiente",
    userId: "1",
    invoiceNumber: "FAC-2025-010",
  },
  {
    id: "11",
    date: "2025-11-26T14:30:00Z",
    customerId: "3",
    customerName: "Automotriz Rodríguez C.A.",
    items: [
      { productId: "15", productName: "Lubricante Castrol EDGE 0W-20", quantity: 2, unitPrice: 58.9, subtotal: 117.8 },
      { productId: "14", productName: "Filtro de Combustible Wix 33312", quantity: 4, unitPrice: 27.5, subtotal: 110.0 },
    ],
    subtotal: 227.8,
    tax: 36.45,
    total: 264.25,
    paymentMethod: "efectivo",
    status: "completada",
    userId: "1",
    invoiceNumber: "FAC-2025-011",
  },
];

const mockSuppliers: Supplier[] = mdSuppliers.map((s: any) => ({
  id: s.id,
  name: s.name,
  contactPerson: s.contactPerson,
  email: s.email,
  phone: s.phone,
  address: s.address,
  category: s.productsSupplied?.[0] || s.category,
  status: s.status,
  notes: s.notes,
  city: s.city,
  country: s.country,
  ruc: s.ruc,
  paymentTerms: s.paymentTerms,
  productsSupplied: s.productsSupplied,
  totalOrders: s.totalOrders,
  lastOrderDate: s.lastOrderDate,
  rating: s.rating,
}));


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
  {
    id: "6",
    name: "Técnico 1",
    email: "tecnico1@lubricadora.com",
    role: "manager",
    status: "active",
  },
  {
    id: "7",
    name: "Técnico 2",
    email: "tecnico2@lubricadora.com",
    role: "manager",
    status: "active",
  },
  {
    id: "5",
    name: "Cajero 2",
    email: "cajero2@lubricadora.com",
    role: "cashier",
    status: "active",
  },
];

const stockAlerts: StockAlert[] = mdStockAlerts as any;

const inventoryAnalyticsData: InventoryAnalytics = mdInventoryAnalyticsData as any;

// ===== DATOS MOCK DE CONFIGURACIÓN =====
const mockCompanySettings: CompanySettings = {
  name: "Lubricadora El Motor",
  ruc: "1234567890001",
  address: "Av. Principal 123, Quito",
  phone: "02-2345678",
  email: "info@elmotor.com",
}

const mockBranches: Branch[] = [
  {
    id: "1",
    name: "Sucursal Principal",
    address: "Av. Principal 123, Quito",
    phone: "02-2345678",
    email: "principal@elmotor.com",
    isMain: true,
    status: "active",
  },
  {
    id: "2",
    name: "Sucursal Norte",
    address: "Av. 6 de Diciembre 456, Quito",
    phone: "02-2345679",
    email: "norte@elmotor.com",
    isMain: false,
    status: "active",
  },
]

const mockSriSettings: SRISettings = {
  environment: "test",
  emissionType: "normal",
  certificateFile: "",
  certificatePassword: "",
  isActive: false,
}

const mockBackupSettings: BackupSettings = {
  lastBackup: "2024-06-15T14:30:00",
  autoBackup: true,
  backupFrequency: "daily",
}

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
]

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
        const newProduct = {
          ...product,
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
          mockProducts[index] = {
            ...mockProducts[index],
            ...product,
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
        resolve({
          highRotation: mockProducts.filter((p) => (p.rotationRate || 0) > 0.7),
          mediumRotation: mockProducts.filter(
            (p) => (p.rotationRate || 0) <= 0.7 && (p.rotationRate || 0) > 0.4
          ),
          lowRotation: mockProducts.filter((p) => (p.rotationRate || 0) <= 0.4),
          highProfitMargin: mockProducts.filter(
            (p) => (p.profitMargin || 0) > 0.4
          ),
          mediumProfitMargin: mockProducts.filter(
            (p) => (p.profitMargin || 0) <= 0.4 && (p.profitMargin || 0) > 0.25
          ),
          lowProfitMargin: mockProducts.filter(
            (p) => (p.profitMargin || 0) <= 0.25
          ),
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
};

export default api;
