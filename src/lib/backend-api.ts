import type { StockAlert } from "./api";

export interface SaleFilters {
  startDate?: string;
  endDate?: string;
  customerId?: string;
  productId?: string;
}

export interface SalesAnalytics {
  dailySales: { date: string; amount: number; count: number }[];
  monthlySales: { month: string; amount: number; count: number }[];
  topCustomers: {
    name: string;
    totalPurchases: number;
    lastPurchase: string;
  }[];
  paymentMethods: { method: string; amount: number; count: number }[];
  totalSales: number;
  totalRevenue: number;
  averageTicket: number;
  growthRate: number;
}

export interface InventoryAnalytics {
  categoryDistribution: { name: string; value: number }[];
  stockLevels: { name: string; value: number }[];
  topSellingProducts: { name: string; value: number }[];
  lowStockProducts: { name: string; value: number }[];
  inventoryValue: { name: string; value: number }[];
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface CustomerAnalytics {
  totalCustomers: number;
  newCustomersThisMonth: number;
  activeCustomers: number;
  inactiveCustomers: number;
  topCustomers: {
    name: string;
    totalPurchases: number;
    lastPurchase: string | null;
  }[];
  customerGrowth: { month: string; count: number }[];
}

export interface LoginRequest {
  email: string;
  password?: string;
  local?: boolean;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  stock: number;
  category?: string;
  barcode?: string;
  supplierId?: string;
  imageUrl?: string;
  brand?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  ruc?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
  customerId?: string;
  customer?: Customer;
  products: { productId: string; quantity: number; price: number }[];
  total: number;
  paymentMethod: "cash" | "card" | "transfer";
  status: "completed" | "pending" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "seller";
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  product?: Product;
  type: "purchase" | "sale" | "adjustment";
  quantity: number;
  reason?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

const FALLBACK_ERROR_MESSAGE =
  "La operación falló. El backend puede no estar implementado. Usando datos locales.";

export function isBackendEnabled() {
  const flag = process.env.NEXT_PUBLIC_BACKEND_ENABLED;
  return flag === "true";
}

class BackendApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.loadToken();
  }

