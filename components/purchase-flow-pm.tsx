"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Loader from "@/components/loader"
import ReservationTimer from '@/components/ReservationTimer';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, User, CreditCard, ClockArrowUp, Copy, Check } from "lucide-react"
import Image from "next/image"
import { codificarId } from "@/lib/hashids"
import { supabase } from "@/lib/supabase-client" 
import SHA256 from "crypto-js/sha256"

interface Rifa {
  id: number
  titulo: string
  precio: number
  foto: string
  fecha_culminacion: string
}

interface PurchaseFlowProps {
  rifa: Rifa
}

interface BuyerData {
  name: string
  cedulaPrefijo: string,
  cedula: string
  email: string
  phonePrefix: string
  phoneNumber: string
  ticketQuantity: number
}

interface PaymentData {
  nombre: string
  bank: string
  senderPhone: string
  prefijoTelefono: string
  senderCedula: string
  cedulaPrefijo: string
  referencia: string // Cambiado de OTP a Referencia
}

interface RespuestaPago {
  success: boolean
  status: string
  message: string
  reference: string
  id: string
}

const phonePrefixes = [
  { value: "0412", label: "0412" },
  { value: "0422", label: "0422" },
  { value: "0414", label: "0414" },
  { value: "0424", label: "0424" },
  { value: "0416", label: "0416" },
  { value: "0426", label: "0426" },
]

const banks = [
  { value: "102", label: "BANCO DE VENEZUELA (0102)" },
  { value: "156", label: "100% BANCO (0156)" },
  { value: "172", label: "BANCAMIGA BANCO UNIVERSAL, C.A. (0172)" },
  { value: "114", label: "BANCARIBE (0114)" },
  { value: "171", label: "BANCO ACTIVO (0171)" },
  { value: "128", label: "BANCO CARONÍ (0128)" },
  { value: "163", label: "BANCO DEL TESORO (0163)" },
  { value: "175", label: "BANCO DIGITAL DE LOS TRABAJADORES (0175)" },
  { value: "115", label: "BANCO EXTERIOR (0115)" },
  { value: "151", label: "BANCO FONDO COMÚN (0151)" },
  { value: "105", label: "BANCO MERCANTIL (0105)" },
  { value: "191", label: "BANCO NACIONAL DE CREDITO (0191)" },
  { value: "138", label: "BANCO PLAZA (0138)" },
  { value: "137", label: "BANCO SOFITASA (0137)" },
  { value: "104", label: "BANCO VENEZOLANO DE CREDITO (0104)" },
  { value: "168", label: "BANCRECER (0168)" },
  { value: "134", label: "BANESCO (0134)" },
  { value: "177", label: "BANFANB (0177)" },
  { value: "146", label: "BANGENTE (0146)" },
  { value: "174", label: "BANPLUS (0174)" },
  { value: "108", label: "BBVA PROVINCIAL (0108)" },
  { value: "157", label: "DELSUR BANCO UNIVERSAL (0157)" },
  { value: "601", label: "INSTITUTO MUNICIPAL DE CREDITO POPULAR (0601)" },
  { value: "178", label: "N58 BANCO DIGITAL (0178)" },
  { value: "169", label: "R4 BANCO MICROFINANCIERO C.A. (0169)" },
];

