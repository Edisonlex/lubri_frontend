"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { api } from "@/lib/api";
import { backendApi, isBackendEnabled } from "@/lib/backend-api";
import { generateInvoiceNumber } from "@/components/pos/invoice-generator";
import type { Supplier } from "@/lib/api";

// ===== FUNCIONES DE CONVERSIÓN ENTRE BACKEND Y CONTEXT =====

// Convertir Product del backend al formato del contexto
const convertBackendProductToContext = (backendProduct: any): Product => {
  return {
    id: backendProduct.id,
    name: backendProduct.name,
    brand: backendProduct.brand,
    category: backendProduct.category,
    price: backendProduct.price,
    cost: backendProduct.cost,
    stock: backendProduct.stock,
    minStock: backendProduct.minStock,
    maxStock: backendProduct.maxStock,
    sku: backendProduct.sku,
    barcode: backendProduct.barcode,
    supplier: backendProduct.supplier,
    location: backendProduct.location,
    lastUpdated: backendProduct.lastUpdated,
    status: backendProduct.status,
    rotationRate: backendProduct.rotationRate,
    profitMargin: backendProduct.profitMargin,
    imageUrl: backendProduct.imageUrl,
  };
};

// Convertir Customer del backend al formato del contexto
const convertBackendCustomerToContext = (backendCustomer: any): Customer => {
  return {
    id: backendCustomer.id,
    name: backendCustomer.name,
    email: backendCustomer.email,
    phone: backendCustomer.phone,
    address: backendCustomer.address,
    city: backendCustomer.city,
    idNumber: backendCustomer.idNumber,
    customerType: backendCustomer.customerType,
    businessName: backendCustomer.businessName,
    ruc: backendCustomer.ruc,
    vehicles: backendCustomer.vehicles || [],
    totalPurchases: backendCustomer.totalPurchases || 0,
    lastPurchase: backendCustomer.lastPurchase || "",
    registrationDate: backendCustomer.registrationDate,
    status: backendCustomer.status,
    notes: backendCustomer.notes || "",
    preferredContact: backendCustomer.preferredContact,
  };
};

// Convertir Sale del backend al formato del contexto
const convertBackendSaleToContext = (backendSale: any): Sale => {
  return {
    id: backendSale.id,
    date: backendSale.date,
    customerId: backendSale.customerId,
    customerName: backendSale.customerName,
    items: backendSale.items || [],
    subtotal: backendSale.subtotal,
    tax: backendSale.tax,
    total: backendSale.total,
    paymentMethod: backendSale.paymentMethod,
    status: backendSale.status,
    userId: backendSale.userId,
    invoiceNumber: backendSale.invoiceNumber,
    notes: backendSale.notes,
  };
};

// Convertir datos del contexto al formato del backend para crear producto
const convertContextProductToBackend = (
  contextProduct: Omit<Product, "id">
): any => {
  return {
    name: contextProduct.name,
    brand: contextProduct.brand,
    category: contextProduct.category,
    price: contextProduct.price,
    cost: contextProduct.cost,
    stock: contextProduct.stock,
    minStock: contextProduct.minStock,
    maxStock: contextProduct.maxStock,
    sku: contextProduct.sku,
    barcode: contextProduct.barcode,
    supplier: contextProduct.supplier,
    location: contextProduct.location,
    status: contextProduct.status || "active",
    imageUrl: contextProduct.imageUrl,
  };
};

// Convertir datos del contexto al formato del backend para crear cliente
const convertContextCustomerToBackend = (
  contextCustomer: Omit<Customer, "id">
): any => {
  return {
    name: contextCustomer.name,
    email: contextCustomer.email,
    phone: contextCustomer.phone,
    address: contextCustomer.address,
    city: contextCustomer.city,
    idNumber: contextCustomer.idNumber,
    customerType: contextCustomer.customerType,
    businessName: contextCustomer.businessName,
    ruc: contextCustomer.ruc,
    vehicles: contextCustomer.vehicles,
    notes: contextCustomer.notes,
    preferredContact: contextCustomer.preferredContact,
  };
};

