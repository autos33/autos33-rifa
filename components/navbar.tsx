"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"  
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex justify-center lg:justify-start">
            <Link href="/" aria-label="go home" className="block">
              <Image
                src="/LogoganaConAutos33.png"
                width={60}
                height={60}
                className="object-cover"
                alt="Gana con Autos 33"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-foreground hover:text-primary transition-colors">
              Inicio
            </Link>
            <Link href="/#rifas" className="text-foreground hover:text-primary transition-colors">
              Rifas
            </Link>
            <Link href="/#ganadores" className="text-foreground hover:text-primary transition-colors">
              Ganadores
            </Link>
            <div className="bg-primary hover:bg-primary/90 p-2 rounded-md font-medium text-base">
              <Link href="https://api.whatsapp.com/send?phone=584149587323" className="text-white transition-colors">
                Contáctanos
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden ">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="text-foreground">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden transition-all duration-500">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-border">
              <Link
                href="/"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Inicio
              </Link>
              <Link
                href="/#rifas"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Rifas
              </Link>
              <Link
                href="/#ganadores"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Ganadores
              </Link>
              <div className="px-3 py-2">
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => window.open("https://api.whatsapp.com/send?phone=584149587323")}
                >
                  Contáctanos
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
