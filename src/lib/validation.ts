import { z } from "zod";

const onlyDigits = (value: string) => value.replace(/[^0-9]/g, "");

const isValidProvinceCode = (code: number) => code >= 1 && code <= 24;

export const isValidEcuadorCedula = (cedulaRaw: string) => {
  const cedula = onlyDigits(cedulaRaw);
  if (!/^\d{10}$/.test(cedula)) return false;
  const province = parseInt(cedula.slice(0, 2), 10);
  if (!isValidProvinceCode(province)) return false;
  const third = parseInt(cedula[2], 10);
  if (third >= 6) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let num = parseInt(cedula[i], 10);
    if (i % 2 === 0) {
      num *= 2;
      if (num > 9) num -= 9;
    }
    sum += num;
  }
  const verifier = (10 - (sum % 10)) % 10;
  return verifier === parseInt(cedula[9], 10);
};

export const isValidEcuadorRuc = (rucRaw: string) => {
  const ruc = onlyDigits(rucRaw);
  if (!/^\d{13}$/.test(ruc)) return false;
  const province = parseInt(ruc.slice(0, 2), 10);
  if (!isValidProvinceCode(province)) return false;
  const third = parseInt(ruc[2], 10);

  const ends = parseInt(ruc.slice(10, 13), 10);
  if (!(ends >= 1 && ends <= 999)) return false;

  if (third < 6) {
    const cedulaPart = ruc.slice(0, 10);
    if (!isValidEcuadorCedula(cedulaPart)) return false;
    return ruc.slice(10, 13) !== "000";
  }

  if (third === 6) {
    const coef = [3, 2, 7, 9, 10, 5, 8, 4, 6, 3, 2];
    let sum = 0;
    for (let i = 0; i < 11; i++) sum += parseInt(ruc[i], 10) * coef[i];
    const mod = sum % 11;
    const verifier = mod === 0 ? 0 : 11 - mod;
    return verifier === parseInt(ruc[11], 10);
  }

  if (third === 9) {
    const coef = [4, 3, 2, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(ruc[i], 10) * coef[i];
    const mod = sum % 11;
    const verifier = mod === 0 ? 0 : 11 - mod;
    return verifier === parseInt(ruc[9], 10);
  }

  return false;
};

export const isValidEcuadorPhone = (phoneRaw: string) => {
  const digits = onlyDigits(phoneRaw);
  if (digits.startsWith("593")) {
    const local = digits.slice(3);
    if (!/^\d{9}$/.test(local)) return false;
    if (/^9\d{8}$/.test(local)) return true;
    if (/^[2-7]\d{7}$/.test(local)) return true;
    return false;
  }
  if (digits.startsWith("0")) {
    if (/^09\d{8}$/.test(digits)) return true;
    if (/^0[2-7]\d{7}$/.test(digits)) return true;
    return false;
  }
  return false;
};

export const plateRegex = /^[A-Z]{3}-?\d{3,4}$/;

export const userFormSchema = (opts: { requirePassword: boolean }) =>
  z.object({
    name: z.string().min(2, "Nombre muy corto"),
    email: z.string().email("Email inválido"),
    role: z.enum(["Administrador", "Cajero", "Técnico", "Supervisor"]),
    status: z.enum(["Activo", "Inactivo"]),
    password: opts.requirePassword
      ? z.string().min(6, "Contraseña mínima de 6 caracteres")
      : z.string().optional().or(z.literal("")),
  });

export const supplierFormSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  contactPerson: z.string().min(2, "Contacto requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().refine(isValidEcuadorPhone, {
    message: "Teléfono ecuatoriano inválido",
  }),
  address: z.string().min(4, "Dirección requerida"),
  category: z.string().min(1, "Categoría requerida"),
  status: z.enum(["active", "inactive"]),
  businessName: z.string().optional(),
  city: z.string().optional(),
  taxId: z
    .string()
    .optional()
    .refine((v) => !v || isValidEcuadorRuc(v), {
      message: "RUC inválido",
    }),
  contactPhone: z
    .string()
    .optional()
    .refine((v) => !v || isValidEcuadorPhone(v), {
      message: "Teléfono inválido",
    }),
  website: z
    .string()
    .optional()
    .refine((v) => !v || /^https?:\/\//.test(v), {
      message: "URL inválida",
    }),
  paymentTerms: z.string().optional(),
  deliveryTime: z.string().optional(),
  minimumOrder: z.number().min(0, "Pedido mínimo inválido").optional(),
  rating: z.number().min(1).max(5).optional(),
  notes: z.string().optional(),
});

export const vehicleSchema = z.object({
  brand: z.string().min(1, "Marca requerida"),
  model: z.string().min(1, "Modelo requerido"),
  year: z
    .number()
    .min(1900, "Año inválido")
    .max(new Date().getFullYear() + 1, "Año inválido"),
  plate: z
    .string()
    .refine((v) => plateRegex.test(v.toUpperCase()), {
      message: "Placa inválida",
    }),
  engine: z.string().optional(),
  mileage: z.number().min(0).optional(),
  lastService: z.string().optional(),
  nextService: z.string().optional(),
  oilType: z.string().optional(),
  filterType: z.string().optional(),
  color: z.string().optional(),
});

