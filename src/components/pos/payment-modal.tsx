"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  CreditCard,
  DollarSign,
  Smartphone,
  Receipt,
  User,
  Building,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  generateInvoicePDF,
  generateInvoiceNumber,
  type InvoiceData,
} from "./invoice-generator";
import { usePOS } from "@/contexts/pos-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { useZodLiveForm } from "@/hooks/use-zod-form";
import { cardPaymentSchema, transferPaymentSchema } from "@/lib/validation";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: () => void;
}

type PaymentMethod = "cash" | "card" | "transfer";
type PaymentStatus = "pending" | "processing" | "completed" | "failed";

export function PaymentModal({
  isOpen,
  onClose,
  onPaymentComplete,
}: PaymentModalProps) {
  const { cartItems, cartTotal, selectedCustomer, addSale, refreshSales } =
    usePOS();
  const isMobile = useIsMobile();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [cashReceived, setCashReceived] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("pending");
  const cardForm = useZodLiveForm(cardPaymentSchema, {
    number: "",
    expiry: "",
    cvv: "",
    holder: "",
  });
  const transferForm = useZodLiveForm(transferPaymentSchema, {
    bank: "",
    reference: "",
    dunaCode: "",
  });

  const totalWithTax = cartTotal * 1.12;
  const change =
    paymentMethod === "cash"
      ? Math.max(0, Number.parseFloat(cashReceived || "0") - totalWithTax)
      : 0;

  const isCardValid = cardPaymentSchema.safeParse(cardForm.data).success;
  const isTransferValid = transferPaymentSchema.safeParse(transferForm.data).success;

  const simulatePaymentProcessing = async (
    method: PaymentMethod
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simular un 95% de éxito en los pagos
        resolve(Math.random() > 0.05);
      }, 2000);
    });
  };

  const handlePayment = async () => {
    if (
      paymentMethod === "cash" &&
      Number.parseFloat(cashReceived) < totalWithTax
    ) {
      toast.error("El monto recibido es insuficiente");
      return;
    }

    const consumerFinal = {
      id: "CF",
      name: "Consumidor Final",
      email: "",
      phone: "",
      address: "",
      city: "",
      idNumber: "9999999999",
      customerType: "individual" as const,
      vehicles: [],
      totalPurchases: 0,
      lastPurchase: "",
      registrationDate: new Date().toISOString().split("T")[0],
      status: "active" as const,
      notes: "",
      preferredContact: "phone" as const,
    };
    const customerForSale = selectedCustomer || consumerFinal;

    setIsProcessing(true);
    setPaymentStatus("processing");

    try {
      // Simular procesamiento de pago según el método
      let paymentSuccess = false;

      switch (paymentMethod) {
        case "cash":
          paymentSuccess = true; // Efectivo siempre funciona
          break;
        case "card":
          if (!cardForm.validate().ok) {
            toast.error("Revisa los datos de la tarjeta");
            paymentSuccess = false;
          } else {
            paymentSuccess = await simulatePaymentProcessing("card");
          }
          break;
        case "transfer":
          if (!transferForm.validate().ok) {
            toast.error("Revisa los datos de la transferencia");
            paymentSuccess = false;
          } else {
            paymentSuccess = await simulatePaymentProcessing("transfer");
          }
          break;
      }

      if (!paymentSuccess) {
        throw new Error(`Pago con ${paymentMethod} falló`);
      }

      // Crear la venta en el sistema
      const saleData = {
        customerId: selectedCustomer ? selectedCustomer.id : null,
        customerName: customerForSale.name,
        items: cartItems.map((item) => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          subtotal: item.price * item.quantity,
        })),
        subtotal: cartTotal,
        tax: cartTotal * 0.12,
        total: totalWithTax,
        paymentMethod: (paymentMethod === "cash"
          ? "efectivo"
          : paymentMethod === "card"
          ? "tarjeta"
          : "transferencia") as "efectivo" | "tarjeta" | "transferencia",
        status: "completada" as const,
        userId: "current-user-id",
        notes:
          paymentMethod === "transfer"
            ? `Referencia: ${transferForm.data.reference}`
            : "",
      };

      // Registrar la venta en el sistema
      await addSale(saleData);

      // Forzar actualización inmediata de las ventas
      await refreshSales();

      // Generar la factura PDF
      const invoiceData: InvoiceData = {
        invoiceNumber: generateInvoiceNumber(),
        date: new Date().toLocaleDateString("es-EC", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        customer: customerForSale,
        items: cartItems,
        subtotal: cartTotal,
        tax: cartTotal * 0.12,
        total: totalWithTax,
        paymentMethod:
          paymentMethod === "cash"
            ? "Efectivo"
            : paymentMethod === "card"
            ? "Tarjeta"
            : "Transferencia",
        cashReceived:
          paymentMethod === "cash"
            ? Number.parseFloat(cashReceived)
            : undefined,
        change: paymentMethod === "cash" ? change : undefined,
      };

      const pdfGenerated = generateInvoicePDF(invoiceData);

      if (pdfGenerated) {
        setPaymentStatus("completed");
        toast.success(
          `Venta procesada exitosamente para ${selectedCustomer.name}. Factura generada.`
        );

        // Esperar un momento antes de cerrar para mostrar el estado de éxito
        setTimeout(() => {
          setIsProcessing(false);
          onPaymentComplete();
          onClose();
          setPaymentStatus("pending");
          setCashReceived("");
          setPaymentMethod("cash");
          setCardDetails({ number: "", expiry: "", cvv: "", holder: "" });
          setTransferDetails({ reference: "", bank: "" });
        }, 1500);
      } else {
        throw new Error("Error al generar la factura PDF");
      }
    } catch (error) {
      console.error("Error procesando la venta:", error);
      setPaymentStatus("failed");
      toast.error(
        paymentMethod === "card"
          ? "Pago con tarjeta rechazado. Intente con otro método."
          : paymentMethod === "transfer"
          ? "Transferencia no verificada. Confirme el pago."
          : "Error al procesar la venta. Intente nuevamente."
      );
      setIsProcessing(false);
    }
  };

  const paymentMethods = [
    { id: "cash" as PaymentMethod, name: "Efectivo", icon: DollarSign },
    { id: "card" as PaymentMethod, name: "Tarjeta", icon: CreditCard },
    {
      id: "transfer" as PaymentMethod,
      name: "Transferencia",
      icon: Smartphone,
    },
  ];

  const renderPaymentDetails = () => {
    switch (paymentMethod) {
      case "cash":
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2 sm:space-y-3"
          >
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="cashReceived" className="text-xs sm:text-sm">
                Efectivo Recibido
              </Label>
              <Input
                id="cashReceived"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                className="h-10 sm:h-12 text-sm sm:text-base"
              />
            </div>
            {cashReceived &&
              Number.parseFloat(cashReceived) >= totalWithTax && (
                <div className="flex justify-between items-center p-2 sm:p-3 bg-muted rounded-lg">
                  <span className="font-medium text-xs sm:text-sm">
                    Cambio:
                  </span>
                  <Badge
                    variant="secondary"
                    className="text-sm sm:text-base px-2 sm:px-3 py-1"
                  >
                    ${change.toFixed(2)}
                  </Badge>
                </div>
              )}
          </motion.div>
        );

      case "card":
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="space-y-2">
              <Label htmlFor="cardNumber" className="text-xs sm:text-sm">
                Número de Tarjeta
              </Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardForm.data.number}
                onChange={(e) => cardForm.setField("number", e.target.value)}
                className="h-10 sm:h-12"
                aria-invalid={Boolean(cardForm.errors.number)}
                aria-describedby="cardNumber-help"
              />
              <span id="cardNumber-help" className="sr-only">Debe pasar validación Luhn, 13-19 dígitos</span>
              {cardForm.errors.number && (
                <p className="text-destructive text-xs">{cardForm.errors.number}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="expiry" className="text-xs sm:text-sm">
                  Fecha Exp.
                </Label>
                <Input
                  id="expiry"
                  placeholder="MM/AA"
                  value={cardForm.data.expiry}
                  onChange={(e) => cardForm.setField("expiry", e.target.value)}
                  className="h-10 sm:h-12"
                  aria-invalid={Boolean(cardForm.errors.expiry)}
                  aria-describedby="expiry-help"
                />
                <span id="expiry-help" className="sr-only">Formato MM/AA, debe ser futura</span>
                {cardForm.errors.expiry && (
                  <p className="text-destructive text-xs">{cardForm.errors.expiry}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv" className="text-xs sm:text-sm">
                  CVV
                </Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={cardForm.data.cvv}
                  onChange={(e) => cardForm.setField("cvv", e.target.value)}
                  className="h-10 sm:h-12"
                  aria-invalid={Boolean(cardForm.errors.cvv)}
                  aria-describedby="cvv-help"
                />
                <span id="cvv-help" className="sr-only">3 o 4 dígitos</span>
                {cardForm.errors.cvv && (
                  <p className="text-destructive text-xs">{cardForm.errors.cvv}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardHolder" className="text-xs sm:text-sm">
                Titular de la Tarjeta
              </Label>
              <Input
                id="cardHolder"
                placeholder="Nombre como aparece en la tarjeta"
                value={cardForm.data.holder}
                onChange={(e) => cardForm.setField("holder", e.target.value)}
                className="h-10 sm:h-12"
                aria-invalid={Boolean(cardForm.errors.holder)}
                aria-describedby="cardHolder-help"
              />
              <span id="cardHolder-help" className="sr-only">Mínimo 2 caracteres</span>
              {cardForm.errors.holder && (
                <p className="text-destructive text-xs">{cardForm.errors.holder}</p>
              )}
            </div>
          </motion.div>
        );

      case "transfer":
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
                💡 <strong>Instrucciones:</strong> Realice la transferencia por
                ${totalWithTax.toFixed(2)} y ingrese la referencia de pago.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank" className="text-xs sm:text-sm">
                Banco
              </Label>
              <Input
                id="bank"
                placeholder="Ej: Banco del Pichincha"
                value={transferForm.data.bank}
                onChange={(e) => transferForm.setField("bank", e.target.value)}
                className="h-10 sm:h-12"
                aria-invalid={Boolean(transferForm.errors.bank)}
                aria-describedby="bank-help"
              />
              <span id="bank-help" className="sr-only">Nombre del banco requerido</span>
              {transferForm.errors.bank && (
                <p className="text-destructive text-xs">{transferForm.errors.bank}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference" className="text-xs sm:text-sm">
                Número de Referencia
              </Label>
              <Input
                id="reference"
                placeholder="Ej: TRF-123456789"
                value={transferForm.data.reference}
                onChange={(e) =>
                  transferForm.setField("reference", e.target.value)
                }
                className="h-10 sm:h-12"
                aria-invalid={Boolean(transferForm.errors.reference)}
                aria-describedby="reference-help"
              />
              <span id="reference-help" className="sr-only">8-20 caracteres alfanuméricos</span>
              {transferForm.errors.reference && (
                <p className="text-destructive text-xs">
                  {transferForm.errors.reference}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="duna" className="text-xs sm:text-sm">
                Escanear Código (DUNA)
              </Label>
              <Input
                id="duna"
                placeholder="Pega el código escaneado"
                value={transferForm.data.dunaCode || ""}
                onChange={(e) => {
                  const code = e.target.value;
                  transferForm.setField("dunaCode", code);
                  if (code.includes(":")) {
                    const parts = code.split(":");
                    if (parts.length >= 3) {
                      transferForm.setField("bank", parts[1]);
                      transferForm.setField("reference", parts[2]);
                    }
                  }
                }}
                className="h-10 sm:h-12"
                aria-invalid={Boolean(transferForm.errors.dunaCode)}
                aria-describedby="duna-help"
              />
              <span id="duna-help" className="sr-only">Código opcional para completar banco y referencia</span>
              {transferForm.errors.dunaCode && (
                <p className="text-destructive text-xs">
                  {transferForm.errors.dunaCode}
                </p>
              )}
            </div>
          </motion.div>
        );
    }
  };

  const getButtonText = () => {
    if (isProcessing) {
      switch (paymentStatus) {
        case "processing":
          return "Procesando Pago...";
        case "completed":
          return "¡Pago Exitoso!";
        case "failed":
          return "Pago Fallido";
        default:
          return "Procesando...";
      }
    }
    return `Pagar $${totalWithTax.toFixed(2)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full sm:max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto p-3 sm:p-4 md:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold text-center">
            <Receipt className="h-4 w-4 sm:h-5 sm:w-5" />
            Procesar Pago
          </DialogTitle>
        </DialogHeader>

        {paymentStatus === "completed" ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-green-600 mb-2">
              ¡Pago Completado!
            </h3>
            <p className="text-sm text-muted-foreground">
              La factura se ha generado y descargado automáticamente.
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {/* Customer Info */}
            {true ? (
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    {(selectedCustomer || { customerType: "individual" }).customerType === "business" ? (
                      <Building className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                    ) : (
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">
                          {selectedCustomer ? selectedCustomer.name : "Consumidor Final"}
                        </h4>
                        <Badge
                          variant={
                            selectedCustomer && selectedCustomer.customerType === "business"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs px-2 py-0 h-5"
                        >
                          {selectedCustomer && selectedCustomer.customerType === "business"
                            ? "Empresa"
                            : "Consumidor Final"}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        {selectedCustomer?.phone && (
                          <p>📱 {selectedCustomer.phone}</p>
                        )}
                        {selectedCustomer?.ruc && (
                          <p>🏢 RUC: {selectedCustomer.ruc}</p>
                        )}
                        {selectedCustomer?.idNumber && !selectedCustomer?.ruc && (
                          <p>🆔 Cédula: {selectedCustomer.idNumber}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Order Summary */}
            <div className="space-y-2 sm:space-y-3">
              <h3 className="font-medium text-sm sm:text-base">
                Resumen del Pedido
              </h3>
              <div className="max-h-32 overflow-y-auto space-y-2 pr-1">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-xs sm:text-sm"
                  >
                    <span>
                      {item.name} x{item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Separator className="my-2" />
              <div className="space-y-1">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span>Subtotal:</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span>IVA (12%):</span>
                  <span>${(cartTotal * 0.12).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm sm:text-base">
                  <span>Total:</span>
                  <span>${totalWithTax.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-2 sm:space-y-3">
              <h3 className="font-medium text-sm sm:text-base">
                Método de Pago
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {paymentMethods.map((method) => (
                  <Button
                    key={method.id}
                    variant={
                      paymentMethod === method.id ? "default" : "outline"
                    }
                    onClick={() => setPaymentMethod(method.id)}
                    className="h-12 sm:h-14 flex flex-col gap-1 text-xs sm:text-sm px-2"
                  >
                    <method.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>{method.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Payment Details */}
            {renderPaymentDetails()}

            {selectedCustomer && (
              <div className="flex items-center gap-2 p-2 sm:p-3 bg-primary/5 rounded-lg">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                <p className="text-xs text-primary">
                  Se generará automáticamente una factura en PDF al completar el
                  pago
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 sm:gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isProcessing}
                className="flex-1 bg-transparent h-9 sm:h-10 text-xs sm:text-sm"
              >
                Cancelar
              </Button>
              <Button
                onClick={handlePayment}
                disabled={
                  isProcessing ||
                  (paymentMethod === "cash" &&
                    Number.parseFloat(cashReceived || "0") < totalWithTax) ||
                  (paymentMethod === "card" &&
                    !isCardValid) ||
                  (paymentMethod === "transfer" &&
                    !isTransferValid)
                }
                className="flex-1 h-9 sm:h-10 text-xs sm:text-sm"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                      className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full"
                    />
                    {getButtonText()}
                  </div>
                ) : (
                  getButtonText()
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
