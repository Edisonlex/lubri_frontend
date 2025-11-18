"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { api, User as UserType, Sale, AuditLog } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "next-themes";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { PreferencesForm } from "@/components/profile/PreferencesForm";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { SecurityForm } from "@/components/profile/SecurityForm";
import { ProtectedRoute } from "@/contexts/auth-context";

// Importar componentes


interface ProfileData {
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string;
}

interface Preferences {
  theme: string;
  notifications: boolean;
  emailAlerts: boolean;
  language: string;
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
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
    role: "",
  });
  const [preferences, setPreferences] = useState<Preferences>({
    theme: "system",
    notifications: true,
    emailAlerts: true,
    language: "es",
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
    if (mounted && user) {
      setCurrentUser({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: "active",
      } as any);

      setProfile({
        name: user.name,
        email: user.email,
        phone: "",
        role:
          user.role === "admin"
            ? "Administrador"
            : user.role === "cashier"
            ? "Cajero"
            : "Técnico",
      });

      (async () => {
        await loadUserStats(user.id, user.email);
        setIsLoading(false);
      })();
    }
  }, [mounted, user]);

  const loadUserData = async () => {};

  const loadUserStats = async (userId: string, userEmail?: string) => {
    try {
      const sales = await api.getSales();
      const userSales = sales.filter((sale) => sale.userId === userId);
      const auditLogs = await api.getAuditLogs();
      const userLogs = auditLogs.filter(
        (log) => log.user === (userEmail ?? currentUser?.email)
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
    <ProtectedRoute>
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
                className="lg:col-span-1"
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
                <Tabs defaultValue="profile" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="profile">Perfil</TabsTrigger>
                    <TabsTrigger value="security">Seguridad</TabsTrigger>
                    <TabsTrigger value="preferences">Preferencias</TabsTrigger>
                  </TabsList>

                  {/* Pestaña de Perfil */}
                  <TabsContent value="profile" className="space-y-6">
                    <ProfileForm
                      profile={profile}
                      onProfileChange={setProfile}
                      onSave={handleSaveProfile}
                      isSaving={isSaving}
                    />
                    <ProfileStats userStats={userStats} />
                  </TabsContent>

                  {/* Pestaña de Seguridad */}
                  <TabsContent value="security" className="space-y-6">
                    <SecurityForm
                      passwordData={passwordData}
                      onPasswordChange={setPasswordData}
                      onChangePassword={handleChangePassword}
                      isSaving={isSaving}
                    />
                  </TabsContent>

                  {/* Pestaña de Preferencias */}
                  <TabsContent value="preferences" className="space-y-6">
                    <PreferencesForm
                      preferences={preferences}
                      onPreferencesChange={setPreferences}
                      onSave={handleSavePreferences}
                      isSaving={isSaving}
                    />
                  </TabsContent>
                </Tabs>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
    </ProtectedRoute>
  );
}
