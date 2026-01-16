export interface ExportData {
  headers: string[];
  data: any[][];
  fileName: string;
  title?: string;
  orientation?: "portrait" | "landscape";
  companyInfo?: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
}