// Convertir datos del contexto al formato del backend para crear venta
const convertContextSaleToBackend = (contextSale: Omit<Sale, "id">): any => {
  return {
    customerId: contextSale.customerId,
    customerName: contextSale.customerName,
    items: contextSale.items,
    subtotal: contextSale.subtotal,
    tax: contextSale.tax,
    total: contextSale.total,
    paymentMethod: contextSale.paymentMethod,
    status: contextSale.status,
    userId: contextSale.userId,
    notes: contextSale.notes,
  };
};

// Convertir Supplier del backend al formato del contexto
const convertBackendSupplierToContext = (backendSupplier: any): Supplier => {
  return {
    id: backendSupplier.id,
    name: backendSupplier.name,
    contactPerson: backendSupplier.contactPerson,
    email: backendSupplier.email,
    phone: backendSupplier.phone,
    address: backendSupplier.address,
    category: backendSupplier.category,
    status: backendSupplier.status,
    notes: backendSupplier.notes,
  };
};

// Convertir datos del contexto al formato del backend para crear proveedor
const convertContextSupplierToBackend = (
  contextSupplier: Omit<Supplier, "id">
): any => {
  return {
    name: contextSupplier.name,
    contactPerson: contextSupplier.contactPerson,
    email: contextSupplier.email,
    phone: contextSupplier.phone,
    address: contextSupplier.address,
    category: contextSupplier.category,
    status: contextSupplier.status || "active",
    notes: contextSupplier.notes,
  };
};

// ===== FUNCIÓN AUXILIAR PARA MANEJAR ERRORES DE BACKEND =====

const handleBackendError = (error: unknown, context: string): boolean => {
  const message = error instanceof Error ? error.message : String(error);
  const isBackendMissing =
    message.includes("Respuesta no JSON del servidor") ||
    message.includes(
      "La operación falló. El backend puede no estar implementado"
    ) ||
    message.includes("Failed to fetch") ||
    message.includes("NetworkError");

  if (isBackendMissing) {
    console.warn(
      `Backend no disponible/implementado para ${context}, usando API local como fallback`
    );
    return true;
  }
  console.error(`Error en ${context}:`, error);
  return false;
};

// Tipos de datos - Simplificados para que coincidan con la API
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

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  stock: number;
  brand: string;
}

// Customer simplificado para que coincida con la API real
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

const BACKEND_ENABLED = isBackendEnabled();
export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  engine: string;
  mileage: number;
  lastService: string;
  nextService: string;
  oilType: string;
  filterType: string;
  color?: string;
  customerId?: string;
}

// Sale simplificado para que coincida con la API real
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

// Usar el tipo Supplier de la API para evitar incompatibilidades

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "cashier" | "manager";
  status: "active" | "inactive";
}

// Interfaz del contexto
interface POSContextType {
  // Productos
  products: Product[];
  loadingProducts: boolean;
  errorProducts: string | null;
  refreshProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, "id">) => Promise<Product>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;

  // Carrito
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;

  // Clientes
  customers: Customer[];
  loadingCustomers: boolean;
  errorCustomers: string | null;
  refreshCustomers: () => Promise<void>;
  addCustomer: (customer: Omit<Customer, "id">) => Promise<Customer>;
  updateCustomer: (
    id: string,
    customer: Partial<Customer>
  ) => Promise<Customer>;
  deleteCustomer: (id: string) => Promise<void>;
  selectedCustomer: Customer | null;
  setSelectedCustomer: React.Dispatch<React.SetStateAction<Customer | null>>;

  // Ventas
  sales: Sale[];
  loadingSales: boolean;
  errorSales: string | null;
  refreshSales: () => Promise<void>;
  addSale: (sale: Omit<Sale, "id" | "date" | "invoiceNumber">) => Promise<Sale>;

  // Proveedores
  suppliers: Supplier[];
  loadingSuppliers: boolean;
  errorSuppliers: string | null;
  refreshSuppliers: () => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, "id">) => Promise<Supplier>;
  updateSupplier: (
    id: string,
    supplier: Partial<Supplier>
  ) => Promise<Supplier>;
  deleteSupplier: (id: string) => Promise<void>;

  // Usuarios
  users: User[];
  loadingUsers: boolean;
  errorUsers: string | null;
  refreshUsers: () => Promise<void>;
  addUser: (user: Omit<User, "id">) => Promise<User>;
  updateUser: (id: string, user: Partial<User>) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;

  // Categoría seleccionada
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;

  // Nuevas propiedades agregadas
  cartItemCount: number;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

