// ... existing code ...
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Car } from "lucide-react"
import FadeIn from "@/components/animations/fade-in"

export default function HowItWorksSection() {
  const steps = [
    {
      icon: <Search className="h-10 w-10 text-primary" />,
      number: 1,
      title: "Busque",
      description: "Digite seu destino ou use sua localização atual para encontrar vagas disponíveis próximas.",
      delay: 100,
    },
    {
      icon: <MapPin className="h-10 w-10 text-primary" />,
      number: 2,
      title: "Escolha",
      description: "Compare preços, distância e avaliações para selecionar a melhor opção para você.",
      delay: 200,
    },
    {
      icon: <Car className="h-10 w-10 text-primary" />,
      number: 3,
      title: "Estacione",
      description: "Reserve, navegue até o local e estacione sem complicações. Pague diretamente pelo app.",
      delay: 300,
    },
  ]

  return (
    <section 
      id="how-it-works" 
      className="py-20 px-6 scroll-mt-16"
      style={{ backgroundColor: '#F8D648' }} // Aplicando a cor personalizada
    >
      <div className="container mx-auto">
        <FadeIn direction="up">
          <div className="text-center mb-16">
              <Badge className="mb-4 bg-gray-50">Como Funciona</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Estacionar nunca foi tão fácil</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Em apenas 3 passos simples, você encontra e garante sua vaga de estacionamento.
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <FadeIn key={step.number} direction="up" delay={step.delay}>
              <div className="text-center">
                <div className="relative mx-auto w-24 h-24 bg-primary-light rounded-full flex items-center justify-center mb-6 transition-transform duration-300 hover:scale-110">
                  {step.icon}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold">
                    {step.number}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn direction="up" delay={400}>
          <div className="mt-16 text-center">
            <div className="relative mx-auto max-w-4xl rounded-xl overflow-hidden shadow-2xl">
              <video
                src="/mapa-video.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto rounded-xl shadow-2xl"
                poster="/mapaimg.png"
              />
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
// ... end of file ... 



