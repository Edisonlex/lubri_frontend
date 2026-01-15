"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Eye,
  EyeOff,
  Wrench,
  Info,
  Copy,
  CheckCheck,
  Mail,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { z } from "zod";
import { loginSchema } from "@/lib/validation";
import { cn } from "@/lib/utils";

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
    userId: "3",
  },
];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showCredentials, setShowCredentials] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetStep, setResetStep] = useState<"email" | "code" | "password">(
    "email"
  );
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [resetErrors, setResetErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const { login, isLoading } = useAuth();
  const router = useRouter();
  const emailValid = z.string().email().safeParse(email.trim()).success;
  const passwordValid = z.string().min(6).safeParse(password).success;
  const isFormValid = emailValid && passwordValid;
  const [resetEmailValid, setResetEmailValid] = useState(false);
  const [resetEmailExists, setResetEmailExists] = useState<boolean | null>(
    null
  );
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [codeValid, setCodeValid] = useState(false);
  const [newPassValid, setNewPassValid] = useState(false);
  const [confirmPassValid, setConfirmPassValid] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const parsed = loginSchema.safeParse({
        email: email.trim(),
        password,
      });
      if (!parsed.success) {
        const msg =
          parsed.error.errors[0]?.message || "Revisa tu correo y contraseña";
        toast.error(msg);
        return;
      }
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

  const openForgot = () => {
    setForgotOpen(true);
    setResetStep("email");
    setResetEmail("");
    setResetCode("");
    setNewPass("");
    setConfirmPass("");
    setResetErrors({});
    setDemoCode(null);
    setResetEmailValid(false);
    setResetEmailExists(null);
    setCheckingEmail(false);
    setCodeValid(false);
    setNewPassValid(false);
    setConfirmPassValid(false);
    setPasswordsMatch(false);
  };

  const handleSendCode = async () => {
    const schema = z.string().email("Email inválido");
    const res = schema.safeParse(resetEmail.trim());
    if (!res.success) {
      setResetErrors({
        email: res.error.errors[0]?.message || "Email inválido",
      });
      return;
    }
    try {
      setSending(true);
      const resp = await api.requestPasswordReset(resetEmail.trim());
      if (!resp.demoCode) {
        setResetErrors({ email: "El email no está registrado" });
        toast.error("Email no registrado");
        return;
      }
      setResetErrors({});
      setDemoCode(resp.demoCode);
      toast.success(`Código enviado (demo: ${resp.demoCode})`);
      setResetStep("code");
    } catch {
      toast.error("Error enviando el código");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    const v = z.string().email().safeParse(resetEmail.trim()).success;
    setResetEmailValid(v);
    setResetErrors((prev) => ({ ...prev, email: "" }));
    setDemoCode(null);
    if (!v) {
      setResetEmailExists(null);
      return;
    }
    setCheckingEmail(true);
    api
      .checkEmailExists(resetEmail.trim())
      .then((exists) => setResetEmailExists(exists))
      .finally(() => setCheckingEmail(false));
  }, [resetEmail]);

  useEffect(() => {
    const v = /^\d{6}$/.test(resetCode);
    setCodeValid(v);
    setResetErrors((prev) => ({ ...prev, code: "" }));
  }, [resetCode]);

  useEffect(() => {
    const v1 = newPass.length >= 6;
    const v2 = confirmPass.length >= 6;
    setNewPassValid(v1);
    setConfirmPassValid(v2);
    setPasswordsMatch(newPass === confirmPass && v2);
    setResetErrors((prev) => ({
      ...prev,
      newPassword: "",
      confirmPassword: "",
    }));
  }, [newPass, confirmPass]);

  const handleVerifyCode = async () => {
    const schema = z
      .string()
      .min(6, "Código inválido")
      .max(6, "Código inválido")
      .regex(/^\d{6}$/, "Debe ser de 6 dígitos");
    const res = schema.safeParse(resetCode);
    if (!res.success) {
      setResetErrors({
        code: res.error.errors[0]?.message || "Código inválido",
      });
      return;
    }
    try {
      setSending(true);
      const ok = await api.verifyPasswordResetCode(
        resetEmail.trim(),
        resetCode
      );
      if (!ok) {
        setResetErrors({ code: "Código incorrecto" });
        toast.error("Código incorrecto");
        return;
      }
      setResetErrors({});
      setResetStep("password");
      toast.success("Código verificado");
    } catch {
      toast.error("Error verificando el código");
    } finally {
      setSending(false);
    }
  };

  const handleResetPassword = async () => {
    const passSchema = z.string().min(6, "Mínimo 6 caracteres");
    const p1 = passSchema.safeParse(newPass);
    const p2 = passSchema.safeParse(confirmPass);
    if (!p1.success) {
      setResetErrors({
        newPassword: p1.error.errors[0]?.message || "Contraseña inválida",
      });
      return;
    }
    if (!p2.success) {
      setResetErrors({
        confirmPassword: p2.error.errors[0]?.message || "Contraseña inválida",
      });
      return;
    }
    if (newPass !== confirmPass) {
      setResetErrors({ confirmPassword: "Debe coincidir" });
      return;
    }
    try {
      setSending(true);
      await api.resetPassword(resetEmail.trim(), newPass);
      toast.success("Contraseña actualizada");
      setForgotOpen(false);
    } catch {
      toast.error("Error actualizando la contraseña");
    } finally {
      setSending(false);
    }
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
                <p className="text-muted-foreground text-xs">
                  Debe ser un correo válido
                </p>
                <div className="relative">
                  <Input
                    id="username"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="Ingrese su correo electrónico"
                    className="h-10 sm:h-12 text-sm sm:text-base pr-10 sm:pr-12"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value.replace(/\s/g, ""))
                    }
                    required
                    aria-invalid={!emailValid && email.length > 0}
                    aria-describedby="email-help"
                  />
                  <Mail className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <div
                  id="email-help"
                  aria-live="polite"
                  className="min-h-[18px]"
                >
                  {!emailValid && email.length > 0 && (
                    <p className="text-destructive text-sm">Email inválido</p>
                  )}
                </div>
              </div>

              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Contraseña
                </Label>
                <p className="text-muted-foreground text-xs">
                  Mínimo 6 caracteres
                </p>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingrese su contraseña"
                    className="h-10 sm:h-12 text-sm sm:text-base pr-10 sm:pr-12"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    aria-invalid={!passwordValid && password.length > 0}
                    aria-describedby="password-help"
                  />
                  <KeyRound className="absolute right-10 sm:right-12 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                <div
                  id="password-help"
                  aria-live="polite"
                  className="min-h-[18px]"
                >
                  {!passwordValid && password.length > 0 && (
                    <p className="text-destructive text-sm">
                      Contraseña demasiado corta
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-10 sm:h-12 text-sm sm:text-base font-medium mt-2 sm:mt-3"
                disabled={isLoading || !isFormValid}
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
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="link"
                  className="px-0 text-xs sm:text-sm"
                  onClick={openForgot}
                >
                  ¿Olvidaste tu contraseña?
                </Button>
              </div>
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
        <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {resetStep === "email" && "Recuperar contraseña"}
                {resetStep === "code" && "Verificar código"}
                {resetStep === "password" && "Nueva contraseña"}
              </DialogTitle>
              <DialogDescription>
                {resetStep === "email" &&
                  "Ingresa tu email, enviaremos un código"}
                {resetStep === "code" &&
                  "Ingresa el código enviado a tu correo"}
                {resetStep === "password" && "Define tu nueva contraseña"}
              </DialogDescription>
            </DialogHeader>

            {resetStep === "email" && (
              <div className="space-y-3">
                <Label htmlFor="resetEmail" className="text-sm">
                  Email
                </Label>
                <p
                  className={cn(
                    "text-xs",
                    resetEmailValid ? "text-green-600" : "text-destructive"
                  )}
                >
                  {resetEmailValid
                    ? "Formato válido"
                    : "Debe ser un email válido"}
                </p>
                {resetEmailValid && (
                  <p className="text-muted-foreground text-xs">
                    {checkingEmail
                      ? "Verificando..."
                      : resetEmailExists === true
                      ? "Email registrado"
                      : resetEmailExists === false
                      ? "Email no registrado"
                      : ""}
                  </p>
                )}
                <div className="relative">
                  <Input
                    id="resetEmail"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    aria-invalid={
                      !resetEmailValid || resetEmailExists === false
                    }
                    className="pr-10"
                  />
                  <Mail className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                {resetErrors.email && (
                  <p className="text-destructive text-sm">
                    {resetErrors.email}
                  </p>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setForgotOpen(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSendCode}
                    disabled={
                      sending ||
                      !resetEmailValid ||
                      resetEmailExists === false ||
                      checkingEmail
                    }
                    className="flex-1"
                  >
                    Enviar código
                  </Button>
                </div>
              </div>
            )}

            {resetStep === "code" && (
              <div className="space-y-3">
                <Label htmlFor="resetCode" className="text-sm">
                  Código de verificación
                </Label>
                <p
                  className={cn(
                    "text-xs",
                    codeValid ? "text-green-600" : "text-destructive"
                  )}
                >
                  {codeValid ? "Formato válido" : "Código de 6 dígitos"}
                </p>
                {demoCode && (
                  <p className="text-muted-foreground text-xs">
                    Código (modo demo): {demoCode}
                  </p>
                )}
                <div className="relative">
                  <Input
                    id="resetCode"
                    inputMode="numeric"
                    value={resetCode}
                    onChange={(e) =>
                      setResetCode(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="123456"
                    aria-invalid={!codeValid}
                    className="pr-10"
                  />
                  <KeyRound className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                {resetErrors.code && (
                  <p className="text-destructive text-sm">{resetErrors.code}</p>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setForgotOpen(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleSendCode}
                    disabled={sending}
                    className="flex-1"
                  >
                    Reenviar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={sending || !codeValid}
                    className="flex-1"
                  >
                    Validar código
                  </Button>
                </div>
              </div>
            )}

            {resetStep === "password" && (
              <div className="space-y-3">
                <Label htmlFor="newPass" className="text-sm">
                  Nueva contraseña
                </Label>
                <p
                  className={cn(
                    "text-xs",
                    newPassValid ? "text-green-600" : "text-destructive"
                  )}
                >
                  {newPassValid ? "OK" : "Mínimo 6 caracteres"}
                </p>
                <Input
                  id="newPass"
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                />
                {resetErrors.newPassword && (
                  <p className="text-destructive text-sm">
                    {resetErrors.newPassword}
                  </p>
                )}
                <Label htmlFor="confirmPass" className="text-sm">
                  Confirmar contraseña
                </Label>
                <p
                  className={cn(
                    "text-xs",
                    passwordsMatch ? "text-green-600" : "text-destructive"
                  )}
                >
                  {passwordsMatch ? "Coinciden" : "Debe coincidir"}
                </p>
                <Input
                  id="confirmPass"
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  aria-invalid={!passwordsMatch}
                />
                {resetErrors.confirmPassword && (
                  <p className="text-destructive text-sm">
                    {resetErrors.confirmPassword}
                  </p>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setForgotOpen(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={
                      sending ||
                      !newPassValid ||
                      !confirmPassValid ||
                      !passwordsMatch
                    }
                    className="flex-1"
                  >
                    <ShieldCheck className="h-4 w-4 mr-1" /> Actualizar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}
