"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { UserRole } from "@/contexts/auth-context";

export interface Preferences {
  theme: string;
  notifications: boolean;
  emailAlerts: boolean;
  language: string;
  roleNotifications: {
    admin: {
      inventoryAlerts: boolean;
      userManagementAlerts: boolean;
    };
    cashier: {
      salesAlerts: boolean;
      customerAlerts: boolean;
    };
    technician: {
      maintenanceAlerts: boolean;
      stockAlerts: boolean;
    };
  };
}

interface PreferencesContextType {
  preferences: Preferences;
  setPreferences: (p: Preferences) => void;
  savePreferences: (p?: Preferences) => void;
  isNotificationsEnabledForRole: (role: UserRole) => boolean;
}

const DEFAULT_PREFERENCES: Preferences = {
  theme: "system",
  notifications: true,
  emailAlerts: true,
  language: "es",
  roleNotifications: {
    admin: { inventoryAlerts: true, userManagementAlerts: true },
    cashier: { salesAlerts: true, customerAlerts: true },
    technician: { maintenanceAlerts: true, stockAlerts: true },
  },
};

const STORAGE_KEY = "lubrismart.preferences";

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Preferences;
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      }
    } catch {}
  }, []);

  const savePreferences = (p?: Preferences) => {
    const value = p ?? preferences;
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      }
    } catch {}
  };

  const isNotificationsEnabledForRole = useMemo(() => {
    return (role: UserRole) => {
      if (!preferences.notifications) return false;
      if (role === "admin") {
        return preferences.roleNotifications.admin.inventoryAlerts || preferences.roleNotifications.admin.userManagementAlerts;
      }
      if (role === "cashier") {
        return preferences.roleNotifications.cashier.salesAlerts || preferences.roleNotifications.cashier.customerAlerts;
      }
      return preferences.roleNotifications.technician.maintenanceAlerts || preferences.roleNotifications.technician.stockAlerts;
    };
  }, [preferences]);

  return (
    <PreferencesContext.Provider value={{ preferences, setPreferences, savePreferences, isNotificationsEnabledForRole }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences debe usarse dentro de PreferencesProvider");
  return ctx;
}