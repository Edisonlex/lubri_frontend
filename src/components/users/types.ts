// Tipos para el formulario (interfaz de usuario)
export interface UserFormData {
  name: string;
  email: string;
  role: string;
  status: string;
  password?: string;
}

// Tipos mapeados para la API
export type ApiRole = "admin" | "cashier" | "manager";
export type ApiStatus = "active" | "inactive";

export type FormRole = "Administrador" | "Cajero" | "Técnico" | "Supervisor";
export type FormStatus = "Activo" | "Inactivo";

export const roles = [
  { value: "Administrador", label: "Administrador" },
  { value: "Cajero", label: "Cajero" },
  { value: "Técnico", label: "Técnico" },
  { value: "Supervisor", label: "Supervisor" },
];

export const statuses = [
  { value: "Activo", label: "Activo" },
  { value: "Inactivo", label: "Inactivo" },
];

// Funciones de conversión
export const convertFormRoleToApiRole = (formRole: FormRole): ApiRole => {
  switch (formRole) {
    case "Administrador":
      return "admin";
    case "Cajero":
      return "cashier";
    case "Técnico":
      return "manager";
    case "Supervisor":
      return "manager";
    default:
      return "cashier";
  }
};

export const convertApiRoleToFormRole = (apiRole: ApiRole): FormRole => {
  switch (apiRole) {
    case "admin":
      return "Administrador";
    case "cashier":
      return "Cajero";
    case "manager":
      return "Técnico";
    default:
      return "Cajero";
  }
};

export const convertFormStatusToApiStatus = (
  formStatus: FormStatus
): ApiStatus => {
  return formStatus === "Activo" ? "active" : "inactive";
};

export const convertApiStatusToFormStatus = (
  apiStatus: ApiStatus
): FormStatus => {
  return apiStatus === "active" ? "Activo" : "Inactivo";
};

// Convertir datos del formulario a datos de API
export const convertFormDataToApiUser = (
  formData: UserFormData
): Omit<any, "id"> => {
  return {
    name: formData.name,
    email: formData.email,
    role: convertFormRoleToApiRole(formData.role as FormRole),
    status: convertFormStatusToApiStatus(formData.status as FormStatus),
    ...(formData.password && { password: formData.password }),
  };
};

// Convertir datos de API a datos del formulario
export const convertApiUserToFormData = (apiUser: any): UserFormData => {
  return {
    name: apiUser.name,
    email: apiUser.email,
    role: convertApiRoleToFormRole(apiUser.role),
    status: convertApiStatusToFormStatus(apiUser.status),
  };
};
