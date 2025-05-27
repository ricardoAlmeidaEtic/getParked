import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import FadeIn from "@/components/animations/fade-in"

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-primary to-primary-light py-20 px-6">
      <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
        <FadeIn direction="left" duration={800}>
          <Badge className="mb-4 bg-black text-white">Novo</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-black">
            Encontre e reserve vagas de estacionamento em segundos
          </h1>
          <p className="text-lg mb-8 text-gray-800">
            GetParked revoluciona a forma como você encontra estacionamento. Economize tempo, dinheiro e evite o
            estresse de procurar vagas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="bg-black text-white hover:bg-gray-800 transition-colors duration-300">
              <Link href="/auth/signup">Começar Agora</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-white hover:bg-gray-100 transition-colors duration-300"
            >
              <Link href="#how-it-works">Como Funciona</Link>
            </Button>
          </div>
          <div className="mt-8 flex items-center">
            <div className="flex -space-x-2">
              <Image
                src="/placeholder.svg?height=40&width=40"
                alt="User"
                width={40}
                height={40}
                className="rounded-full border-2 border-white"
              />
              <Image
                src="/placeholder.svg?height=40&width=40"
                alt="User"
                width={40}
                height={40}
                className="rounded-full border-2 border-white"
              />
              <Image
                src="/placeholder.svg?height=40&width=40"
                alt="User"
                width={40}
                height={40}
                className="rounded-full border-2 border-white"
              />
            </div>
            <div className="ml-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-sm text-gray-800">
                <span className="font-bold">4.9/5</span> de mais de 2.000 avaliações
              </p>
            </div>
          </div>
        </FadeIn>
        <FadeIn direction="right" duration={800} delay={200}>
          <div className="relative">
            <div className="relative z-10 rounded-lg overflow-hidden shadow-2xl transform transition-transform duration-500 hover:scale-105">
              <Image
                src="/placeholder.svg?height=600&width=800"
                alt="GetParked App"
                width={800}
                height={600}
                className="w-full h-auto"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-primary rounded-full z-0 animate-pulse"></div>
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-black rounded-full z-0"></div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
