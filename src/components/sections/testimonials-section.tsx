import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import FadeIn from "@/components/animations/fade-in"

export default function TestimonialsSection() {
  const testimonials = [
    {
      rating: 5,
      text: "Poupo pelo menos 20 minutos todos os dias à procura de estacionamento. O GetParked é uma mudança radical para quem trabalha no centro da cidade.",
      name: "Ana Silva",
      since: "Utilizadora desde 2022",
      delay: 100,
    },
    {
      rating: 5,
      text: "A função de reserva antecipada é perfeita! Chego ao meu destino sabendo exatamente onde vou estacionar, sem stress e sem perder tempo.",
      name: "Carlos Mendes",
      since: "Utilizador desde 2023",
      delay: 200,
    },
    {
      rating: 4,
      text: "O pagamento pela app é super prático. Já não preciso de me preocupar com moedas ou correr para renovar o ticket. Recomendo a todos!",
      name: "Mariana Costa",
      since: "Utilizadora desde 2023",
      delay: 300,
    },
  ]

  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="container mx-auto">
        <FadeIn direction="up">
          <div className="text-center mb-16">
            <Badge className="mb-4">Testemunhos</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">O que dizem os nossos utilizadores</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Milhares de condutores já poupam tempo e dinheiro com o GetParked.
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <FadeIn key={index} direction="up" delay={testimonial.delay}>
              <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < testimonial.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6">{testimonial.text}</p>
                  <div className="flex items-center">
                    <Image
                      src="/user-icon.svg"
                      alt="User"
                      width={48}
                      height={48}
                      className="rounded-full mr-4"
                    />
                    <div>
                      <h4 className="font-medium">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500">{testimonial.since}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
