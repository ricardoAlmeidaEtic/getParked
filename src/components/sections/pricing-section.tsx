import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import FadeIn from "@/components/animations/fade-in"

export default function PricingSection() {
  const plans = [
    {
      title: "Gratuito",
      price: "€0",
      period: "/mês",
      description: "Ideal para uso ocasional",
      features: ["Até 3 buscas de vagas por dia", "1 veículo cadastrado", "Acesso a vagas públicas e privadas"],
      buttonText: "Começar Grátis",
      buttonVariant: "outline",
      popular: false,
      delay: 100,
    },
    {
      title: "Premium",
      price: "€12,99",
      period: "/mês",
      description: "Perfeito para uso regular",
      features: [
        "Até 50 buscas de vagas por dia",
        "Até 3 veículos cadastrados",
        "Reserva de vagas",
        "Navegação em tempo real",
      ],
      buttonText: "Assinar Agora",
      buttonVariant: "default",
      popular: true,
      delay: 200,
    },
    {
      title: "Business",
      price: "€35",
      period: "/mês",
      description: "Para empresas e uso intensivo",
      features: [
        "Buscas de vagas ilimitadas",
        "Até 10 veículos cadastrados",
        "Prioridade em vagas premium",
        "Relatórios e estatísticas",
      ],
      buttonText: "Assinar Agora",
      buttonVariant: "outline",
      popular: false,
      delay: 300,
    },
  ]

  return (
    <section id="pricing" className="py-20 px-6 bg-white scroll-mt-16">
      <div className="container mx-auto">
        <FadeIn direction="up">
          <div className="text-center mb-16">
            <Badge className="mb-4">Planos</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Escolha o plano ideal para você</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Oferecemos opções flexíveis para atender às suas necessidades de estacionamento.
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <FadeIn key={index} direction="up" delay={plan.delay}>
              <Card
                className={`border-2 ${
                  plan.popular
                    ? "border-primary relative md:scale-105 shadow-lg transform transition-all duration-300 hover:shadow-xl hover:scale-[1.07]"
                    : "border-gray-200 hover:border-primary transition-all duration-300 hover:shadow-lg"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold uppercase rounded-bl-lg">
                    Popular
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl">{plan.title}</CardTitle>
                  <div className="mt-2 mb-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start">
                        <svg
                          className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button
                    asChild
                    variant={plan.buttonVariant as "outline" | "default"}
                    className={`w-full ${
                      plan.buttonVariant === "default"
                        ? "bg-primary text-primary-foreground hover:bg-primary-hover transition-colors duration-300"
                        : "transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
                    }`}
                  >
                    <Link href="/auth/signup">{plan.buttonText}</Link>
                  </Button>
                </div>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