  private loadToken() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("authToken");
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
    }
  }

  // Sobrecargas para el método request
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>>;
  private async request<T>(
    endpoint: string,
    options: RequestInit,
    isPaginated: true
  ): Promise<PaginatedResponse<T>>;
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isPaginated?: boolean
  ): Promise<ApiResponse<T> | PaginatedResponse<T>> {
    if (!isBackendEnabled()) {
      throw new Error(FALLBACK_ERROR_MESSAGE);
    }
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (options.body !== undefined) {
      headers["Content-Type"] = "application/json";
    }
    headers["Accept"] = "application/json";

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, { ...options, headers, signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404 || response.status === 501) {
          console.warn(
            `Endpoint ${endpoint} no encontrado o no implementado. Status: ${response.status}`
          );
          throw new Error(FALLBACK_ERROR_MESSAGE);
        }
        throw new Error(
          `Error HTTP: ${response.status} ${response.statusText}`
        );
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.warn(
          `Respuesta no JSON recibida de ${endpoint}:`,
          text.substring(0, 200)
        );
        throw new Error(
          `Respuesta no JSON del servidor. El backend puede no estar implementado. Content-Type: ${contentType}`
        );
      }

      const data = await response.json();

      if (isPaginated) {
        return data as PaginatedResponse<T>;
      }
      return { data: data.data } as ApiResponse<T>;
    } catch (error) {
      const msg = (error as Error)?.message || String(error);
      if (
        msg.includes("Failed to fetch") ||
        msg.includes("NetworkError") ||
        msg.includes("The user aborted a request")
      ) {
        console.warn(`No se pudo conectar al backend en ${endpoint}.`, error as Error);
        throw new Error(FALLBACK_ERROR_MESSAGE);
      }
      console.error(`Error en la petición a ${endpoint}:`, error);
      throw error;
    }
  }

  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    const response = await this.request<void>("/auth/logout", {
      method: "POST",
    });
    this.clearToken();
    return response;
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return this.request<{ token: string }>("/auth/refresh", { method: "POST" });
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.request<User>("/auth/profile");
  }

  async getProducts(
    page: number = 1,
    limit: number = 10,
    filters: any = {}
  ): Promise<PaginatedResponse<Product>> {
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...filters,
    }).toString();
    return this.request<Product>(`/products?${query}`, {}, true);
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return this.request<Product>(`/products/${id}`);
  }

  async createProduct(
    productData: Omit<Product, "id" | "createdAt" | "updatedAt">
  ): Promise<ApiResponse<Product>> {
    return this.request<Product>("/products", {
      method: "POST",
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(
    id: string,
    productData: Partial<Product>
  ): Promise<ApiResponse<Product>> {
    return this.request<Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/products/${id}`, { method: "DELETE" });
  }

  async getCustomers(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Customer>> {
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    }).toString();
    return this.request<Customer>(`/customers?${query}`, {}, true);
  }

  async getCustomer(id: string): Promise<ApiResponse<Customer>> {
    return this.request<Customer>(`/customers/${id}`);
  }

  async createCustomer(
    customerData: Omit<Customer, "id" | "createdAt" | "updatedAt">
  ): Promise<ApiResponse<Customer>> {
    return this.request<Customer>("/customers", {
      method: "POST",
      body: JSON.stringify(customerData),
    });
  }

  async updateCustomer(
    id: string,
    customerData: Partial<Customer>
  ): Promise<ApiResponse<Customer>> {
    return this.request<Customer>(`/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(customerData),
    });
  }

  async deleteCustomer(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/customers/${id}`, { method: "DELETE" });
  }

  async getSuppliers(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Supplier>> {
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    }).toString();
    return this.request<Supplier>(`/suppliers?${query}`, {}, true);
  }

  async createSupplier(
    supplierData: Omit<Supplier, "id" | "createdAt" | "updatedAt">
  ): Promise<ApiResponse<Supplier>> {
    return this.request<Supplier>("/suppliers", {
      method: "POST",
      body: JSON.stringify(supplierData),
    });
  }

  async updateSupplier(
    id: string,
    supplierData: Partial<Supplier>
  ): Promise<ApiResponse<Supplier>> {
    return this.request<Supplier>(`/suppliers/${id}`, {
      method: "PUT",
      body: JSON.stringify(supplierData),
    });
  }

  async deleteSupplier(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/suppliers/${id}`, { method: "DELETE" });
  }

  async getSales(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Sale>> {
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    }).toString();
    return this.request<Sale>(`/sales?${query}`, {}, true);
  }

  async getSale(id: string): Promise<ApiResponse<Sale>> {
    return this.request<Sale>(`/sales/${id}`);
  }

  async createSale(
    saleData: Omit<Sale, "id" | "createdAt" | "updatedAt">
  ): Promise<ApiResponse<Sale>> {
    return this.request<Sale>("/sales", {
      method: "POST",
      body: JSON.stringify(saleData),
    });
  }

  async getUsers(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<User>> {
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    }).toString();
    return this.request<User>(`/users?${query}`, {}, true);
  }

  async createUser(
    userData: Omit<User, "id" | "createdAt" | "updatedAt">
  ): Promise<ApiResponse<User>> {
    return this.request<User>("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async updateUser(
    id: string,
    userData: Partial<User>
  ): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/users/${id}`, { method: "DELETE" });
  }

  async getStockMovements(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<StockMovement>> {
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    }).toString();
    return this.request<StockMovement>(`/stock-movements?${query}`, {}, true);
  }

  async createStockMovement(
    movementData: Omit<StockMovement, "id" | "createdAt">
  ): Promise<ApiResponse<StockMovement>> {
    return this.request<StockMovement>("/stock-movements", {
      method: "POST",
      body: JSON.stringify(movementData),
    });
  }

  async getSalesAnalytics(
    filters?: SaleFilters
  ): Promise<ApiResponse<SalesAnalytics>> {
    const query = new URLSearchParams(filters as any).toString();
    return this.request<SalesAnalytics>(`/reports/sales-analytics?${query}`);
  }

  async getInventoryAnalytics(): Promise<ApiResponse<InventoryAnalytics>> {
    return this.request<InventoryAnalytics>(`/reports/inventory-analytics`);
  }

  async getCustomerAnalytics(): Promise<ApiResponse<CustomerAnalytics>> {
    return this.request<CustomerAnalytics>(`/reports/customer-analytics`);
  }

  async getStockAlerts(): Promise<StockAlert[]> {
    const res = await this.request<StockAlert[]>(`/alerts/stock`);
    return (res as ApiResponse<StockAlert[]>).data;
  }

  async resolveStockAlert(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/alerts/${id}/resolve`, { method: "POST" });
  }
}

export const backendApi = new BackendApiService(
  process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.REACT_APP_BACKEND_URL ||
    "http://localhost:3001/api"
);
