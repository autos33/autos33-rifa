"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase-client" 
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, DollarSign, Banknote } from "lucide-react"
import { codificarId } from "@/lib/hashids"
import Link from "next/link"

interface Rifa {
  id: number
  titulo: string
  detalles: string
  precio: number
  fecha_culminacion: string
  foto: string | null
  estado: 'activa' | 'proximamente' | 'finalizada'
  ticketsSold?: number
  cantidad_boletos: number
}

export function RifasSection() {
  const [rifas, setRifas] = useState<Rifa[]>([]) 
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRifas = async () => {
      setLoading(true)
      setError(null)
      const { data: updateData, error: updateError } = await supabase.rpc('actualizar_rifas');
      if (updateError) {
        alert('Error interno en el servidor, por favor intente más tarde.');
      }
      
      // Obtener todas las rifas activas o próximas
      const { data: rifasData, error: rifasError } = await supabase
        .from('Rifas')
        .select('*')
        .or('estado.eq.activa,estado.eq.proximamente') 
        .order('estado', { ascending: true }) 

      if (rifasError) {
        console.error('Error al cargar rifas:', rifasError)
        setError(rifasError.message)
        setLoading(false)
        return
      }

      if (!rifasData || rifasData.length === 0) {
        setRifas([])
        setLoading(false)
        return
      }

      const countPromises = rifasData.map(rifa => 
        supabase
          .from('Boletos')
          .select('id_rifa', { count: 'exact', head: true })
          .eq('id_rifa', rifa.id)
          .eq('estado', 'ocupado') // Filtra por boletos vendidos/ocupados
      )

      const countResults = await Promise.all(countPromises)

      const rifasWithCounts: Rifa[] = rifasData.map((rifa, index) => {
        const countError = countResults[index].error
        const countValue = countResults[index].count ?? 0

        if (countError) {
          console.warn(`Error al contar boletos para la rifa ${rifa.id}:`, countError)
        }

        return {
          ...rifa,
          ticketsSold: countValue,
        } as Rifa
      })
      
      setRifas(rifasWithCounts)
      setLoading(false)
    }

    fetchRifas()
  }, [])

  if (loading) {
    return (
        <section className="my-16 py-8 md:py-16 bg-muted/30 text-center">
            <p className="text-xl">Cargando rifas disponibles...</p>
        </section>
    )
  }

  if (error) {
    return (
        <section className="my-16 py-8 md:py-16 bg-muted/30 text-center">
            <p className="text-xl text-red-600">Error al cargar las rifas: {error}</p>
        </section>
    )
  }

  return (
    <section id="rifas" className="my-16 py-8 md:py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Rifas Disponibles</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Participa en nuestras rifas activas y ten la oportunidad de ganar increíbles vehículos.
          </p>
        </div>

        <div className="space-y-8">
          {rifas.length === 0 ? (
            <p className="text-center text-xl text-muted-foreground">No hay rifas activas o próximas en este momento.</p>
          ) : (
            rifas.map((rifa) => (
              <Card
                key={rifa.id}
                className="bg-card border-border shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <CardContent className="p-0">
                  <div className="grid lg:grid-cols-2 gap-0">
                    {/* foto */}
                    <div className="relative h-64 lg:h-80">
                      <img
                        src={rifa.foto || "/placeholder.svg"}
                        alt={rifa.titulo}
                        className="w-full h-full object-cover rounded-l-lg lg:rounded-l-lg lg:rounded-r-none rounded-r-lg lg:rounded-tr-none"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge
                          variant={rifa.estado === "activa" ? "default" : "secondary"}
                          className={rifa.estado === "activa" ? "bg-primary text-primary-foreground" : ""}
                        >
                          {rifa.estado}
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 lg:p-8 flex flex-col justify-between">
                      <div>
                        <h3 className="text-2xl lg:text-3xl font-bold text-card-foreground mb-3">{rifa.titulo}</h3>
                        <p className="text-muted-foreground mb-6 text-base lg:text-lg leading-relaxed">
                          {rifa.detalles}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                          <div className="flex items-center space-x-2">
                            <Banknote className="h-5 w-5 text-primary" />
                            <span className="text-card-foreground">
                              <span className="font-bold text-xl">{rifa.precio.toString()} Bs </span> por boleto
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span>
                              <Calendar className="h-5 w-5 text-primary" />
                              {new Date(rifa.fecha_culminacion).toLocaleDateString("es-ES", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric"
                              }).replace(/^(\d{2}) ([a-záéíóúñ]+) (\d{4})$/, "$1 de $2, $3")}
                            </span>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mb-6">
                          <div className="flex justify-between text-sm text-muted-foreground mb-2">
                            <span>Progreso de venta</span>
                            <span>{Math.round(((rifa.ticketsSold ?? 0) / rifa.cantidad_boletos) * 100)}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${((rifa.ticketsSold ?? 0) / rifa.cantidad_boletos) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <Link href={rifa.estado === "activa" ? `/rifa/${codificarId(rifa.id)}` : "#"}>
                        <Button
                          className="w-full bg-primary hover:bg-primary/80 text-primary-foreground text-lg py-3"
                          disabled={rifa.estado === "proximamente"}
                        >
                          {rifa.estado === "proximamente" ? "Próximamente" : "Comprar Boletos"}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  )
}