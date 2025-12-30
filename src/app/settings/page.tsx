"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { api, CompanySettings, Branch, BackupSettings } from "@/lib/api";
import { LoadingState } from "@/components/settings/loading-state";
import { CompanySettingsTab } from "@/components/settings/company-settings-tab";
import { BackupSettingsTab } from "@/components/settings/backup-settings-tab";
import { useScrollIndicator } from "@/hooks/use-scroll-indicator";

export default function SettingsPage() {
  const { scrollRef, canScroll, isScrolledLeft, scrollToActiveTab } = useScrollIndicator();
  const [activeTab, setActiveTab] = useState("company");
  const [companyData, setCompanyData] = useState<CompanySettings>({
    name: "",
    ruc: "",
    address: "",
    phone: "",
    email: "",
  });

  const [branches, setBranches] = useState<Branch[]>([]);
  const [backupSettings, setBackupSettings] = useState<BackupSettings>({
    lastBackup: "",
    autoBackup: true,
    backupFrequency: "daily",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettingsData();
  }, []);

  const loadSettingsData = async () => {
    try {
      setIsLoading(true);

      const [companyData, branchesData, backupSettingsData] = await Promise.all([
        api.getCompanySettings(),
        api.getBranches(),
        api.getBackupSettings(),
      ]);

      setCompanyData(companyData);
      setBranches(branchesData);
      setBackupSettings(backupSettingsData);
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

            <Tabs 
              defaultValue="company" 
              value={activeTab}
              onValueChange={(value) => {
                setActiveTab(value);
                scrollToActiveTab(value);
              }}
              className="space-y-6"
            >
              <TabsList 
                ref={scrollRef}
                className={`w-full overflow-x-auto flex gap-2 min-w-max sm:grid sm:grid-cols-2 ${canScroll ? 'can-scroll' : ''} ${isScrolledLeft ? 'scrolled-left' : ''}`}
              >
                <TabsTrigger value="company">Empresa</TabsTrigger>
                <TabsTrigger value="backup">Respaldos</TabsTrigger>
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
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
