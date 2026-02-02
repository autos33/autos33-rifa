"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { RifaDetails } from "@/components/rifa-details"
import { supabase } from "@/lib/supabase-client" 
import { decodificarId } from "@/lib/hashids"

interface Premio {
  id: number
  titulo: string
  descripcion: string
  foto_url: string
  id_rifa: number
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

export default function RifaPage({ params }: { params: { id: string } }) {
  const [rifa, setRifa] = useState<Rifa | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const rifaId = decodificarId(params.id)

  useEffect(() => {
    const fetchRifaData = async () => {
      setIsLoading(true)
      setError(null)
      if (rifaId === null) {
        setIsLoading(false)
        setError("El código de la rifa no es válido.")
        window.location.href = "/" 
        return
      }

      const { data: rifaData, error: rifaError } = await supabase
        .from("Rifas")
        .select("*")
        .eq("id", rifaId)
        .single()

      if (!rifaData) {
        setIsLoading(false)
        window.location.href = "/"
        return
      }

      if (rifaError) {
        console.error("Error al obtener la rifa:", rifaError)
        setError("Error al cargar la información de la rifa.")
        setIsLoading(false)
        return
      }

      const { data: premiosData, error: premiosError } = await supabase
        .from("Premios")
        .select("*")
        .eq("id_rifa", rifaId)
        .order("id", { ascending: true })

      if (premiosError) {
        console.error("Error al obtener los premios:", premiosError)
      }

      const fullRifaData: Rifa = {
        ...(rifaData as Rifa),
        premios: Array.isArray(premiosData) ? premiosData as Premio[] : [],
      }

      setRifa(fullRifaData)
      if (rifaData.estado !== "activa") {
        setIsLoading(false)
        window.location.href = "/"
        return
      }
      setIsLoading(false)
    }

    if (rifaId !== null) {
      fetchRifaData()
    } else {
      // Manejo si el hash inicial estaba malformado
      setIsLoading(false)
      setError("Enlace de rifa inválido.")
    }
  }, [rifaId])

  useEffect(() => {
    async function liberarBoletos() {
      const { data: data, error: error } = await supabase.rpc('liberar_boletos_reservados');
      if (error) {
        console.error('Error al liberar boletos:', error);
      } else {
      }
    }
    liberarBoletos();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-16 flex items-center justify-center min-h-screen">
          <p className="text-xl text-foreground">Cargando detalles de la rifa...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Error de Carga</h1>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!rifa) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Rifa no encontrada</h1>
            <p className="text-muted-foreground">
              La rifa con el ID {rifaId} no existe o ha sido removida.
            </p>
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
        <RifaDetails rifa={rifa} /> 
      </main>
      <Footer />
    </div>
  )
}