"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  api,
  CompanySettings,
  Branch,
  SRISettings,
  BackupSettings,
  AuditLog,
} from "@/lib/api";
import { LoadingState } from "@/components/settings/loading-state";
import { CompanySettingsTab } from "@/components/settings/company-settings-tab";
import { BackupSettingsTab } from "@/components/settings/backup-settings-tab";
import { AuditLogsTab } from "@/components/settings/audit-logs-tab";
import { ProtectedRoute } from "@/contexts/auth-context";

export default function SettingsPage() {
  const [companyData, setCompanyData] = useState<CompanySettings>({
    name: "",
    ruc: "",
    address: "",
    phone: "",
    email: "",
  });

  const [branches, setBranches] = useState<Branch[]>([]);
  const [sriSettings, setSriSettings] = useState<SRISettings>({
    environment: "test",
    emissionType: "normal",
    certificateFile: "",
    certificatePassword: "",
    isActive: false,
  });
  const [backupSettings, setBackupSettings] = useState<BackupSettings>({
    lastBackup: "",
    autoBackup: true,
    backupFrequency: "daily",
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettingsData();
  }, []);

  const loadSettingsData = async () => {
    try {
      setIsLoading(true);

      const [
        companyData,
        branchesData,
        sriSettingsData,
        backupSettingsData,
        auditLogsData,
      ] = await Promise.all([
        api.getCompanySettings(),
        api.getBranches(),
        api.getSriSettings(),
        api.getBackupSettings(),
        api.getAuditLogs(),
      ]);

      setCompanyData(companyData);
      setBranches(branchesData);
      setSriSettings(sriSettingsData);
      setBackupSettings(backupSettingsData);
      setAuditLogs(auditLogsData);
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("Error al cargar la configuración");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <ProtectedRoute permission="settings.manage">
    <div className="flex bg-background">
      <div className="flex-1 flex flex-col">
        <main className="flex-1">
          <div className="flex-1 space-y-6 p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div>
                <h1 className="text-3xl font-bold text-balance">
                  Configuración
                </h1>
                <p className="text-muted-foreground">
                  Administra usuarios, empresa y configuraciones del sistema
                </p>
              </div>
            </motion.div>

            <Tabs defaultValue="company" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="company">Empresa</TabsTrigger>
                <TabsTrigger value="backup">Respaldos</TabsTrigger>
                <TabsTrigger value="audit">Auditoría</TabsTrigger>
              </TabsList>

              <TabsContent value="company" className="space-y-6">
                <CompanySettingsTab
                  companyData={companyData}
                  setCompanyData={setCompanyData}
                  branches={branches}
                  setBranches={setBranches}
                />
              </TabsContent>


              <TabsContent value="backup" className="space-y-6">
                <BackupSettingsTab
                  backupSettings={backupSettings}
                  setBackupSettings={setBackupSettings}
                  companyData={companyData}
                  branches={branches}
                  sriSettings={sriSettings}
                  auditLogs={auditLogs}
                />
              </TabsContent>

              <TabsContent value="audit" className="space-y-6">
                <AuditLogsTab auditLogs={auditLogs} />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
    </ProtectedRoute>
  );
}