// Crear el contexto
const POSContext = createContext<POSContextType | undefined>(undefined);

// Hook personalizado para usar el contexto
export const usePOS = () => {
  const context = useContext(POSContext);
  if (context === undefined) {
    throw new Error("usePOS debe ser usado dentro de un POSProvider");
  }
  return context;
};

// Funciones de conversión para mapear entre tipos de API y contexto
const convertApiCustomerToContextCustomer = (apiCustomer: any): Customer => {
  return {
    id: apiCustomer.id,
    name: apiCustomer.name,
    email: apiCustomer.email || "",
    phone: apiCustomer.phone || "",
    address: apiCustomer.address || "",
    city: apiCustomer.city || "",
    idNumber: apiCustomer.idNumber || "",
    customerType: apiCustomer.customerType as "individual" | "business",
    businessName: apiCustomer.businessName,
    ruc: apiCustomer.ruc,
    vehicles: apiCustomer.vehicles || [],
    totalPurchases: apiCustomer.totalPurchases || 0,
    lastPurchase: apiCustomer.lastPurchase || "",
    registrationDate: apiCustomer.registrationDate || "",
    status: apiCustomer.status as "active" | "inactive",
    notes: apiCustomer.notes || "",
    preferredContact:
      (apiCustomer.preferredContact as "phone" | "email" | "whatsapp") ||
      "phone",
  };
};

const convertContextCustomerToApiCustomer = (
  contextCustomer: Omit<Customer, "id">
): any => {
  return {
    name: contextCustomer.name,
    email: contextCustomer.email,
    phone: contextCustomer.phone,
    address: contextCustomer.address,
    city: contextCustomer.city,
    idNumber: contextCustomer.idNumber,
    customerType: contextCustomer.customerType,
    businessName: contextCustomer.businessName,
    ruc: contextCustomer.ruc,
    vehicles: contextCustomer.vehicles,
    totalPurchases: contextCustomer.totalPurchases,
    lastPurchase: contextCustomer.lastPurchase,
    registrationDate: contextCustomer.registrationDate,
    status: contextCustomer.status,
    notes: contextCustomer.notes,
    preferredContact: contextCustomer.preferredContact,
  };
};

const convertApiSaleToContextSale = (apiSale: any): Sale => {
  return {
    id: apiSale.id,
    date: apiSale.date,
    customerId: apiSale.customerId,
    customerName: apiSale.customerName,
    items: apiSale.items || [],
    subtotal: apiSale.subtotal || 0,
    tax: apiSale.tax || 0,
    total: apiSale.total || 0,
    paymentMethod: apiSale.paymentMethod as
      | "efectivo"
      | "tarjeta"
      | "transferencia"
      | "crédito",
    status: apiSale.status as "completada" | "anulada" | "pendiente",
    userId: apiSale.userId || "",
    invoiceNumber: apiSale.invoiceNumber || "",
    notes: apiSale.notes,
  };
};

const convertContextSaleToApiSale = (
  contextSale: Omit<Sale, "id" | "date" | "invoiceNumber">
): any => {
  return {
    customerId: contextSale.customerId,
    customerName: contextSale.customerName,
    items: contextSale.items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
    })),
    subtotal: contextSale.subtotal,
    tax: contextSale.tax,
    total: contextSale.total,
    paymentMethod: contextSale.paymentMethod,
    status: contextSale.status,
    userId: contextSale.userId,
    notes: contextSale.notes,
    date: new Date().toISOString(),
    invoiceNumber: generateInvoiceNumber(),
  };
};

const convertBackendUserToContext = (backendUser: any): User => {
  const roleMap: Record<string, "admin" | "cashier" | "manager"> = {
    admin: "admin",
    seller: "cashier",
  };

  return {
    id: backendUser.id,
    name: backendUser.name,
    email: backendUser.email,
    role: roleMap[backendUser.role] || "cashier",
    status: "active",
  };
};

