"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { api, User as UserType, Sale, AuditLog } from "@/lib/api";
import { useTheme } from "next-themes";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { PreferencesForm } from "@/components/profile/PreferencesForm";
import { usePreferences } from "@/contexts/preferences-context";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { SecurityForm } from "@/components/profile/SecurityForm";
import { useScrollIndicator } from "@/hooks/use-scroll-indicator";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Importar componentes


interface ProfileData {
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string;
}


interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface UserStats {
  totalSales: number;
  customersServed: number;
  hoursWorked: number;
  recentActivity: Array<{
    action: string;
    timestamp: string;
  }>;
}

export default function ProfilePage() {
  const { theme } = useTheme();
  const { preferences, setPreferences, savePreferences } = usePreferences();
  const [mounted, setMounted] = useState(false);
  const { scrollRef, canScroll, isScrolledLeft, scrollToActiveTab } = useScrollIndicator();
  const [activeTab, setActiveTab] = useState("profile");
  const isMobile = useIsMobile();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
    role: "",
  });
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [userStats, setUserStats] = useState<UserStats>({
    totalSales: 0,
    customersServed: 0,
    hoursWorked: 0,
    recentActivity: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Efecto para montaje
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sincronizar el tema de las preferencias con el tema actual
  useEffect(() => {
    if (mounted && theme) {
      setPreferences((prev) => ({
        ...prev,
        theme: theme,
      }));
    }
  }, [theme, mounted]);

  // Cargar datos del usuario actual
  useEffect(() => {
    if (mounted) {
      loadUserData();
    }
  }, [mounted]);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const users = await api.getUsers();
      const currentUser = users[0];
      setCurrentUser(currentUser);

      setProfile({
        name: currentUser.name,
        email: currentUser.email,
        phone: "0987654321",
        role:
          currentUser.role === "admin"
            ? "Administrador"
            : currentUser.role === "manager"
            ? "Gerente"
            : "Cajero",
      });

      await loadUserStats(currentUser.id);
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Error al cargar los datos del usuario");
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserStats = async (userId: string) => {
    try {
      const sales = await api.getSales();
      const userSales = sales.filter((sale) => sale.userId === userId);
      const auditLogs = await api.getAuditLogs();
      const userLogs = auditLogs.filter(
        (log) => log.user === currentUser?.email
      );

      const totalSales = userSales.length;
      const uniqueCustomers = new Set(userSales.map((sale) => sale.customerId))
        .size;
      const hoursWorked = Math.floor(totalSales * 0.5) + 120;
      const recentActivity = userLogs.slice(0, 5).map((log) => ({
        action: log.action,
        timestamp: log.timestamp,
      }));

      setUserStats({
        totalSales,
        customersServed: uniqueCustomers,
        hoursWorked,
        recentActivity,
      });
    } catch (error) {
      console.error("Error loading user stats:", error);
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;

    try {
      setIsSaving(true);
      await api.updateUser(currentUser.id, {
        name: profile.name,
        email: profile.email,
      });

      await api.createAuditLog({
        action: "Actualización de perfil de usuario",
        user: profile.email,
        timestamp: new Date().toISOString(),
        status: "success",
        details: `Usuario ${profile.name} actualizó su información de perfil`,
      });

      toast.success("Perfil actualizado correctamente");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Error al actualizar el perfil");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setIsSaving(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      savePreferences();

      await api.createAuditLog({
        action: "Actualización de preferencias de usuario",
        user: profile.email,
        timestamp: new Date().toISOString(),
        status: "success",
        details: `Usuario ${profile.name} actualizó sus preferencias (tema: ${preferences.theme})`,
      });

      toast.success("Preferencias guardadas correctamente");
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Error al guardar las preferencias");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    try {
      setIsSaving(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await api.createAuditLog({
        action: "Cambio de contraseña",
        user: profile.email,
        timestamp: new Date().toISOString(),
        status: "success",
        details: `Usuario ${profile.name} cambió su contraseña`,
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast.success("Contraseña actualizada correctamente");
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Error al cambiar la contraseña");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const imageUrl = URL.createObjectURL(file);

        setProfile((prevProfile) => ({
          ...prevProfile,
          avatar: imageUrl,
        }));

        await api.createAuditLog({
          action: "Actualización de foto de perfil",
          user: profile.email,
          timestamp: new Date().toISOString(),
          status: "success",
          details: `Usuario ${profile.name} actualizó su foto de perfil`,
        });

        toast.success("Foto de perfil actualizada correctamente");
      } catch (error) {
        console.error("Error uploading avatar:", error);
        toast.error("Error al cargar la foto de perfil");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-background">
      <div className="flex-1 flex flex-col">
        <main className="flex-1">
          <div className="flex-1 space-y-6 p-6">
            <ProfileHeader
              name={profile.name}
              email={profile.email}
              role={profile.role}
              avatar={profile.avatar}
              onAvatarUpload={handleAvatarUpload}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div>
                <h1 className="text-3xl font-bold text-balance">Mi Perfil</h1>
                <p className="text-muted-foreground">
                  Gestiona tu información personal y preferencias
                </p>
              </div>
            </motion.div>

            <div className="grid gap-6 lg:grid-cols-4">
              {/* Sidebar de información del usuario */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden lg:block lg:col-span-1"
              >
                <ProfileSidebar
                  profile={profile}
                  onAvatarUpload={handleAvatarUpload}
                />
              </motion.div>

              {/* Contenido principal */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-3"
              >
                {isMobile ? (
                  <Accordion type="single" collapsible>
                    <AccordionItem value="profile">
                      <AccordionTrigger>Perfil</AccordionTrigger>
                      <AccordionContent>
                        <ProfileForm
                          profile={profile}
                          onProfileChange={setProfile}
                          onSave={handleSaveProfile}
                          isSaving={isSaving}
                        />
                        <ProfileStats userStats={userStats} />
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="security">
                      <AccordionTrigger>Seguridad</AccordionTrigger>
                      <AccordionContent>
                        <SecurityForm
                          passwordData={passwordData}
                          onPasswordChange={setPasswordData}
                          onChangePassword={handleChangePassword}
                          isSaving={isSaving}
                        />
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="preferences">
                      <AccordionTrigger>Preferencias</AccordionTrigger>
                      <AccordionContent>
                      <PreferencesForm
                          preferences={preferences}
                          onPreferencesChange={setPreferences}
                          onSave={handleSavePreferences}
                          isSaving={isSaving}
                          role={
                            currentUser?.role === "admin"
                              ? "admin"
                              : currentUser?.role === "cashier"
                              ? "cashier"
                              : "technician"
                          }
                        />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ) : (
                  <Tabs 
                    defaultValue="profile" 
                    value={activeTab}
                    onValueChange={(value) => {
                      setActiveTab(value);
                      scrollToActiveTab(value);
                    }}
                    className="space-y-6"
                  >
                    <TabsList 
                      ref={scrollRef}
                      className={`w-full overflow-x-auto flex gap-2 min-w-max sm:grid sm:grid-cols-3 ${canScroll ? 'can-scroll' : ''} ${isScrolledLeft ? 'scrolled-left' : ''}`}
                    >
                      <TabsTrigger value="profile">Perfil</TabsTrigger>
                      <TabsTrigger value="security">Seguridad</TabsTrigger>
                      <TabsTrigger value="preferences">Preferencias</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="space-y-6">
                      <ProfileForm
                        profile={profile}
                        onProfileChange={setProfile}
                        onSave={handleSaveProfile}
                        isSaving={isSaving}
                      />
                      <ProfileStats userStats={userStats} />
                    </TabsContent>

                    <TabsContent value="security" className="space-y-6">
                      <SecurityForm
                        passwordData={passwordData}
                        onPasswordChange={setPasswordData}
                        onChangePassword={handleChangePassword}
                        isSaving={isSaving}
                      />
                    </TabsContent>

                    <TabsContent value="preferences" className="space-y-6">
                      <PreferencesForm
                        preferences={preferences}
                        onPreferencesChange={setPreferences}
                        onSave={handleSavePreferences}
                        isSaving={isSaving}
                        role={
                          currentUser?.role === "admin"
                            ? "admin"
                            : currentUser?.role === "cashier"
                            ? "cashier"
                            : "technician"
                        }
                      />
                    </TabsContent>
                  </Tabs>
                )}
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