export const customerFormSchema = z
  .object({
    name: z.string().min(2, "Nombre requerido"),
    email: z.string().email("Email inválido"),
    phone: z.string().refine(isValidEcuadorPhone, {
      message: "Teléfono ecuatoriano inválido",
    }),
    address: z.string().min(4, "Dirección requerida"),
    city: z.string().min(2, "Ciudad requerida"),
    idNumber: z.string(),
    customerType: z.enum(["individual", "business"]),
    businessName: z.string().optional(),
    ruc: z.string().optional(),
    notes: z.string().optional(),
    preferredContact: z.enum(["phone", "email", "whatsapp"]),
    status: z.enum(["active", "inactive"]),
    vehicles: z.array(vehicleSchema),
  })
  .superRefine((data, ctx) => {
    if (data.customerType === "individual") {
      if (!isValidEcuadorCedula(data.idNumber)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["idNumber"],
          message: "Cédula ecuatoriana inválida",
        });
      }
    } else {
      const rucValue = data.ruc || data.idNumber;
      if (!isValidEcuadorRuc(rucValue)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["idNumber"],
          message: "RUC ecuatoriano inválido",
        });
      }
    }
  });

export const profileSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().refine(isValidEcuadorPhone, {
    message: "Teléfono ecuatoriano inválido",
  }),
  role: z.string(),
  avatar: z.string().optional(),
});

export type UserFormSchema = z.infer<ReturnType<typeof userFormSchema>>;
export type SupplierFormSchema = z.infer<typeof supplierFormSchema>;
export type CustomerFormSchema = z.infer<typeof customerFormSchema>;
export type VehicleSchema = z.infer<typeof vehicleSchema>;
export type ProfileSchema = z.infer<typeof profileSchema>;

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Contraseña mínima de 6 caracteres"),
});

export const productSchema = z
  .object({
    name: z.string().min(2, "Nombre requerido"),
    brand: z.string().min(1, "Marca requerida"),
    category: z.string().min(1, "Categoría requerida"),
    price: z.coerce.number().min(0, "Precio inválido"),
    cost: z.coerce.number().min(0, "Costo inválido"),
    stock: z.coerce.number().min(0, "Stock inválido"),
    minStock: z.coerce.number().min(0, "Stock mínimo inválido"),
    maxStock: z.coerce.number().min(0, "Stock máximo inválido"),
    sku: z.string().min(1, "SKU requerido"),
    barcode: z.string().optional(),
    supplier: z.string().min(2, "Proveedor requerido"),
    location: z.string().min(1, "Ubicación requerida"),
    description: z.string().optional(),
    status: z.enum(["active", "inactive", "discontinued"]),
  })
  .superRefine((data, ctx) => {
    if (data.maxStock < data.minStock) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["maxStock"],
        message: "Stock máximo debe ser ≥ stock mínimo",
      });
    }
  });

export const companySettingsSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  ruc: z.string().refine(isValidEcuadorRuc, { message: "RUC inválido" }),
  address: z.string().min(4, "Dirección requerida"),
  phone: z.string().refine(isValidEcuadorPhone, {
    message: "Teléfono ecuatoriano inválido",
  }),
  email: z.string().email("Email inválido"),
});

export const sriSettingsSchema = z
  .object({
    environment: z.enum(["test", "production"]),
    emissionType: z.enum(["normal", "contingency"]),
    certificateFile: z.string().default(""),
    certificatePassword: z.string().default(""),
    isActive: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.isActive) {
      if (!data.certificateFile) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["certificateFile"],
          message: "Certificado requerido al activar SRI",
        });
      }
      if (!data.certificatePassword || data.certificatePassword.length < 4) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["certificatePassword"],
          message: "Contraseña del certificado requerida (≥4)",
        });
      }
    }
  });

export const stockAdjustmentSchema = z.object({
  adjustmentType: z.enum(["add", "subtract", "set"]),
  quantity: z.coerce.number().int().min(1, "Cantidad requerida"),
  reason: z.string().min(2, "Motivo requerido"),
  notes: z.string().optional(),
});

export const stockMovementSchema = z.object({
  type: z.enum(["entry", "sale", "adjustment", "return"]),
  quantity: z.coerce.number().int().min(1, "Cantidad requerida"),
  reason: z.string().min(2, "Motivo requerido"),
});

export const inventoryFiltersSchema = z.object({
  category: z.enum(["all", "aceites", "filtros", "lubricantes", "aditivos"]),
  brand: z.enum(["all", "mobil", "castrol", "shell", "valvoline", "motul"]),
  status: z.enum(["all", "active", "inactive", "discontinued"]),
  stockLevel: z.enum(["all", "low", "normal", "high", "out"]),
  obsolescence: z.enum(["all", "obsolete"]).default("all"),
  search: z.string().max(100).optional().default(""),
});

export type InventoryFilters = z.infer<typeof inventoryFiltersSchema>;

export const customerFiltersSchema = z.object({
  customerType: z.enum(["all", "individual", "business"]),
  status: z.enum(["all", "active", "inactive"]),
  city: z.string().max(100).optional().default("all"),
  search: z.string().max(100).optional().default(""),
});