const convertContextUserToBackend = (
  contextUser: Omit<User, "id">
): Omit<any, "id" | "createdAt" | "updatedAt"> => {
  const roleMap: Record<string, "admin" | "seller"> = {
    admin: "admin",
    cashier: "seller",
    manager: "seller",
  };

  return {
    name: contextUser.name,
    email: contextUser.email,
    role: roleMap[contextUser.role] || "seller",
  };
};

const convertPartialContextUserToBackend = (
  contextUser: Partial<User>
): Partial<any> => {
  const roleMap: Record<string, "admin" | "seller"> = {
    admin: "admin",
    cashier: "seller",
    manager: "seller",
  };

  return {
    name: contextUser.name,
    email: contextUser.email,
    role: contextUser.role ? roleMap[contextUser.role] || "seller" : undefined,
  };
};

// Exportar funciones de conversión para uso en otros servicios
export { convertBackendUserToContext, convertContextUserToBackend };

// Proveedor del contexto
export function POSProvider({ children }: { children: ReactNode }) {
  // Estados para productos
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState<string | null>(null);

  // Nuevo estado para búsqueda
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Estados para carrito
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Calcular el count del carrito
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Estados para clientes
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [errorCustomers, setErrorCustomers] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  // Estados para ventas
  const [sales, setSales] = useState<Sale[]>([]);
  const [loadingSales, setLoadingSales] = useState(true);
  const [errorSales, setErrorSales] = useState<string | null>(null);

  // Estados para proveedores
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [errorSuppliers, setErrorSuppliers] = useState<string | null>(null);

  // Estados para usuarios
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState<string | null>(null);

  // Estado para categoría seleccionada
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Calcular el total del carrito
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Funciones para productos - CON useCallback
  const refreshProducts = useCallback(async () => {
    setLoadingProducts(true);
    setErrorProducts(null);
    if (!BACKEND_ENABLED) {
      try {
        const localProducts = await api.getProducts();
        setProducts(localProducts);
      } finally {
        setLoadingProducts(false);
      }
      return;
    }
    try {
      // Usar backend API en lugar de API local
      const backendProducts = await backendApi.getProducts();
      const contextProducts = backendProducts.data.map(
        convertBackendProductToContext
      );
      setProducts(contextProducts);
    } catch (error) {
      // Manejar error de backend no implementado
      const isBackendNotImplemented = handleBackendError(
        error,
        "cargar productos"
      );
      if (!isBackendNotImplemented) {
        setErrorProducts("Error al cargar los productos");
      }
      // Fallback a API local si falla el backend
      try {
        const localProducts = await api.getProducts();
        setProducts(localProducts);
      } catch (localError) {
        console.error("Error con API local también:", localError);
      }
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const addProduct = useCallback(async (product: Omit<Product, "id">) => {
    try {
      if (!product.name || !product.category || !product.brand)
        throw new Error("Datos inválidos");
      if (product.price < 0 || product.cost < 0)
        throw new Error("Valores inválidos");
      if (!product.sku) throw new Error("SKU requerido");

      // Intentar crear con backend API primero
      const backendProductData = convertContextProductToBackend(product);
      const newBackendProduct = await backendApi.createProduct(
        backendProductData
      );
      const contextProduct = convertBackendProductToContext(
        newBackendProduct.data
      );

      setProducts((prev) => [...prev, contextProduct]);
      return contextProduct;
    } catch (error) {
      console.error("Error añadiendo producto con backend:", error);
      // Fallback a API local
      try {
        const newProduct = await api.createProduct(product);
        setProducts((prev) => [...prev, newProduct]);
        return newProduct;
      } catch (localError) {
        console.error("Error con API local también:", localError);
        throw error;
      }
    }
  }, []);

  const updateProduct = useCallback(
    async (id: string, product: Partial<Product>) => {
      try {
        if (product.price !== undefined && product.price < 0)
          throw new Error("Precio inválido");
        if (product.cost !== undefined && product.cost < 0)
          throw new Error("Costo inválido");
        const updatedProduct = await api.updateProduct(id, product);
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? updatedProduct : p))
        );

        // Actualizar el carrito si el producto está en él
        setCartItems((prev) =>
          prev.map((item) => {
            if (item.id === id) {
              return {
                ...item,
                name: updatedProduct.name,
                price: updatedProduct.price,
                stock: updatedProduct.stock,
                category: updatedProduct.category,
                brand: updatedProduct.brand,
              };
            }
            return item;
          })
        );

        return updatedProduct;
      } catch (error) {
        console.error("Error actualizando producto:", error);
        throw error;
      }
    },
    []
  );

  const deleteProduct = useCallback(async (id: string) => {
    try {
      await api.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setCartItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error eliminando producto:", error);
      throw error;
    }
  }, []);

  // Funciones para clientes - CON useCallback
  const refreshCustomers = useCallback(async () => {
    setLoadingCustomers(true);
    setErrorCustomers(null);
    if (!BACKEND_ENABLED) {
      try {
        const data = await api.getCustomers();
        const convertedCustomers = data.map(
          convertApiCustomerToContextCustomer
        );
        setCustomers(convertedCustomers);
      } finally {
        setLoadingCustomers(false);
      }
      return;
    }
    try {
      // Usar backend API en lugar de API local
      const backendCustomers = await backendApi.getCustomers();
      const contextCustomers = backendCustomers.data.map(
        convertBackendCustomerToContext
      );
      setCustomers(contextCustomers);
    } catch (error) {
      // Manejar error de backend no implementado
      const isBackendNotImplemented = handleBackendError(
        error,
        "cargar clientes"
      );
      if (!isBackendNotImplemented) {
        setErrorCustomers("Error al cargar los clientes");
      }
      // Fallback a API local si falla el backend
      try {
        const data = await api.getCustomers();
        const convertedCustomers = data.map(
          convertApiCustomerToContextCustomer
        );
        setCustomers(convertedCustomers);
      } catch (localError) {
        console.error("Error con API local también:", localError);
      }
    } finally {
      setLoadingCustomers(false);
    }
  }, []);

  const addCustomer = useCallback(async (customer: Omit<Customer, "id">) => {
    try {
      if (!customer.name || !customer.idNumber)
        throw new Error("Datos inválidos");
      if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email))
        throw new Error("Email inválido");
      if (customer.phone && customer.phone.length < 7)
        throw new Error("Teléfono inválido");

      const BACKEND_ENABLED = isBackendEnabled();
      if (BACKEND_ENABLED) {
        const backendCustomerData = convertContextCustomerToBackend(customer);
        const newBackendCustomer = await backendApi.createCustomer(
          backendCustomerData
        );
        const contextCustomer = convertBackendCustomerToContext(
          newBackendCustomer.data
        );
        setCustomers((prev) => [...prev, contextCustomer]);
        return contextCustomer;
      }
      const apiCustomer = convertContextCustomerToApiCustomer(customer);
      const newApiCustomer = await api.createCustomer(apiCustomer);
      const newCustomer = convertApiCustomerToContextCustomer(newApiCustomer);
      setCustomers((prev) => [...prev, newCustomer]);
      return newCustomer;
    } catch (error) {
      console.error("Error añadiendo cliente con backend:", error);
      // Fallback a API local
      try {
        const apiCustomer = convertContextCustomerToApiCustomer(customer);
        const newApiCustomer = await api.createCustomer(apiCustomer);
        const newCustomer = convertApiCustomerToContextCustomer(newApiCustomer);
        setCustomers((prev) => [...prev, newCustomer]);
        return newCustomer;
      } catch (localError) {
        console.error("Error con API local también:", localError);
        throw error;
      }
    }
  }, []);

  const updateCustomer = useCallback(
    async (id: string, customer: Partial<Customer>) => {
      try {
        if (
          customer.email &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)
        )
          throw new Error("Email inválido");
        if (customer.phone && customer.phone.length < 7)
          throw new Error("Teléfono inválido");
        const apiCustomer = convertContextCustomerToApiCustomer(
          customer as Omit<Customer, "id">
        );
        const updatedApiCustomer = await api.updateCustomer(id, apiCustomer);
        const updatedCustomer =
          convertApiCustomerToContextCustomer(updatedApiCustomer);
        setCustomers((prev) =>
          prev.map((c) => (c.id === id ? updatedCustomer : c))
        );

        if (selectedCustomer?.id === id) {
          setSelectedCustomer(updatedCustomer);
        }

        return updatedCustomer;
      } catch (error) {
        console.error("Error actualizando cliente:", error);
        throw error;
      }
    },
    [selectedCustomer]
  );

  const deleteCustomer = useCallback(
    async (id: string) => {
      try {
        await api.deleteCustomer(id);
        setCustomers((prev) => prev.filter((c) => c.id !== id));
        if (selectedCustomer?.id === id) {
          setSelectedCustomer(null);
        }
      } catch (error) {
        console.error("Error eliminando cliente:", error);
        throw error;
      }
    },
    [selectedCustomer]
  );

  // Funciones para ventas - CON useCallback
  const refreshSales = useCallback(async () => {
    setLoadingSales(true);
    setErrorSales(null);
    if (!BACKEND_ENABLED) {
      try {
        const data = await api.getSales();
        const convertedSales = data.map(convertApiSaleToContextSale);
        setSales(convertedSales);
      } finally {
        setLoadingSales(false);
      }
      return;
    }
    try {
      // Usar backend API en lugar de API local
      const backendSales = await backendApi.getSales();
      const contextSales = backendSales.data.map(convertBackendSaleToContext);
      setSales(contextSales);
    } catch (error) {
      // Manejar error de backend no implementado
      const isBackendNotImplemented = handleBackendError(
        error,
        "cargar ventas"
      );
      if (!isBackendNotImplemented) {
        setErrorSales("Error al cargar las ventas");
      }
      // Fallback a API local si falla el backend
      try {
        const data = await api.getSales();
        const convertedSales = data.map(convertApiSaleToContextSale);
        setSales(convertedSales);
      } catch (localError) {
        console.error("Error con API local también:", localError);
      }
    } finally {
      setLoadingSales(false);
    }
  }, []);

  const addSale = useCallback(
    async (sale: Omit<Sale, "id" | "date" | "invoiceNumber">) => {
      try {
        if (!sale.items || sale.items.length === 0)
          throw new Error("Venta vacía");
        if (sale.total < 0) throw new Error("Total inválido");
        const saleWithDetails = {
          ...sale,
          invoiceNumber: generateInvoiceNumber(),
          date: new Date().toISOString(),
        };

        const backendSaleData = convertContextSaleToBackend(saleWithDetails);
        const newBackendSale = await backendApi.createSale(backendSaleData);
        const contextSale = convertBackendSaleToContext(newBackendSale.data);

        setSales((prev) => [contextSale, ...prev]);

        // Actualizar stock de productos
        for (const item of sale.items) {
          const product = products.find((p) => p.id === item.productId);
          if (product) {
            await updateProduct(item.productId, {
              stock: product.stock - item.quantity,
            });
          }
        }

        // Forzar actualización de productos también
        await refreshProducts();

        return contextSale;
      } catch (error) {
        console.error(
          "Error registrando venta con backend, fallback a API local:",
          error
        );
        try {
          const apiSaleData = convertContextSaleToApiSale(sale);
          const newSale = await api.createSale(apiSaleData);
          const contextSale = convertApiSaleToContextSale(newSale);

          setSales((prev) => [contextSale, ...prev]);

          for (const item of sale.items) {
            const product = products.find((p) => p.id === item.productId);
            if (product) {
              await updateProduct(item.productId, {
                stock: product.stock - item.quantity,
              });
            }
          }
          await refreshProducts();

          return contextSale;
        } catch (localError) {
          console.error("Error registrando venta con API local:", localError);
          throw localError;
        }
      }
    },
    [products, updateProduct, refreshProducts]
  );

  // Funciones para proveedores - CON useCallback
  const refreshSuppliers = useCallback(async () => {
    setLoadingSuppliers(true);
    setErrorSuppliers(null);
    if (!BACKEND_ENABLED) {
      try {
        const localSuppliers = await api.getSuppliers();
        setSuppliers(localSuppliers);
      } finally {
        setLoadingSuppliers(false);
      }
      return;
    }
    try {
      const backendSuppliers = await backendApi.getSuppliers();
      const contextSuppliers = backendSuppliers.data.map(
        convertBackendSupplierToContext
      );
      setSuppliers(contextSuppliers);
    } catch (error) {
      // Manejar error de backend no implementado
      const isBackendNotImplemented = handleBackendError(
        error,
        "cargar proveedores"
      );
      if (!isBackendNotImplemented) {
        setErrorSuppliers("Error al cargar los proveedores");
      }
      // Fallback a API local si falla el backend
      try {
        const localSuppliers = await api.getSuppliers();
        setSuppliers(localSuppliers);
      } catch (localError) {
        console.error("Error con API local también:", localError);
      }
    } finally {
      setLoadingSuppliers(false);
    }
  }, []);

  const addSupplier = useCallback(async (supplier: Omit<Supplier, "id">) => {
    try {
      if (!supplier.name || !supplier.contactPerson || !supplier.email)
        throw new Error("Datos inválidos");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supplier.email))
        throw new Error("Email inválido");

      // Intentar crear con el backend primero
      const backendSupplierData = convertContextSupplierToBackend(supplier);
      const newBackendSupplier = await backendApi.createSupplier(
        backendSupplierData
      );
      const contextSupplier = convertBackendSupplierToContext(
        newBackendSupplier.data
      );

      setSuppliers((prev) => [...prev, contextSupplier]);
      return contextSupplier;
    } catch (error) {
      console.error("Error añadiendo proveedor con backend:", error);

      // Fallback a API local
      try {
        const localSupplier = await api.createSupplier(supplier);
        setSuppliers((prev) => [...prev, localSupplier]);
        return localSupplier;
      } catch (localError) {
        console.error("Error con API local también:", localError);
        throw error; // Lanzar el error original del backend
      }
    }
  }, []);

  const updateSupplier = useCallback(
    async (id: string, supplier: Partial<Supplier>) => {
      try {
        if (
          supplier.email &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supplier.email)
        )
          throw new Error("Email inválido");

        // Intentar actualizar con el backend primero
        const updatedBackendSupplier = await backendApi.updateSupplier(
          id,
          supplier
        );
        const contextSupplier = convertBackendSupplierToContext(
          updatedBackendSupplier.data
        );

        setSuppliers((prev) =>
          prev.map((s) => (s.id === id ? contextSupplier : s))
        );
        return contextSupplier;
      } catch (error) {
        console.error("Error actualizando proveedor con backend:", error);

        // Fallback a API local
        try {
          const updatedLocalSupplier = await api.updateSupplier(id, supplier);
          setSuppliers((prev) =>
            prev.map((s) => (s.id === id ? updatedLocalSupplier : s))
          );
          return updatedLocalSupplier;
        } catch (localError) {
          console.error("Error con API local también:", localError);
          throw error; // Lanzar el error original del backend
        }
      }
    },
    []
  );

  const deleteSupplier = useCallback(async (id: string) => {
    try {
      // Intentar eliminar con el backend primero
      await backendApi.deleteSupplier(id);
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Error eliminando proveedor con backend:", error);

      // Fallback a API local
      try {
        await api.deleteSupplier(id);
        setSuppliers((prev) => prev.filter((s) => s.id !== id));
      } catch (localError) {
        console.error("Error con API local también:", localError);
        throw error; // Lanzar el error original del backend
      }
    }
  }, []);

  // Funciones para usuarios - CON useCallback
  const refreshUsers = useCallback(async () => {
    setLoadingUsers(true);
    setErrorUsers(null);
    if (!BACKEND_ENABLED) {
      try {
        const localUsers = await api.getUsers();
        setUsers(localUsers);
      } finally {
        setLoadingUsers(false);
      }
      return;
    }
    try {
      const backendUsers = await backendApi.getUsers();
      const contextUsers = backendUsers.data.map(convertBackendUserToContext);
      setUsers(contextUsers);
    } catch (error) {
      // Manejar error de backend no implementado
      const isBackendNotImplemented = handleBackendError(
        error,
        "cargar usuarios"
      );
      if (!isBackendNotImplemented) {
        setErrorUsers("Error al cargar los usuarios");
      }

      // Fallback a API local
      try {
        const localUsers = await api.getUsers();
        setUsers(localUsers);
      } catch (localError) {
        console.error("Error con API local también:", localError);
      }
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const addUser = useCallback(async (user: Omit<User, "id">) => {
    try {
      if (!user.name || !user.email) throw new Error("Datos inválidos");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email))
        throw new Error("Email inválido");

      // Intentar crear con el backend primero
      const newBackendUser = await backendApi.createUser(
        convertContextUserToBackend(user)
      );
      const contextUser = convertBackendUserToContext(newBackendUser.data);

      setUsers((prev) => [...prev, contextUser]);
      return contextUser;
    } catch (error) {
      console.error("Error añadiendo usuario con backend:", error);

      // Fallback a API local
      try {
        const localUser = await api.createUser(user);
        setUsers((prev) => [...prev, localUser]);
        return localUser;
      } catch (localError) {
        console.error("Error con API local también:", localError);
        throw error; // Lanzar el error original del backend
      }
    }
  }, []);

  const updateUser = useCallback(async (id: string, user: Partial<User>) => {
    try {
      if (user.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email))
        throw new Error("Email inválido");

      // Intentar actualizar con el backend primero
      const updatedBackendUser = await backendApi.updateUser(
        id,
        convertPartialContextUserToBackend(user)
      );
      const contextUser = convertBackendUserToContext(updatedBackendUser.data);

      setUsers((prev) => prev.map((u) => (u.id === id ? contextUser : u)));
      return contextUser;
    } catch (error) {
      console.error("Error actualizando usuario con backend:", error);

      // Fallback a API local
      try {
        const updatedLocalUser = await api.updateUser(id, user);
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? updatedLocalUser : u))
        );
        return updatedLocalUser;
      } catch (localError) {
        console.error("Error con API local también:", localError);
        throw error; // Lanzar el error original del backend
      }
    }
  }, []);

  const deleteUser = useCallback(async (id: string) => {
    try {
      // Intentar eliminar con el backend primero
      await backendApi.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (error) {
      console.error("Error eliminando usuario con backend:", error);

      // Fallback a API local
      try {
        await api.deleteUser(id);
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } catch (localError) {
        console.error("Error con API local también:", localError);
        throw error; // Lanzar el error original del backend
      }
    }
  }, []);

  // Funciones para el carrito
  const addToCart = useCallback((product: Product) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          category: product.category,
          stock: product.stock,
          brand: product.brand,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== id));
    } else {
      setCartItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setSelectedCustomer(null);
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      await refreshProducts();
      await refreshCustomers();
      await refreshSales();
      await refreshSuppliers();
      await refreshUsers();
    };

    loadData();
  }, [
    refreshProducts,
    refreshCustomers,
    refreshSales,
    refreshSuppliers,
    refreshUsers,
  ]);

  const value = {
    // Productos
    products,
    loadingProducts,
    errorProducts,
    refreshProducts,
    addProduct,
    updateProduct,
    deleteProduct,

    // Carrito
    cartItems,
    addToCart,
    updateQuantity,
    clearCart,
    cartTotal,

    // Clientes
    customers,
    loadingCustomers,
    errorCustomers,
    refreshCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    selectedCustomer,
    setSelectedCustomer,

    // Ventas
    sales,
    loadingSales,
    errorSales,
    refreshSales,
    addSale,

    // Proveedores
    suppliers,
    loadingSuppliers,
    errorSuppliers,
    refreshSuppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,

    // Usuarios
    users,
    loadingUsers,
    errorUsers,
    refreshUsers,
    addUser,
    updateUser,
    deleteUser,

    // Categoría seleccionada
    selectedCategory,
    setSelectedCategory,

    // Nuevos valores agregados
    cartItemCount,
    searchQuery,
    setSearchQuery,
  };

  return <POSContext.Provider value={value}>{children}</POSContext.Provider>;
}
