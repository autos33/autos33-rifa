"use client";

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ShareTicketButton from "@/components/ShareTicketButton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Download, Check, Copy, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase-client" 
import { codificarId } from "@/lib/hashids"
import { decodificarId } from "@/lib/hashids"
import Link from "next/link"

interface Rifa {
  id: number
  titulo: string
  precio: number
  foto: string
  fecha_culminacion: string
  estado: string
}

interface Boleto {
  numero_boleto: string
  fecha_compra: string
  nombre_comprador: string
}

interface ComprarPageParams {
  params: {
    id_rifa: string
    cedula: string
  }
}

export default function ComprarPage({ params }: ComprarPageParams) {
  const rifaId = decodificarId(params.id_rifa) 
  const cedulaComprador = params.cedula 

  const [rifa, setRifa] = useState<Rifa | null>(null)
  const [boletos, setBoletos] = useState<Boleto[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [urlTickets, setUrlTickets] = useState<string | null>(null) 
  const [loadingDescargaTickets, setloadingDescargaTickets] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // 3. Validación de seguridad
    // Si rifaId es null, el hash era inválido.
    if (rifaId === null) {
      setError("El enlace de la rifa no es válido.")
      setIsLoading(false)
      return
    }

    if (!cedulaComprador) {
      setError("No se especificó la cédula del comprador.")
      setIsLoading(false)
      return
    }

    const fetchRifaData = async () => {
      setIsLoading(true)
      setError(null)

      // Aquí rifaId ya es seguro un 'number'
      const { data: rifaData, error: rifaError } = await supabase
        .from("Rifas")
        .select("id, titulo, precio, foto, fecha_culminacion, estado")
        .eq("id", rifaId) 
        .single()

      if (rifaError || !rifaData) {
        setError("Rifa no encontrada o error de carga.")
        setIsLoading(false)
        return
      }
      
      if (rifaData.estado !== "activa") {
        setError("La rifa no está activa.")
        setIsLoading(false)
        return
      }

      setRifa(rifaData as Rifa) 

      const { data: boletosData, error: boletosError } = await supabase
        .from("Boletos")
        .select("numero_boleto, fecha_compra, nombre_comprador")
        .eq("id_rifa", rifaId) 
        .eq("cedula_comprador", cedulaComprador)
        .order("fecha_compra", { ascending: false })

      if (boletosError) {
        console.error("Error al obtener los boletos:", boletosError)
        setError("Error al cargar los boletos comprados.")
        setIsLoading(false)
        return
      }
      
      setBoletos(boletosData as Boleto[]) 
      setIsLoading(false)
    }

    fetchRifaData()
  }, [rifaId, cedulaComprador])

  const copyTicketNumbers = () => {
    if (!boletos || boletos.length === 0) return
    const numbersText = boletos.map((n) => n.numero_boleto.toString().padStart(4, "0")).join(", ")
    navigator.clipboard.writeText(numbersText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleGenerarPDF = async () => {
    if (!rifa || !boletos || boletos.length === 0) {
      alert('No hay boletos para generar el PDF.');
      return;
    }
    
    setloadingDescargaTickets(true);
    const ticketNumbersFormatted = boletos.map(boleto => boleto.numero_boleto.toString().padStart(4, "0"));
    const tituloLimpio = rifa.titulo.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ .,:;-]/g, '').trim();
    const pdfData = {
      nombreRifa: tituloLimpio,
      fechaJuego: rifa.fecha_culminacion,
      cedula: cedulaComprador,
      boletos: ticketNumbersFormatted,
    };
    
    try {
      const response = await fetch('/api/pdf_boletos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pdfData),
      });
      if (!response.ok) {
        throw new Error('Error al generar el PDF');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `boletos_${cedulaComprador}_${tituloLimpio}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Hubo un problema con la operación de fetch:', error);
      alert('Error al generar el PDF. Por favor, inténtalo de nuevo.');
    } finally {
      setloadingDescargaTickets(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-16 flex items-center justify-center min-h-[calc(100vh-64px)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-3 text-lg">Cargando datos de la rifa...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !rifa) {
    return (
        <div className="min-h-screen">
            <Navbar />
            <main className="pt-16 flex items-center justify-center min-h-[calc(100vh-64px)]">
            <div className="text-center p-8 bg-card rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold text-destructive mb-4">
                {error || "Rifa no encontrada"}
                </h1>
                <p className="text-muted-foreground">
                {error ? "Por favor, verifica el enlace." : "La rifa que buscas no existe o ha sido removida."}
                </p>
                <Link href="/" className="mt-4 inline-block">
                    <Button>Volver al Inicio</Button>
                </Link>
            </div>
            </main>
            <Footer />
        </div>
    )
  }
  
  const ticketNumbers = boletos ? boletos.map(b => b.numero_boleto) : [];
  
  if (boletos && boletos.length === 0) {
    return (
        <div className="min-h-screen">
            <Navbar />
            <main className="pt-16 flex items-center justify-center min-h-[calc(100vh-64px)]">
            <div className="text-center p-8 bg-card rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold text-foreground mb-4">
                ¡Aún no hay boletos para {cedulaComprador}!
                </h1>
                <p className="text-muted-foreground mb-6">
                No se encontraron boletos comprados con esa cédula para la rifa <strong>{rifa.titulo}</strong>.
                </p>
                <Link href={`/rifa/${rifa.id}`} className="mt-4 inline-block">
                    <Button>Comprar Boletos</Button>
                </Link>
            </div>
            </main>
            <Footer />
        </div>
    )
  }
  

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Boletos de {boletos && boletos.length > 0 ? boletos[0].nombre_comprador : ""}
            </h1>
            <p className="text-muted-foreground">{rifa.titulo}</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-center space-x-2 text-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>¡Tus Boletos!</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-800 mb-2">Recuerda</h3>
                    <p className="text-green-700">Puedes guardar o compartir tus boletos utilizando los siguientes botones</p>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-4">
                      <h3 className="font-semibold">Tus Números de Boletos:</h3>
                      <div className="flex flex-col mt-2 gap-2">
                        <div className="flex flex-col md:flex-row gap-2">
                          <ShareTicketButton 
                            rifa={rifa}
                            boletos={boletos || []}
                            cedulaComprador={cedulaComprador}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleGenerarPDF}
                            className="flex items-center space-x-1 bg-transparent"
                            disabled={loadingDescargaTickets}
                          >
                            <Download className="h-4 w-4" />
                            <span>{loadingDescargaTickets ? "Descargando..." : "Descargar"}</span>
                          </Button>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyTicketNumbers}
                          className="flex items-center space-x-1 bg-transparent"
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          <span>{copied ? "Copiado" : "Copiar"}</span>
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {ticketNumbers.map((number, index) => (
                        <Badge key={index} variant="outline" className="flex justify-center items-center text-lg py-2 px-3 font-mono">
                          {number.toString().padStart(4, "0")}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Puede volver a consultar estos números con la cédula ingresada<br></br><strong>{cedulaComprador}</strong></p>
                    <p>• El sorteo se realizará el día <span> 
                        {new Date(rifa.fecha_culminacion).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric"
                        }).replace(/^(\d{2}) ([a-záéíóúñ]+) (\d{4})$/, " $1 de $2, $3")}
                      </span>
                    </p> 
                    <p>• El sorteo se realiza en base a los resultados de Super Gana</p>
                    <p>• Los números de boletos se asignan automáticamente</p>
                    <p>• El primer premio será el resultado de Super Gana 10:00 p.m.</p>
                    <p>• El segundo premio será el resultado de Super Gana 4:00 p.m.</p>
                    <p>• El tercer premio será el resultado de Super Gana 1:00 p.m.</p>
                    <p>• Los ganadores serán contactados inmediatamente</p>
                    <p>• Todos los premios incluyen documentación legal</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href={`/rifa/${codificarId(rifa.id)}`} className="flex-1">
                      <Button variant="outline" className="w-full bg-transparent">
                        Ver Rifa
                      </Button>
                    </Link>
                    <Link href="/" className="flex-1">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Volver al Inicio</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
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
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}