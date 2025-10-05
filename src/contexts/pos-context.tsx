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

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  status: "active" | "inactive";
  notes?: string;
}

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
  setSelectedCustomer: (customer: Customer | null) => void;

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
  setSelectedCategory: (category: string) => void;

  // Nuevas propiedades agregadas
  cartItemCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
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
  };
};

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
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error cargando productos:", error);
      setErrorProducts("Error al cargar los productos");
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const addProduct = useCallback(async (product: Omit<Product, "id">) => {
    try {
      const newProduct = await api.createProduct(product);
      setProducts((prev) => [...prev, newProduct]);
      return newProduct;
    } catch (error) {
      console.error("Error añadiendo producto:", error);
      throw error;
    }
  }, []);

  const updateProduct = useCallback(
    async (id: string, product: Partial<Product>) => {
      try {
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
    try {
      const data = await api.getCustomers();
      const convertedCustomers = data.map(convertApiCustomerToContextCustomer);
      setCustomers(convertedCustomers);
    } catch (error) {
      console.error("Error cargando clientes:", error);
      setErrorCustomers("Error al cargar los clientes");
    } finally {
      setLoadingCustomers(false);
    }
  }, []);

  const addCustomer = useCallback(async (customer: Omit<Customer, "id">) => {
    try {
      const apiCustomer = convertContextCustomerToApiCustomer(customer);
      const newApiCustomer = await api.createCustomer(apiCustomer);
      const newCustomer = convertApiCustomerToContextCustomer(newApiCustomer);
      setCustomers((prev) => [...prev, newCustomer]);
      return newCustomer;
    } catch (error) {
      console.error("Error añadiendo cliente:", error);
      throw error;
    }
  }, []);

  const updateCustomer = useCallback(
    async (id: string, customer: Partial<Customer>) => {
      try {
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
    try {
      const data = await api.getSales();
      const convertedSales = data.map(convertApiSaleToContextSale);
      setSales(convertedSales);
    } catch (error) {
      console.error("Error cargando ventas:", error);
      setErrorSales("Error al cargar las ventas");
    } finally {
      setLoadingSales(false);
    }
  }, []);

  const addSale = useCallback(
    async (sale: Omit<Sale, "id" | "date" | "invoiceNumber">) => {
      try {
        console.log("Iniciando addSale con datos:", sale);

        const apiSale = convertContextSaleToApiSale(sale);
        console.log("Datos convertidos para API:", apiSale);

        const newApiSale = await api.createSale(apiSale);
        console.log("Respuesta de API:", newApiSale);

        const newSale = convertApiSaleToContextSale(newApiSale);
        console.log("Venta convertida para contexto:", newSale);

        // Actualizar el estado de ventas - AGREGAR AL INICIO del array
        setSales((prev) => {
          const newSales = [newSale, ...prev];
          console.log("Nuevo estado de ventas:", newSales);
          return newSales;
        });

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

        console.log("Venta agregada exitosamente");
        return newSale;
      } catch (error) {
        console.error("Error registrando venta:", error);
        throw error;
      }
    },
    [products, updateProduct, refreshProducts]
  );

  // Funciones para proveedores - CON useCallback
  const refreshSuppliers = useCallback(async () => {
    setLoadingSuppliers(true);
    setErrorSuppliers(null);
    try {
      const data = await api.getSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error("Error cargando proveedores:", error);
      setErrorSuppliers("Error al cargar los proveedores");
    } finally {
      setLoadingSuppliers(false);
    }
  }, []);

  const addSupplier = useCallback(async (supplier: Omit<Supplier, "id">) => {
    try {
      const newSupplier = await api.createSupplier(supplier);
      setSuppliers((prev) => [...prev, newSupplier]);
      return newSupplier;
    } catch (error) {
      console.error("Error añadiendo proveedor:", error);
      throw error;
    }
  }, []);

  const updateSupplier = useCallback(
    async (id: string, supplier: Partial<Supplier>) => {
      try {
        const updatedSupplier = await api.updateSupplier(id, supplier);
        setSuppliers((prev) =>
          prev.map((s) => (s.id === id ? updatedSupplier : s))
        );
        return updatedSupplier;
      } catch (error) {
        console.error("Error actualizando proveedor:", error);
        throw error;
      }
    },
    []
  );

  const deleteSupplier = useCallback(async (id: string) => {
    try {
      await api.deleteSupplier(id);
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Error eliminando proveedor:", error);
      throw error;
    }
  }, []);

  // Funciones para usuarios - CON useCallback
  const refreshUsers = useCallback(async () => {
    setLoadingUsers(true);
    setErrorUsers(null);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      setErrorUsers("Error al cargar los usuarios");
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const addUser = useCallback(async (user: Omit<User, "id">) => {
    try {
      const newUser = await api.createUser(user);
      setUsers((prev) => [...prev, newUser]);
      return newUser;
    } catch (error) {
      console.error("Error añadiendo usuario:", error);
      throw error;
    }
  }, []);

  const updateUser = useCallback(async (id: string, user: Partial<User>) => {
    try {
      const updatedUser = await api.updateUser(id, user);
      setUsers((prev) => prev.map((u) => (u.id === id ? updatedUser : u)));
      return updatedUser;
    } catch (error) {
      console.error("Error actualizando usuario:", error);
      throw error;
    }
  }, []);

  const deleteUser = useCallback(async (id: string) => {
    try {
      await api.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      throw error;
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
