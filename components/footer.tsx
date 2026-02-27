import Link from "next/link"
import Image from "next/image"  
import { Facebook, Instagram, Phone, Mail, MapPin, PartyPopper, CarFront } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-3">
            <Link href="/" aria-label="go home" className="block">
              <Image
                src="/LogoganaConAutos33alternativo.png"
                width={120}
                height={120}
                className="object-cover"
                alt="Gana con Autos 33"
              />
            </Link>
            <span className="text-gray-400 text-sm">RIF: J-50761249-0</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Tu plataforma confiable para participar en rifas de autos. Compra, vende y consigna con total seguridad y
              transparencia.
            </p>
            <div className="flex space-x-4">
              <Link href="https://www.facebook.com/p/autos33_-100064301034403" className="text-gray-400 hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="https://www.instagram.com/ganaconautos33" className="text-gray-400 hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="https://www.instagram.com/autos33premios" className="text-gray-400 hover:text-primary transition-colors">
                <PartyPopper className="h-5 w-5" />
              </Link>
              <Link href="https://www.instagram.com/autos33_" className="text-gray-400 hover:text-primary transition-colors">
                <CarFront className="h-5 w-5"/>
              </Link>
              {/* 
              <Link href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              */}
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-primary transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="#rifas" className="text-gray-400 hover:text-primary transition-colors">
                  Rifas
                </Link>
              </li>
              <li>
                <Link href="#ganadores" className="text-gray-400 hover:text-primary transition-colors">
                  Ganadores
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-primary transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-semibold mb-4">Contacto</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-gray-400">
                <Phone className="h-4 w-4" />
                <span>0414-9587323</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-400">
                <Mail className="h-4 w-4" />
                <span>ganaconautos33@gmail.com</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>Valencia, Venezuela</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-gray-400">
            <p>
            RIF J-50761249-0 Copyright © {new Date().getFullYear()} Gana con Autos 33.
            </p>
          <p>Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
