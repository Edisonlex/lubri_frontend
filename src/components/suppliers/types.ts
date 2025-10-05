export interface SupplierFormData {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  status: string;
  businessName?: string;
  city?: string;
  taxId?: string;
  contactPhone?: string;
  website?: string;
  paymentTerms?: string;
  deliveryTime?: string;
  minimumOrder?: number;
  rating?: number;
  notes?: string;
}

export interface ExtendedSupplierData {
  businessName?: string;
  city?: string;
  taxId?: string;
  contactPhone?: string;
  website?: string;
  paymentTerms?: string;
  deliveryTime?: string;
  minimumOrder?: number;
  rating?: number;
  additionalNotes?: string;
}

export const supplierCategories = [
  { value: "lubricants", label: "Lubricantes" },
  { value: "filters", label: "Filtros" },
  { value: "parts", label: "Repuestos" },
  { value: "tools", label: "Herramientas" },
  { value: "chemicals", label: "Químicos" },
  { value: "accessories", label: "Accesorios" },
  { value: "equipment", label: "Equipos" },
  { value: "other", label: "Otros" },
];

export const paymentTermsOptions = [
  { value: "cash", label: "Contado" },
  { value: "15_days", label: "15 días" },
  { value: "30_days", label: "30 días" },
  { value: "45_days", label: "45 días" },
  { value: "60_days", label: "60 días" },
  { value: "90_days", label: "90 días" },
];

export const cities = [
  "Quito",
  "Guayaquil",
  "Cuenca",
  "Santo Domingo",
  "Machala",
  "Durán",
  "Manta",
  "Portoviejo",
  "Loja",
  "Ambato",
  "Riobamba",
  "Ibarra",
];
