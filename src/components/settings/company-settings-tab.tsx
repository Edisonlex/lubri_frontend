import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus } from "lucide-react";
import { toast } from "sonner";
import { api, CompanySettings, Branch } from "@/lib/api";
import { companySettingsSchema } from "@/lib/validation";
import { useState, useEffect } from "react";
import { useZodLiveForm } from "@/hooks/use-zod-form";

interface CompanySettingsTabProps {
  companyData: CompanySettings;
  setCompanyData: (data: CompanySettings) => void;
  branches: Branch[];
  setBranches: (branches: Branch[]) => void;
}

export function CompanySettingsTab({
  companyData,
  setCompanyData,
  branches,
  setBranches,
}: CompanySettingsTabProps) {
  const form = useZodLiveForm(companySettingsSchema, companyData);

  useEffect(() => {
    form.setData(companyData);
  }, [companyData]);

  const handleSaveCompany = async () => {
    const validation = form.validate();
    if (!validation.ok) {
        toast.error("Por favor corrige los errores en el formulario");
        return;
    }

    try {
      await api.updateCompanySettings(validation.value);
      setCompanyData(validation.value);
      toast.success("Información de empresa actualizada correctamente");
    } catch (error) {
      console.error("Error saving company:", error);
      toast.error("Error al guardar la información de la empresa");
    }
  };

  const handleAddBranch = async () => {
    try {
      const newBranch = await api.createBranch({
        name: "Nueva Sucursal",
        address: "",
        phone: "",
        email: "",
        isMain: false,
        status: "active",
      });
      setBranches([...branches, newBranch]);
      toast.success("Sucursal agregada");
    } catch (error) {
      console.error("Error adding branch:", error);
      toast.error("Error al agregar la sucursal");
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Información de la Empresa
          </CardTitle>
          <CardDescription>
            Configura los datos básicos de tu lubricadora
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company-name">Nombre de la Empresa</Label>
              <p className="text-muted-foreground text-xs">Mínimo 2 caracteres</p>
              <Input
                id="company-name"
                value={form.data.name}
                onChange={(e) =>
                  form.setField("name", e.target.value)
                }
                {...form.ariaProps("name")}
              />
              {form.errors.name && (
                <p className="text-destructive text-sm">{form.errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-ruc">RUC</Label>
              <p className="text-muted-foreground text-xs">RUC válido (13 dígitos)</p>
              <Input
                id="company-ruc"
                value={form.data.ruc}
                onChange={(e) =>
                    form.setField("ruc", e.target.value.replace(/\D/g, ""))
                }
                maxLength={13}
                {...form.ariaProps("ruc")}
              />
              {form.errors.ruc && (
                <p className="text-destructive text-sm">{form.errors.ruc}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-address">Dirección</Label>
            <p className="text-muted-foreground text-xs">Dirección completa</p>
            <Textarea
              id="company-address"
              value={form.data.address}
              onChange={(e) =>
                form.setField("address", e.target.value)
              }
              {...form.ariaProps("address")}
            />
            {form.errors.address && (
              <p className="text-destructive text-sm">{form.errors.address}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company-phone">Teléfono</Label>
              <p className="text-muted-foreground text-xs">Teléfono válido</p>
              <Input
                id="company-phone"
                value={form.data.phone}
                onChange={(e) =>
                    form.setField("phone", e.target.value.replace(/\D/g, ""))
                }
                maxLength={10}
                {...form.ariaProps("phone")}
              />
              {form.errors.phone && (
                <p className="text-destructive text-sm">{form.errors.phone}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-email">Email</Label>
              <p className="text-muted-foreground text-xs">Correo electrónico válido</p>
              <Input
                id="company-email"
                type="email"
                value={form.data.email}
                onChange={(e) =>
                    form.setField("email", e.target.value)
                }
                {...form.ariaProps("email")}
              />
              {form.errors.email && (
                <p className="text-destructive text-sm">{form.errors.email}</p>
              )}
            </div>
          </div>

          <Button onClick={handleSaveCompany} className="w-full">
            Guardar Cambios
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuración de Sucursales</CardTitle>
          <CardDescription>
            Gestiona múltiples ubicaciones de tu negocio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {branches.map((branch) => (
              <div
                key={branch.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{branch.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {branch.address}
                  </p>
                </div>
                {branch.isMain ? (
                  <Badge>Principal</Badge>
                ) : (
                  <Badge variant="secondary">
                    {branch.status === "active" ? "Activa" : "Inactiva"}
                  </Badge>
                )}
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            className="w-full bg-transparent"
            onClick={handleAddBranch}
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar Sucursal
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
