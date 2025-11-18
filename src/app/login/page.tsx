"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Wrench, Info, Copy, CheckCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

// Credenciales de prueba
const loginCredentials = [
  {
    email: "admin@lubricadora.com",
    password: "admin123",
    userId: "1",
  },
  {
    email: "cajero1@lubricadora.com",
    password: "cajero123",
    userId: "2",
  },
  {
    email: "tecnico1@lubricadora.com",
    password: "tecnico123",
    userId: "6",
  },
];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showCredentials, setShowCredentials] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log("Intentando login con:", email, password);
      const success = await login(email, password);

      if (success) {
        console.log("Login exitoso");
        toast.success("Inicio de sesión exitoso");
        router.push("/dashboard");
      } else {
        console.log("Credenciales incorrectas");
        toast.error("Credenciales incorrectas");
      }
    } catch (error) {
      console.error("Error completo:", error);
      toast.error("Error al iniciar sesión");
    }
  };

  const copyCredentials = (email: string, password: string, index: number) => {
    navigator.clipboard.writeText(`Email: ${email}\nContraseña: ${password}`);
    setCopiedIndex(index);
    toast.success("Credenciales copiadas al portapapeles");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const fillCredentials = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
    setShowCredentials(false);
    toast.success("Credenciales cargadas en el formulario");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[90%] sm:max-w-md"
      >
        <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 px-4 sm:px-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-full flex items-center justify-center"
            >
              <Wrench className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
            </motion.div>
            <div>
              <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                LubriSmart
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm md:text-base text-muted-foreground">
                Sistema de Gestión para Lubricadoras
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Usuario
                </Label>
                <Input
                  id="username"
                  type="email"
                  placeholder="Ingrese su correo electrónico"
                  className="h-10 sm:h-12 text-sm sm:text-base"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingrese su contraseña"
                    className="h-10 sm:h-12 text-sm sm:text-base pr-10 sm:pr-12"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 h-7 w-7 sm:h-8 sm:w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    ) : (
                      <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-10 sm:h-12 text-sm sm:text-base font-medium mt-2 sm:mt-3"
                disabled={isLoading}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                    className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                  />
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </form>

            {/* Sección de credenciales de prueba */}
            <div className="mt-6 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full flex items-center justify-center gap-2 text-xs"
                onClick={() => setShowCredentials(!showCredentials)}
              >
                <Info className="h-3.5 w-3.5" />
                {showCredentials ? "Ocultar" : "Mostrar"} credenciales de prueba
              </Button>

              {showCredentials && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-3"
                >
                  <p className="text-xs text-muted-foreground text-center">
                    Usa estas credenciales para probar el sistema:
                  </p>

                  {loginCredentials.map((user, index) => (
                    <div
                      key={user.userId}
                      className="p-3 bg-muted/50 rounded-lg border border-border"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <p className="text-xs font-medium">
                            {user.email.includes("admin")
                              ? "👑 Administrador"
                              : user.email.includes("gerente")
                              ? "💼 Gerente"
                              : "💵 Cajero"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            <strong>Email:</strong> {user.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <strong>Contraseña:</strong> {user.password}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() =>
                              copyCredentials(user.email, user.password, index)
                            }
                            title="Copiar credenciales"
                          >
                            {copiedIndex === index ? (
                              <CheckCheck className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-xs"
                            onClick={() =>
                              fillCredentials(user.email, user.password)
                            }
                            title="Usar estas credenciales"
                          >
                            →
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <p className="text-xs text-muted-foreground text-center italic">
                    Selecciona un usuario y haz clic en la flecha para cargar
                    sus credenciales
                  </p>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
