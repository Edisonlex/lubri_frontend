export interface ExportData {
  headers: string[];
  data: any[][];
  fileName: string;
  companyInfo?: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
}
