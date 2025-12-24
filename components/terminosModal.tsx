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
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-transparent bg-opacity-30 backdrop-blur-sm">
          <div className="flex flex-col item-center justify-center bg-white rounded-lg shadow-lg p-8 max-w-sm md:max-w-lg w-full mx-5">
            
            <div className="flex flex-col gap-2 mb-4">
              <p className="text-center font-bold text-black text-2xl">
                Terminos y Condiciones
              </p>
              <p className="text-center font-medium text-black text-md">
                Lea detenidamente cada uno de ellos
              </p>
            </div>

            <div className="flex flex-col mx-2 border border-gray-300 mb-4 rounded-md p-4 max-h-96 overflow-y-auto">
              {terminos.map((termino, index) => (
                <div key={index} className="mb-4">
                  <div className="flex flex-row my-2 items-center">
                    <Info className="text-primary mr-2" />
                    <h3 className="text-lg font-semibold text-black">{termino.titulo}</h3>
                  </div>
                  <p className="text-gray-700 text-justify">{termino.contenido}</p>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col gap-2 mb-4">
              <p className="text-center font-medium text-black text-md">
                Al precionar 'Aceptar y Continuar' usted acepta nuestros terminos y condiciones
              </p>
            </div>

            <div className="flex flex-row justify-center items-center">
              <Button className="mx-2" onClick={() => setModalTerminos(false)}>
                Aceptar y Continuar
              </Button>
              <Button variant="outline" className="mx-2" onClick={() => {window.location.href = "https://www.google.com"}}>
                Cerrar
              </Button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}