export function PurchaseFlowPM({ rifa }: PurchaseFlowProps) {
  const [Feedback, setFeedback] = useState("");
  const [idReserva, setIdReserva] = useState("");
  const [pedidoId, setPedidoId] = useState<string | null>(null); // Guardar ID del pedido insertado
  const [fechaCompraBoletos, setFechaCompraBoletos] = useState<string | number>();
  
  const [modalConfirmacionCompra, setmodalConfirmacionCompra] = useState(false);
  const [modalConfirmacionOTP, setmodalConfirmacionOTP] = useState(false);
  const [currentStep, setCurrentStep] = useState(1)
  const [copied, setCopied] = useState(false)
  const [buyerData, setBuyerData] = useState<BuyerData>({
    name: "",
    cedulaPrefijo: "V-",
    cedula: "",
    email: "",
    phonePrefix: "0412",
    phoneNumber: "",
    ticketQuantity: 2,
  })
  const [paymentData, setPaymentData] = useState<PaymentData>({
    nombre: "",
    bank: "",
    senderPhone: "",
    prefijoTelefono: "0412",
    senderCedula: "",
    cedulaPrefijo: "V-",
    referencia: "",
  })
  const [respuestaPago, setRespuestaPago] = useState<RespuestaPago>({
    success: true,
    status: "",
    message: "",
    reference: "",
    id: ""
  })
  const [ticketNumbers, setTicketNumbers] = useState<number[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const totalAmount = buyerData.ticketQuantity * rifa.precio
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopyField = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatMonto = (amount: number) => {
    if (isNaN(amount) || amount < 0) {
      throw new Error("El monto debe ser un número válido y positivo.");
    }
    const formatted = amount.toFixed(2);
    const [integerPart] = formatted.split('.');
    if (integerPart.length > 8) {
      throw new Error(`El monto excede el límite permitido. Valor recibido: ${amount}`);
    }
    return formatted;
  }

  const cambiarValorCantidadBoletos = (valor:string) => {
    const value = valor;
    let newQuantity;

    if (value === "") {
      newQuantity = 0;
    } else {
      newQuantity = Number.parseInt(value);
      if (buyerData.ticketQuantity === 0 && newQuantity > 0 && newQuantity <= 100) {
        newQuantity = newQuantity;
      }
    }
    if (newQuantity >= 0 && newQuantity <= 100){
      setBuyerData({...buyerData, ticketQuantity: newQuantity,});
    }
  }

  const esNumeroValido = (text: string): boolean => {
    const num = Number(text);
    return Number.isInteger(num) && !text.includes(".");
  };
  
  async function reservarBoletos(cantidad:number, id_rifa:number) {
    const { data: boletos, error: errorBoletos } = await 
    supabase.rpc("boletos_aleatorios", {limite : cantidad, p_id_rifa : id_rifa});
    if (errorBoletos || !boletos || boletos.length < cantidad) {
      setFeedback("No hay suficientes boletos disponibles en este momento, por favor, Intentelo denuevo más tarde");
      return false;
    }
    const ids = boletos.map((b: { id: number }) => b.id);
    const id_aux = SHA256(ids.join(",")).toString();
    setIdReserva(id_aux);

    const { data, error } = await supabase.rpc('reservar_boletos', {
      p_ids: ids,
      p_id_reserva: id_aux,
    });
    if (error) {
      setFeedback("Error al reservar los boletos, por favor, Intentelo denuevo más tarde");
      return false;
    } else {
      if (data && data.length > 0) {
          const fechaInicio = new Date(data[0].fecha_compra);
          const tiempoExtraMs = 590000;
          const fechaExpiracionMs = fechaInicio.getTime() + tiempoExtraMs;
          setFechaCompraBoletos(fechaExpiracionMs);
      }
      setFeedback("");
      return true;
    }
  }

  const validateBuyerData = async () => {
    const newErrors: Record<string, string> = {}

    if (!buyerData.name.trim()) newErrors.name = "El nombre es requerido"
    if (!buyerData.cedula.trim()) newErrors.cedula = "La cédula es requerida"
    if (!buyerData.email.trim()) newErrors.email = "El correo es requerido"
    if (!buyerData.phonePrefix) newErrors.phonePrefix = "El prefijo es requerido"
    if (!buyerData.phoneNumber.trim()) newErrors.phoneNumber = "El número es requerido"
    if (buyerData.ticketQuantity < 1 || buyerData.ticketQuantity > 100) {
      newErrors.ticketQuantity = "Cantidad debe estar entre 1 y 100"
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (buyerData.email && !emailRegex.test(buyerData.email)) {
      newErrors.email = "Formato de correo inválido"
    }

    if (buyerData.cedula && buyerData.cedulaPrefijo) {
      const cedulaFormateada = `${buyerData.cedulaPrefijo}${buyerData.cedula}`;
      if (!cedulaFormateada.match(/^[VE]-?\d{7,8}$/i)) {
        newErrors.cedula = "Formato: V-12345678 o E-12345678"
      }
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return false;

    const respuestaBoletos = await reservarBoletos(buyerData.ticketQuantity, rifa.id);
    return respuestaBoletos;
  }

  const validatePaymentData = () => {
    const newErrors: Record<string, string> = {}

    if (!paymentData.nombre.trim()) newErrors.nombre = "El nombre es requerido"
    if (!paymentData.bank) newErrors.bank = "El banco es requerido"
    if (!paymentData.senderPhone.trim()) newErrors.senderPhone = "El teléfono es requerido"
    if (!paymentData.senderCedula.trim()) newErrors.senderCedula = "La cédula es requerida"
    if (!paymentData.referencia.trim()) newErrors.referencia = "La referencia es requerida"
    
    if (paymentData.referencia && paymentData.referencia.length < 4) {
      newErrors.referencia = "Debe incluir al menos los últimos 4 dígitos"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleBuyerDataSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback("");
    const isValid = await validateBuyerData();
    
    if (isValid) {
      try {
        const montoEnvio = formatMonto(totalAmount);
        const cedulaLimpia = buyerData.cedula.replace(/\D/g, '');
        // 1. CREAMOS EL PEDIDO ANTES DE QUE EL USUARIO ABRA SU BANCO
        const { data, error } = await supabase
          .from('Pedidos')
          .insert({
            cedula_cliente: cedulaLimpia,
            monto: montoEnvio,
            estatus: 'pendiente'
            // Dejamos referencia y banco en blanco por ahora
          })
          .select('id')
          .single();

        if (error) {
            setFeedback("Error preparando el pago. Intenta nuevamente.");
            console.error(error);
            return;
        }

        setPedidoId(data.id); // Guardamos el ID para el paso 3
        setCurrentStep(2);
        window.scrollTo(0, 0);

      } catch (error) {
        setFeedback("Error en el sistema. Inténtelo de nuevo.");
      }
    }
  }

  async function fetchBoletos() {
    if (idReserva) {
      const { data, error } = await supabase
        .from('Boletos')
        .select('id, id_rifa, numero_boleto')
        .eq('id_reserva', idReserva);

      if (error || !data) return null;
      return data.length > 0 ? data : null;
    }
    return null;
  }

  async function finalizarCompraBoleto(ids_numbers:number[]) {
    const { error } = await supabase
      .from("Boletos")
      .update({
        estado: "ocupado",
        fecha_compra: new Date().toISOString(),
        nombre_comprador: buyerData.name,
        cedula_comprador: `${buyerData.cedulaPrefijo}${buyerData.cedula}`,
        telefono_comprador: `${buyerData.phonePrefix}${buyerData.phoneNumber}`,
        correo_comprador: buyerData.email,
        id_reserva : null,
      })
      .in("id", ids_numbers)
      .eq("estado", "reservado");

      if (error) {
        setFeedback("Error al confirmar el pago en los boletos.")
        return false;
      }
      return true;
  }

  const handlePaymentSubmit: (e: React.FormEvent) => Promise<void> = async (e) => {
      e.preventDefault();
      setFeedback("");
      
      if (validatePaymentData()) {
        try {
          const telefonoLimpio = `${paymentData.prefijoTelefono}${paymentData.senderPhone}`;

          // 2. ACTUALIZAMOS EL PEDIDO EXISTENTE CON LA REFERENCIA Y EL BANCO
          const { error } = await supabase
            .from('Pedidos')
            .update({
              referencia_bancaria: paymentData.referencia,
              banco_emisor: paymentData.bank,
              telefono_emisor: telefonoLimpio
            })
            .eq('id', pedidoId); // Usamos el ID que guardamos en el Paso 1

          if (error) {
            if (error.code === '23505') {
                setFeedback("Esta referencia ya fue registrada. Verifica los datos.");
            } else {
                setFeedback("Error guardando el comprobante. Intenta nuevamente.");
            }
            return;
          }

          setCurrentStep(3); // Pasar a la pantalla de espera
          window.scrollTo(0, 0);

        } catch (error) {
          setFeedback("Error en el sistema. Intentelo de nuevo más tarde.");
        }
      }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let intentos = 0;
    const maxIntentos = 40; // 2 minutos máximo
    
    if (currentStep === 3 && pedidoId) {
      interval = setInterval(async () => {
        intentos++;

        if (intentos >= maxIntentos) {
          clearInterval(interval);
          setRespuestaPago({
            success: false,
            status: "TIEMPO AGOTADO",
            message: "No recibimos la confirmación del banco a tiempo. Verifica tu cuenta o intenta reportar la referencia nuevamente.",
            reference: paymentData.referencia,
            id: pedidoId
          });
          setmodalConfirmacionOTP(true);
          return;
        }

        // 1. Miramos el estado de nuestro Pedido
        const { data: pedido } = await supabase
          .from('Pedidos')
          .select('estatus')
          .eq('id', pedidoId)
          .single();

        if (pedido && pedido.estatus === 'pagado') {
          // ÉXITO: El webhook actualizó el pedido directamente
          clearInterval(interval);
          
          const boletosData = await fetchBoletos();
          if (boletosData && boletosData.length > 0) {
            const ids_numbers = boletosData.map(boleto => boleto.id);
            const numbers = boletosData.map(boleto => boleto.numero_boleto);
            
            await finalizarCompraBoleto(ids_numbers);
            setTicketNumbers(numbers);
            
            setRespuestaPago({
              success: true,
              status: "APROBADO",
              message: "Pago móvil confirmado por el banco.",
              reference: paymentData.referencia,
              id: pedidoId
            });
            setmodalConfirmacionOTP(true);
          }
        } else if (pedido && (pedido.estatus === 'rechazado' || pedido.estatus === 'reversado')) {
          // RECHAZO
          clearInterval(interval);
          setRespuestaPago({
            success: false,
            status: "RECHAZADO",
            message: "El pago fue rechazado por monto insuficiente o error bancario.",
            reference: paymentData.referencia,
            id: pedidoId
          });
          setmodalConfirmacionOTP(true);
        } else {
          // 2. Si sigue pendiente, BUSCAMOS EN EL BUZÓN DEL BANCO
          const { data: pagoRecibido } = await supabase
            .from('pagos_recibidos')
            .select('monto')
            .eq('referencia', paymentData.referencia)
            .eq('banco', paymentData.bank)
            .single();

          if (pagoRecibido) {
            // ¡El banco mandó el webhook antes de que el usuario llenara el formulario!
            if (pagoRecibido.monto >= parseFloat(totalAmount.toString())) {
              // Monto correcto: Actualizamos a pagado. El próximo ciclo del intervalo detectará el éxito.
              await supabase.from('Pedidos').update({ estatus: 'pagado' }).eq('id', pedidoId);
            } else {
              // Monto menor al esperado: Rechazamos.
              await supabase.from('Pedidos').update({ estatus: 'rechazado' }).eq('id', pedidoId);
            }
          }
        }
      }, 3000); 
    }
    return () => clearInterval(interval);
  }, [currentStep, pedidoId]);

  const copyTicketNumbers = () => {
    const numbersText = ticketNumbers.map((n) => n.toString().padStart(4, "0")).join(", ")
    navigator.clipboard.writeText(numbersText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-4">
      <div className="flex items-center space-x-4 mb-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                step <= currentStep ? "bg-primary text-primary-foreground" : "bg-gray-200 text-muted-foreground"
              }`}
            >
              {step === 1 && <User className="h-4 w-4" />}
              {step === 2 && <CreditCard className="h-4 w-4" />}
              {step === 3 && <ClockArrowUp className="h-4 w-4" />}
            </div>
            {step < 3 && <div className={`w-12 h-0.5 mx-2 ${step < currentStep ? "bg-primary" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>
    </div>
  )

  const renderTiempoRestante = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {fechaCompraBoletos && (
          <ReservationTimer expiryTimestamp={fechaCompraBoletos} />
        )}
      </div>
    </div>
  )

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex-col items-left space-x-2 space-y-2">
          <div className="flex gap-3">
            <User className="h-5 w-5 text-primary" />
            <span>Datos del Comprador</span>
          </div>
          <div className="flex-row pl-1">
            <p className="text-sm font-medium text-gray-600">Datos que aparecerán en sus boletos.</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleBuyerDataSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="">
              <Label htmlFor="name" >Nombre Completo *</Label>
              <Input
                id="name"
                type="text"
                value={buyerData.name}
                onChange={(e) => {
                  setBuyerData({ ...buyerData, name: e.target.value });
                  setPaymentData({ ...paymentData, nombre: e.target.value })}}
                required
                placeholder="Ingresa tu nombre completo"
                className={errors.name ? "border-red-500 mt-2" : " mt-2"}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="cedula">Cédula de Identidad *</Label>
              <div className="flex flex-row gap-1">
                <Select
                  value={buyerData.cedulaPrefijo}
                  onValueChange={(value) => {
                    setBuyerData({ ...buyerData, cedulaPrefijo: value });
                    setPaymentData({ ...paymentData, cedulaPrefijo: value })
                  }}
                  required
                >
                  <SelectTrigger className={errors.phonePrefix ? "border-red-500 mt-2" : " mt-2"}>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key={"V"} value={"V-"}>V</SelectItem>
                    <SelectItem key={"E"} value={"E-"}>E</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="cedula"
                  type="text"
                  value={buyerData.cedula}
                  onChange={(e) => {
                    if (esNumeroValido(e.target.value)) {
                      setBuyerData({ ...buyerData, cedula: e.target.value });
                      setPaymentData({ ...paymentData, senderCedula: e.target.value })
                    }
                  }}
                  required
                  maxLength={8}
                  minLength={7}
                  placeholder="12345678"
                  className={errors.cedula ? "border-red-500 mt-2" : " mt-2"}
                />
              </div>
              {errors.cedula && <p className="text-red-500 text-sm mt-1">{errors.cedula}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="email">Correo Electrónico *</Label>
            <Input
              id="email"
              type="email"
              value={buyerData.email}
              onChange={(e) => setBuyerData({ ...buyerData, email: e.target.value })}
              required
              placeholder="tu@email.com"
              className={errors.email ? "border-red-500 mt-2" : " mt-2"}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="phonePrefix">Operadora *</Label>
              <Select
                value={buyerData.phonePrefix}
                onValueChange={(value) => {
                  setBuyerData({ ...buyerData, phonePrefix: value });
                  setPaymentData({ ...paymentData, prefijoTelefono: value })
              }}
                required
              >
                <SelectTrigger className={errors.phonePrefix ? "border-red-500 mt-2" : " mt-2"}>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {phonePrefixes.map((prefix) => (
                    <SelectItem key={prefix.value} value={prefix.value}>
                      {prefix.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="phoneNumber">Número de Teléfono *</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={buyerData.phoneNumber}
                onChange={(e) => {
                  if (esNumeroValido(e.target.value)) {
                    setBuyerData({ ...buyerData, phoneNumber: e.target.value });
                    setPaymentData({ ...paymentData, senderPhone: e.target.value })
                  }
              }}
                required
                maxLength={7}
                minLength={7}
                placeholder="1234567"
                className={errors.phoneNumber ? "border-red-500 mt-2" : " mt-2"}
              />
              {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="ticketQuantity">Cantidad de Boletos (1-100) *</Label>
            <Input
              id="ticketQuantity"
              type="text"
              minLength={1}
              maxLength={3}
              value={buyerData.ticketQuantity}
              onChange={(e) => cambiarValorCantidadBoletos(e.target.value)}
              required
              className={errors.ticketQuantity ? "border-red-500 mt-2" : " mt-2"}
            />
            {errors.ticketQuantity && <p className="text-red-500 text-sm mt-1">{errors.ticketQuantity}</p>}
          </div>

          {/* ... Botones rápidos de boletos ... */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2 w-full justify-between">
              <Button type="button" className="w-2/7" variant={buyerData.ticketQuantity === 1 ? "default" : "seleccion"} onClick={() => cambiarValorCantidadBoletos("1")}>1</Button>
              <Button type="button" className="font-bold w-2/7" variant={buyerData.ticketQuantity === 2 ? "default" : "seleccion"} onClick={() => cambiarValorCantidadBoletos("2")}>2</Button>
              <Button type="button" className="font-bold w-2/7" variant={buyerData.ticketQuantity === 5 ? "default" : "seleccion"} onClick={() => cambiarValorCantidadBoletos("5")}>5</Button>
            </div>
            <div className="flex flex-row gap-2 w-full justify-between">
              <Button type="button" className="font-bold w-2/7" variant={buyerData.ticketQuantity === 10 ? "default" : "seleccion"} onClick={() => cambiarValorCantidadBoletos("10")}>10</Button>
              <Button type="button" className="font-bold w-2/7" variant={buyerData.ticketQuantity === 20 ? "default" : "seleccion"} onClick={() => cambiarValorCantidadBoletos("20")}>20</Button>
              <Button type="button" className="font-bold w-2/7" variant={buyerData.ticketQuantity === 50 ? "default" : "seleccion"} onClick={() => cambiarValorCantidadBoletos("50")}>50</Button>
            </div>
            <div className="flex flex-row gap-2 w-full justify-between">
                <Button type="button" className="font-bold w-5/11" variant={buyerData.ticketQuantity === 0 ? "bloqueado" : "outline2"} onClick={() => {const value = (buyerData.ticketQuantity - 1).toString(); cambiarValorCantidadBoletos(value);}}>-</Button>
                <Button type="button" className="font-bold w-5/11" variant={buyerData.ticketQuantity === 100 ? "bloqueado" : "outline2"} onClick={() => {const value = (buyerData.ticketQuantity + 1 ).toString(); cambiarValorCantidadBoletos(value);}}>+</Button>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total a pagar:</span>
              <span className="text-2xl font-bold text-primary">{totalAmount}Bs</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {buyerData.ticketQuantity} boleto{buyerData.ticketQuantity > 1 ? "s" : ""} × {rifa.precio}Bs c/u
            </p>
          </div>
          <div className="flex flex-row text-md text-red-500 font-medium justify-center items-center">
            <span>{Feedback}</span>
          </div>

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            Continuar al Pago
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex-col items-left space-x-2 space-y-2">
          <div className="flex gap-3">
            <CreditCard className="h-5 w-5 text-primary" />
            <span>Realizar Pago Móvil</span>
          </div>
          <div className="flex-row pl-1">
            <p className="text-sm font-medium text-gray-600">Instrucciones y reporte de pago.</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Descomentado y adaptado para que el usuario vea a dónde transferir */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-6">
          <div className="flex flex-col space-y-4">
            <h3 className="font-semibold text-blue-800">Paso 1: Realiza un Pago Movil a estos Datos</h3>
            
            <div className="space-y-3 text-sm text-blue-900">
              {/* BANCO (Sin botón de copiar porque normalmente se selecciona en una lista) */}
              <div className="flex justify-between items-center border-b border-blue-100 pb-2">
                <span className="font-medium">Banco:</span>
                <span className="font-bold">R4 BANCO MICROFINANCIERO (0169)</span>
              </div>

              {/* TELÉFONO */}
              <div className="flex justify-between items-center border-b border-blue-100 pb-2">
                <span className="font-medium">Teléfono:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold">0414-9499194</span>
                  <button
                    type="button"
                    onClick={() => handleCopyField('04149499194', 'telefono')}
                    className="p-1.5 rounded-md bg-blue-100 hover:bg-blue-200 transition-all active:scale-90"
                    title="Copiar teléfono"
                  >
                    {copiedField === 'telefono' ? (
                      <Check className="w-4 h-4 text-green-600 animate-in zoom-in" />
                    ) : (
                      <Copy className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* CÉDULA */}
              <div className="flex justify-between items-center border-b border-blue-100 pb-2">
                <span className="font-medium">RIF/Cédula:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{paymentData.cedulaPrefijo}{paymentData.senderCedula}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyField(`${paymentData.senderCedula}`, 'cedula')}
                    className="p-1.5 rounded-md bg-blue-100 hover:bg-blue-200 transition-all active:scale-90"
                    title="Copiar cédula"
                  >
                    {copiedField === 'cedula' ? (
                      <Check className="w-4 h-4 text-green-600 animate-in zoom-in" />
                    ) : (
                      <Copy className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* MONTO */}
              <div className="flex justify-between items-center">
                <span className="font-medium">Monto Exacto:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">{totalAmount}Bs</span>
                  <button
                    type="button"
                    onClick={() => handleCopyField(totalAmount.toFixed(2), 'monto')}
                    className="p-1.5 rounded-md bg-blue-100 hover:bg-blue-200 transition-all active:scale-90"
                    title="Copiar monto"
                  >
                    {copiedField === 'monto' ? (
                      <Check className="w-4 h-4 text-green-600 animate-in zoom-in" />
                    ) : (
                      <Copy className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        <form onSubmit={handlePaymentSubmit} className="space-y-6">
          <h3 className="font-semibold text-gray-800">Paso 2: Reporta tu pago aquí</h3>
          <div>
            <Label htmlFor="bank">Banco desde donde transferiste *</Label>
            <Select
              value={paymentData.bank}
              onValueChange={(value) => setPaymentData({ ...paymentData, bank: value })}
              required
            >
              <SelectTrigger className={errors.bank ? "border-red-500" : ""}>
                <SelectValue placeholder="Seleccionar banco" />
              </SelectTrigger>
              <SelectContent>
                {banks.map((bank) => (
                  <SelectItem key={bank.value} value={bank.value}>
                    {bank.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.bank && <p className="text-red-500 text-sm mt-1">{errors.bank}</p>}
          </div>

          <div>
            <Label htmlFor="senderPhone">Teléfono afiliado al pago *</Label>
              <div className="flex flex-row gap-1">
                <Select
                  value={paymentData.prefijoTelefono}
                  onValueChange={(value) => {setPaymentData({ ...paymentData, prefijoTelefono: value })}}
                  required
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Prefijo" />
                  </SelectTrigger>
                  <SelectContent>
                      {phonePrefixes.map((prefix) => (
                        <SelectItem key={prefix.value} value={prefix.value}>
                          {prefix.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Input
                  id="senderPhone"
                  type="text"
                  value={paymentData.senderPhone}
                  onChange={(e) => {
                    if (esNumeroValido(e.target.value)){
                      setPaymentData({ ...paymentData, senderPhone: e.target.value })}}
                    }
                  required
                  maxLength={7}
                  minLength={7}
                  placeholder="1234567"
                  className={errors.senderPhone ? "border-red-500" : ""}
                />
              </div>
            {errors.senderPhone && <p className="text-red-500 text-sm mt-1">{errors.senderPhone}</p>}
          </div>

          <div>
            <Label htmlFor="senderCedula">Cédula afiliada al pago *</Label>
              <div className="flex flex-row gap-1">
                <Select
                  value={paymentData.cedulaPrefijo}
                  onValueChange={(value) => {setPaymentData({ ...paymentData, cedulaPrefijo: value })}}
                  required
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="V/E" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem key={"V"} value={"V-"}>V</SelectItem>
                      <SelectItem key={"E"} value={"E-"}>E</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="senderCedula"
                  type="text"
                  value={paymentData.senderCedula}
                  onChange={(e) =>{
                    if (esNumeroValido(e.target.value)) {
                      setPaymentData({ ...paymentData, senderCedula: e.target.value })}}
                    }
                  required
                  maxLength={8}
                  minLength={7}
                  placeholder="12345678"
                  className={errors.senderCedula ? "border-red-500" : ""}
                />
              </div>
            {errors.senderCedula && <p className="text-red-500 text-sm mt-1">{errors.senderCedula}</p>}
          </div>

          <div>
            <Label htmlFor="referencia">Número de Referencia (Últimos 6 dígitos)*</Label>
            <Input
              id="referencia"
              type="text"
              maxLength={6}
              minLength={6}
              value={paymentData.referencia}
              onChange={(e) => {
                if (esNumeroValido(e.target.value)) {
                  setPaymentData({ ...paymentData, referencia: e.target.value });
                }
              }}
              required
              placeholder="Ej. 123456"
              className={errors.referencia ? "border-red-500 mt-2" : " mt-2"}
            />
            <p className="text-xs text-gray-500 mt-1">Escribe los últimos 6 dígitos de la referencia.</p>
            {errors.referencia && <p className="text-red-500 text-sm mt-1">{errors.referencia}</p>}
          </div>

          <div className="flex flex-row text-md text-red-500 font-medium justify-center items-center">
            <span>{Feedback}</span>
          </div>

          <div className="flex space-x-4">
            <Button type="button" variant="outline" onClick={() => {setCurrentStep(1); window.scrollTo(0, 0);}} className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
              Verificar Pago
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-center space-x-2 text-center gap-2">
          <ClockArrowUp className="h-5 w-5 text-primary animate-pulse" />
          <span>Verificando tu pago...</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-6 py-10">
        <div className="flex flex-col items-center justify-center">
          <Loader />
          <p className="mt-6 font-medium text-gray-700">Estamos esperando la confirmación de la red interbancaria.</p>
          <p className="text-sm text-gray-500 mt-2">Por favor, no recargues ni cierres esta ventana.</p>
          <p className="text-xs text-gray-400 mt-4">Referencia: {paymentData.referencia}</p>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Comprar Boletos</h1>
        <p className="text-muted-foreground">{rifa.titulo}</p>
      </div>

      {renderStepIndicator()}

      {fechaCompraBoletos !== undefined && (
        renderTiempoRestante()
      )}

      <div className="grid lg:grid-cols-3 gap-8"> 
        {/* Main Content */}
        <div className="lg:col-span-2">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        {/* Sidebar */}
        <div>
          <Card className="sticky top-20">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <img
                  src={rifa.foto || "/placeholder.svg"}
                  alt={rifa.titulo}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <h3 className="font-semibold">{rifa.titulo}</h3>
                <p className="text-sm text-muted-foreground">{rifa.precio}Bs por boleto</p>
              </div>

              {currentStep < 3 && (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Cantidad:</span>
                    <span className="font-semibold">
                      {buyerData.ticketQuantity} boleto{buyerData.ticketQuantity > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Precio unitario:</span>
                    <span>{rifa.precio}Bs</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span className="text-primary">{totalAmount}Bs</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {modalConfirmacionOTP && (
        <>
          {respuestaPago.status === "APROBADO" && respuestaPago.success ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div
                className="absolute inset-x-0 z-0 flex items-center justify-center"
                style={{
                  transform:
                  typeof window !== "undefined" && window.innerWidth < 768
                    ? "translateY(-10rem)"
                    : "translateY(-8rem)",
                }}
                >
                <div className="w-80 h-80 sm:w-96 sm:h-96 md:w-[400px] md:h-[400px] relative">
                  <Image
                  src="/modelo2.png"
                  alt="Compra realizada exitosamente"
                  layout="fill"
                  objectFit="contain"
                  />
                </div>
              </div>
              <div className="relative z-10 w-11/12 max-w-md mx-auto text-center rounded-2xl bg-white/95 shadow-2xl overflow-hidden animate-fade-in">
                <div className="py-6 px-6">
                  <div className="">
                    <h2 className="text-3xl font-extrabold text-green-600 mb-2 animate-bounce-in">
                      ¡Pago Confirmado!
                    </h2>
                  </div>
                  <div className="flex flex-col rounded-xl border border-gray-300 px-6 py-4 bg-gray-200 my-6 justify-start items-start text-left">
                    <p className="text-gray-600 text-md mb-2 font-medium justify-start">
                      <span className="font-bold text-gray-700">Mensaje:</span> {respuestaPago.message}
                    </p>
                    <div className="flex items-center justify-between w-full">
                      <p className="text-gray-700 text-md font-medium justify-start">
                        <span className="font-bold text-gray-700 mr-2">Referencia:</span> {respuestaPago.reference}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setmodalConfirmacionOTP(false);
                      window.location.href = `/boletos/${codificarId(rifa.id)}/${buyerData.cedulaPrefijo}${buyerData.cedula}`;
                    }}
                    className="px-6 py-2 w-full font-semibold text-white bg-green-500 rounded-full hover:bg-green-600 transition-colors duration-200 shadow-md"
                  >
                    Ver mis boletos
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="relative z-10 w-11/12 max-w-md mx-auto text-center rounded-2xl bg-white/95 shadow-2xl overflow-hidden animate-fade-in">
              <div className="py-6 px-6">
                  <div className="">
                    <h2 className="text-3xl font-extrabold text-red-600 mb-2 animate-bounce-in">
                      Pago Rechazado
                    </h2>
                  </div>
                    <div className="flex flex-col rounded-xl border border-gray-300 px-6 py-4 bg-gray-200 my-6 justify-start items-start text-left">
                      <p className="text-gray-600 text-md font-medium">
                        {respuestaPago.message}
                      </p>
                    </div>
                  <button
                    onClick={() => {
                      setmodalConfirmacionOTP(false);
                      setCurrentStep(2); // Devolverlo al formulario para que intente de nuevo
                    }}
                    className="px-6 py-2 w-full font-bold text-white bg-gray-500 rounded-full hover:bg-gray-600 transition-colors duration-200 shadow-md"
                  >
                    Intentar de nuevo
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}