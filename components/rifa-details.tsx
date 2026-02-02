"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, DollarSign, Trophy, Users, Clock, Gift, Banknote } from "lucide-react"
import Link from "next/link" 
import { useState } from "react";
import { codificarId } from "@/lib/hashids"

interface Premio {
  id: number
  titulo: string
  descripcion: string
  foto_url: string
}

interface Rifa {
  id: number
  titulo: string
  detalles: string
  precio: number
  fecha_culminacion: string
  foto: string
  estado: string
  cantidad_boletos: number
  premios: Premio[]
}

interface DatosConsultar {
  cedulaPrefijo: string,
  cedula: string,
}

interface ErroresConsultar {
  errorCedula: string | null,
  errorPrefijoCedula: string | null,
}

interface RifaDetailsProps {
  rifa: Rifa
}

export function RifaDetails({ rifa }: RifaDetailsProps) {
  const [datosConsultar, setDatosConsultar] = useState<DatosConsultar>({
    cedulaPrefijo: "V-",
    cedula: "",
  })
  const [errorConsultar, setErrorConsultar] = useState<ErroresConsultar>({
    errorCedula:  null,
    errorPrefijoCedula:  null,
  })

  {/*
  const progressPercentage = Math.round((rifa.ticketsSold / rifa.cantidad_boletos) * 100)
  const remainingTickets = rifa.cantidad_boletos - rifa.ticketsSold
  */}

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <Badge
            variant={rifa.estado === "activa" ? "default" : "secondary"}
            className={rifa.estado === "activa" ? "bg-primary text-primary-foreground" : ""}
          >
            {rifa.estado}
          </Badge>
          <span className="text-muted-foreground">Rifa #{rifa.id}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{rifa.titulo}</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Image */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <img
                src={rifa.foto || "/placeholder.svg"}
                alt={rifa.titulo}
                className="w-full h-64 sm:h-80 lg:h-96 object-cover"
              />
            </CardContent>
          </Card>

          {/* descripcion */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Gift className="h-5 w-5 text-primary" />
                <span>Descripción del Premio</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{rifa.detalles}</p>
            </CardContent>
          </Card>

          {/* Premios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-primary" />
                <span>Premios de la Rifa</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-6">
                {rifa.premios.map((premio, index) => (
                  <div key={premio.id} className="border border-border rounded-lg p-4">
                    <div className="relative h-32 mb-3 rounded-lg overflow-hidden">
                      <img
                        src={premio.foto_url || "/placeholder.svg"}
                        alt={premio.titulo}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="text-xs">
                          {index + 1}° Premio
                        </Badge>
                      </div>
                    </div>
                    <h4 className="font-semibold text-card-foreground mb-2">{premio.titulo}</h4>
                    <p className="text-sm text-muted-foreground">{premio.descripcion}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Purchase Card */}
          <Card className=""> {/*sticky top-20*/}
            <CardHeader>
              <CardTitle className="text-center">Comprar Boletos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* precio */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Banknote className="h-6 w-6 text-primary" />
                  <span className="text-3xl font-bold text-foreground">{rifa.precio}Bs</span>
                </div>
                <p className="text-muted-foreground">por boleto</p>
              </div>

              {/* Stats */}
              <div className="space-y-4">
                {/* 
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Boletos vendidos</span>
                  </div>
                  <span className="font-semibold">{rifa.ticketsSold.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Boletos disponibles</span>
                  </div>
                  <span className="font-semibold text-primary">{remainingTickets.toLocaleString()}</span>
                </div>
                */}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Fecha del sorteo</span>
                  </div>
                  <span>
                    {new Date(rifa.fecha_culminacion).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                    }).replace(/^(\d{2}) ([a-záéíóúñ]+) (\d{4})$/, "$1 de $2, $3")}
                  </span>
                </div>
              </div>

              {/* Progress */}
              {/* 
              <div>
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Progreso de venta</span>
                  <span>{progressPercentage}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="bg-primary h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
              */}

              {/* Buy Button */}
              <Link href={`/comprar/${codificarId(rifa.id)}`}>
                <Button
                  className="w-full bg-primary hover:bg-primary/70 text-primary-foreground text-lg py-3 min-h-15"
                  disabled={rifa.estado === "Próximamente"}
                >
                  {rifa.estado === "Próximamente" ? "Próximamente" : "Comprar Boletos"}
                </Button>
              </Link>

              {rifa.estado === "Activa" && (
                <p className="mt-2 text-xs text-muted-foreground text-center">
                  Los boletos se asignan automáticamente al confirmar la compra
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="">
            <CardHeader>
              <CardTitle className="text-center">Mis Boletos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="cedula">Cédula de Identidad *</Label>
                <div className="flex flex-row gap-1">
                  <Select
                  value={datosConsultar.cedulaPrefijo}
                  onValueChange={(value) => setDatosConsultar({ ...datosConsultar, cedulaPrefijo: value })}
                  required
                  >
                  <SelectTrigger className={errorConsultar.errorPrefijoCedula ? "border-red-500 mt-2" : " mt-2"}>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key={"V"} value={"V-"}>
                    {"V"}
                    </SelectItem>
                    <SelectItem key={"E"} value={"E-"}>
                    {"E"}
                    </SelectItem>
                  </SelectContent>
                  </Select>
                  <Input
                  id="cedula"
                  type="text"
                  value={datosConsultar.cedula}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                    setDatosConsultar({ ...datosConsultar, cedula: value });
                    }
                  }}
                  required
                  maxLength={8}
                  minLength={7}
                  placeholder="12345678"
                  className={errorConsultar.errorCedula ? "border-red-500 mt-2" : " mt-2"}
                  />
                </div>
                {errorConsultar.errorCedula && <p className="text-red-500 text-sm mt-1">{errorConsultar.errorCedula}</p>}
              </div>
                <Button
                className="w-full bg-primary hover:bg-primary/70 text-primary-foreground text-lg py-3"
                disabled={
                  rifa.estado === "Próximamente" ||
                  datosConsultar.cedula.length < 7 ||
                  datosConsultar.cedula.length > 8
                }
                onClick={() => {
                  if (datosConsultar.cedula.length < 7 || datosConsultar.cedula.length > 8) {
                  setErrorConsultar((prev) => ({
                    ...prev,
                    errorCedula: "Cédula incorrecta",
                  }))
                  } else {
                  setErrorConsultar((prev) => ({
                    ...prev,
                    errorCedula: null,
                  }))
                  window.location.href = `/boletos/${codificarId(rifa.id)}/${datosConsultar.cedulaPrefijo}${datosConsultar.cedula}`
                  }
                }}
                >
                Consultar
                </Button>

              <p className="mt-2 text-xs text-muted-foreground text-center">
                Consulta tus boletos comprado solo ingresando tu cédula de indentidad
              </p>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Clock className="h-5 w-5 text-primary" />
                <span>Información Importante</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>• El sorteo se realizará en la fecha programada</p>
              <p>• El sorteo se realiza en base a los resultados de Super Gana</p>
              <p>• Los números de boletos se asignan automáticamente</p>
              <p>• El primer premio será el resultado de Super Gana 10:00 p.m.</p>
              <p>• El segundo premio será el resultado de Super Gana 4:00 p.m.</p>
              <p>• El tercer premio será el resultado de Super Gana 1:00 p.m.</p>
              <p>• Los ganadores serán contactados inmediatamente</p>
              <p>• Todos los premios incluyen documentación legal</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
