"use client"
import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PurchaseFlow } from "@/components/purchase-flow"
import { supabase } from "@/lib/supabase-client" 
import { decodificarId } from "@/lib/hashids"

interface RifaCompra {
  id: number
  titulo: string
  precio: number
  foto: string
  fecha_culminacion: string
}

export default function ComprarPage({ params }: { params: { id: string } }) {
  const [rifa, setRifa] = useState<RifaCompra | null>(null)
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

      const { data, error: dbError } = await supabase
        .from("Rifas")
        .select("id, titulo, precio, foto, fecha_culminacion")
        .eq("id", rifaId)
        .single() // Espera un único registro

      if (dbError) {
        console.error("Error al obtener la rifa:", dbError)
        setError("Error al cargar la información de la rifa.")
        setIsLoading(false)
        return
      }

      if (data) {
        setRifa(data as RifaCompra)
      }
      setIsLoading(false)
    }

    if (rifaId !== null) {
      fetchRifaData()
    } else {
      setIsLoading(false)
      setError("ID de rifa no válido.")
    }
  }, [rifaId]) // Se ejecuta al cambiar el ID

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

  // Mostrar mensaje de error
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
    setIsLoading(false)
    window.location.href = "/"
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Rifa no encontrada</h1>
            <p className="text-muted-foreground">La rifa que buscas no existe o ha sido removida.</p>
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
        <PurchaseFlow rifa={rifa} />
      </main>
      <Footer />
    </div>
  )
}