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
  category: string;
  status: "active" | "inactive";
  notes?: string; // Agregar este campo
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
];

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
