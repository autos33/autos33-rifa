  "use client"
  import Image from "next/image"
  import { Button } from "@/components/ui/button"
  import { ChevronDown } from "lucide-react"
  import Link from "next/link"

  export function HeroSection() {
    const scrollToRifas = () => {
      const rifasSection = document.getElementById("rifas")
      if (rifasSection) {
        rifasSection.scrollIntoView({ behavior: "smooth" })
      }
    }

    const scrollToGanadores = () => {
      const ganadoresSection = document.getElementById("ganadores")
      if (ganadoresSection) {
        ganadoresSection.scrollIntoView({ behavior: "smooth" })
      }
    }

    return (
      <section className="relative min-h-screen flex items-center justify-center wave-divider mb-16">
        {/* Background image with parallax effect */}
        <div
          className="absolute inset-0 parallax-bg"
          style={{
            backgroundImage: "url('/FondoConcencionario.jpg')",
          }}
        >
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex flex-col md:flex-row gap-20 items-center">
          
          {/*imagen, probar desde aqui*/}
          <div className="flex-1 flex items-center justify-center md:mt-0 mt-20">
            <Image
              src="https://jasljnkyrqwbhjerqrus.supabase.co/storage/v1/object/public/imagenes_variadas/LogoganaConAutos33alternativo.png"
              width={400}
              height={150}
              alt="Gana con Autos 33"
              className="max-w-full h-auto mx-auto"
            />
          </div>  
          {/*hasta aqui*/}
          
          <div className="flex-1 flex flex-col items-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 text-balance">
              Gana con Autos 33
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto text-pretty">
              Tu oportunidad de ganar el auto de tus sueños está aquí. Participa en nuestras rifas con los mejores premios.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg"
                onClick={scrollToRifas}
              >
                Ver Rifas
              </Button>
              <Link href="#ganadores">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg font-semibold transition-all duration-200 bg-transparent"
                  onClick={scrollToGanadores}
                >
                  Ganadores
                </Button>
              </Link>
            </div>
            <div className="absolute bottom-24 sm:bottom-9 left-1/2 transform -translate-x-1/2 -translate-y-8 animate-bounce">
              <ChevronDown className="h-8 w-8 text-white/70" />
            </div>
          </div>
        </div>

        {/* Wave divider at the bottom of the section */}
        <div className="absolute bottom-0 left-0 right-0 z-20 -mb-px">
          <svg
            id="wave"
            viewBox="0 0 1440 140"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            className=""
          >
            <defs>
              <linearGradient id="sw-gradient-0" x1="0" x2="0" y1="1" y2="0">
                <stop stopColor="rgba(255, 255, 255, 60)" offset="0%"></stop>
                <stop stopColor="rgba(255, 255, 255, 60)" offset="100%"></stop>
              </linearGradient>
            </defs>
            <path
              fill="url(#sw-gradient-0)"
              d="M0,56L48,53.7C96,51,192,47,288,51.3C384,56,480,70,576,81.7C672,93,768,103,864,100.3C960,98,1056,84,1152,67.7C1248,51,1344,33,1440,37.3C1536,42,1632,70,1728,81.7C1824,93,1920,89,2016,93.3C2112,98,2208,112,2304,100.3C2400,89,2496,51,2592,42C2688,33,2784,51,2880,67.7C2976,84,3072,98,3168,102.7C3264,107,3360,103,3456,84C3552,65,3648,33,3744,35C3840,37,3936,75,4032,88.7C4128,103,4224,93,4320,95.7C4416,98,4512,112,4608,100.3C4704,89,4800,51,4896,44.3C4992,37,5088,61,5184,58.3C5280,56,5376,28,5472,23.3C5568,19,5664,37,5760,37.3C5856,37,5952,19,6048,9.3C6144,0,6240,0,6336,16.3C6432,33,6528,65,6624,74.7C6720,84,6816,70,6864,63L6912,56L6912,140L6864,140C6816,140,6720,140,6624,140C6528,140,6432,140,6336,140C6240,140,6144,140,6048,140C5952,140,5856,140,5760,140C5664,140,5568,140,5472,140C5376,140,5280,140,5184,140C5088,140,4992,140,4896,140C4800,140,4704,140,4608,140C4512,140,4416,140,4320,140C4224,140,4128,140,4032,140C3936,140,3840,140,3744,140C3648,140,3552,140,3456,140C3360,140,3264,140,3168,140C3072,140,2976,140,2880,140C2784,140,2688,140,2592,140C2496,140,2400,140,2304,140C2208,140,2112,140,2016,140C1920,140,1824,140,1728,140C1632,140,1536,140,1440,140C1344,140,1248,140,1152,140C1056,140,960,140,864,140C768,140,672,140,576,140C480,140,384,140,288,140C192,140,96,140,48,140L0,140Z"
            ></path>
          </svg>
        </div>
      </section>
    )
  }