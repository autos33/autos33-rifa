"use client";
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"

export function TerminosModal() {
  const [modalTerminos, setModalTerminos] = useState(true);

  const terminos = [
        {
        titulo: "Participación",
        contenido:
            "Para participar en esta rifa, el usuario debe ser mayor de 18 años y proporcionar información veraz y completa. La compra de boletos constituye la aceptación total de estos términos y condiciones.",
        },
        {
        titulo: "Sorteo y Premios",
        contenido:
            "El sorteo se realizará en la fecha especificada a través de nuestras redes sociales oficiales. Los premios se entregarán según las condiciones establecidas y no podrán ser canjeados por dinero en efectivo.",
        },
        {
        titulo: "Responsabilidades",
        contenido:
            "La organización se reserva el derecho de verificar la identidad de los ganadores y descalificar cualquier participación fraudulenta. Los participantes son responsables de proporcionar datos correctos para el contacto.",
        },
        {
        titulo: "Modificaciones",
        contenido:
            "La organización se reserva el derecho de modificar estos términos y condiciones en cualquier momento. Cualquier cambio será comunicado a través de nuestros canales oficiales con la debida anticipación.",
        },
    ]
  
  return (
    <>
    {modalTerminos && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
          {/* Añadimos max-h-[85vh] para que nunca supere el 85% del alto de la pantalla */}
          <div className="flex flex-col bg-white rounded-lg shadow-lg p-6 max-w-sm md:max-w-lg w-full mx-4 max-h-[85vh]">
            
            {/* Cabecera del modal (flex-none para que no se encoja) */}
            <div className="flex-none flex flex-col gap-2 mb-4">
              <p className="text-center font-bold text-black text-2xl">
                Términos y Condiciones
              </p>
              <p className="text-center font-medium text-gray-600 text-sm md:text-md">
                Lea detenidamente cada uno de ellos
              </p>
            </div>

            {/* Contenedor de los términos (flex-1 para que ocupe el espacio disponible y overflow-y-auto para el scroll) */}
            <div className="flex-1 overflow-y-auto mx-1 border border-gray-300 mb-4 rounded-md p-4">
              {terminos.map((termino, index) => (
                <div key={index} className="mb-4 last:mb-0">
                  <div className="flex flex-row mb-2 items-center">
                    <Info className="text-primary mr-2 h-5 w-5 flex-shrink-0" />
                    <h3 className="text-lg font-semibold text-black">{termino.titulo}</h3>
                  </div>
                  <p className="text-gray-700 text-sm md:text-base text-justify leading-relaxed">
                    {termino.contenido}
                  </p>
                </div>
              ))}
            </div>
            
            {/* Footer del modal (flex-none) */}
            <div className="flex-none flex flex-col gap-4">
              <p className="text-center font-medium text-gray-600 text-xs md:text-sm">
                Al presionar 'Aceptar y Continuar' usted acepta nuestros términos y condiciones
              </p>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
                <Button className="w-full sm:w-auto" onClick={() => setModalTerminos(false)}>
                  Aceptar y Continuar
                </Button>
                <Button variant="outline" className="w-full sm:w-auto" onClick={() => {window.location.href = "https://www.google.com"}}>
                  Cerrar
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  )
}