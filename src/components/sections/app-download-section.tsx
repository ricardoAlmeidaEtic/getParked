import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import FadeIn from "@/components/animations/fade-in"

export default function AppDownloadSection() {
  return (
    <section className="py-20 px-6 bg-primary">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <FadeIn direction="left" duration={800}>
            <Badge className="mb-4 bg-black text-white">Aplicativo Móvel</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-black">
              Leve o GetParked com você para qualquer lugar
            </h2>
            <p className="text-lg mb-8 text-gray-800">
              Baixe nosso aplicativo para ter acesso a todas as funcionalidades do GetParked diretamente no seu
              smartphone. Disponível para iOS e Android.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className="bg-black text-white hover:bg-gray-800 transition-colors duration-300 transform hover:scale-105"
              >
                <Link href="#" className="flex items-center">
                  <svg className="h-6 w-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.6 13.8l.7-1.2-2.8-1.6-2.8 1.6.7 1.2 2.1-1.2 2.1 1.2zM12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm2.8 14.8l-2.8 1.6-2.8-1.6-.7 1.2 3.5 2 3.5-2-.7-1.2z" />
                  </svg>
                  Google Play
                </Link>
              </Button>
              <Button
                className="bg-black text-white hover:bg-gray-800 transition-colors duration-300 transform hover:scale-105"
              >
                <Link href="#" className="flex items-center">
                  <svg className="h-6 w-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.6 13.8l.7-1.2-2.8-1.6-2.8 1.6.7 1.2 2.1-1.2 2.1 1.2zM12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm2.8 14.8l-2.8 1.6-2.8-1.6-.7 1.2 3.5 2 3.5-2-.7-1.2z" />
                  </svg>
                  App Store
                </Link>
              </Button>
            </div>
          </FadeIn>
          <FadeIn direction="right" duration={800} delay={200}>
            <div className="relative">
              <div className="relative z-10 transform transition-transform duration-500 hover:rotate-3">
                <Image
                  src="/mapaimg.png"
                  alt="GetParked Mobile App"
                  width={300}
                  height={600}
                  className="mx-auto"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-black rounded-full z-0 opacity-10 animate-pulse"></div>
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-black rounded-full z-0 opacity-10"></div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
