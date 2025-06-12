import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Clock, CreditCard, Navigation, Shield } from "lucide-react"
import FadeIn from "@/components/animations/fade-in"

export default function FeaturesSection() {
  const mainFeatures = [
    {
      icon: <Search className="h-6 w-6 text-primary" />,
      title: "Pesquisa Inteligente",
      description: "Encontre lugares próximos de si ou em qualquer localização com a nossa pesquisa inteligente.",
      features: [
        "Filtros avançados por preço e tipo",
        "Visualização em mapa interativo",
        "Sugestões baseadas no histórico",
      ],
      delay: 100,
    },
    {
      icon: <Clock className="h-6 w-6 text-primary" />,
      title: "Reservas em Tempo Real",
      description: "Reserve o seu lugar com antecedência e garanta o seu espaço ao chegar ao destino.",
      features: ["Confirmação instantânea", "Cancelamento flexível", "Lembretes automáticos"],
      delay: 200,
    },
    {
      icon: <CreditCard className="h-6 w-6 text-primary" />,
      title: "Pagamento Simplificado",
      description: "Pague diretamente pela aplicação sem precisar de dinheiro ou bilhetes físicos.",
      features: [
        "Múltiplas formas de pagamento",
        "Recibos digitais automáticos",
        "Transações seguras e encriptadas",
      ],
      delay: 300,
    },
  ]

  const additionalFeatures = [
    {
      icon: <Navigation className="h-6 w-6 text-primary" />,
      title: "Navegação Integrada",
      description: "Navegue diretamente para o lugar escolhido com instruções passo a passo.",
      features: ["Rotas otimizadas em tempo real", "Informações sobre trânsito", "Localização precisa da entrada"],
      delay: 400,
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Segurança Garantida",
      description: "Informações detalhadas sobre segurança e monitorização de cada parque de estacionamento.",
      features: [
        "Avaliações de outros utilizadores",
        "Detalhes sobre câmaras e vigilância",
        "Verificação de parques parceiros",
      ],
      delay: 500,
    },
  ]

  const FeatureCard = ({ feature, delay }: { feature: any; delay: number }) => (
    <FadeIn direction="up" delay={delay}>
      <Card className="border-2 border-transparent hover:border-primary transition-all duration-300 hover:shadow-lg">
        <CardHeader>
          <div className="bg-primary-light p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
            {feature.icon}
          </div>
          <CardTitle>{feature.title}</CardTitle>
          <CardDescription>{feature.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {feature.features.map((item: string, idx: number) => (
              <li key={idx} className="flex items-center">
                <span className="bg-green-100 p-1 rounded-full mr-2">
                  <svg
                    className="h-3 w-3 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </FadeIn>
  )

  return (
    <section id="features" className="py-20 px-6 bg-gray-50 scroll-mt-16">
      <div className="container mx-auto">
        <FadeIn direction="up">
          <div className="text-center mb-16">
            <Badge className="mb-4">Funcionalidades</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tudo o que precisa para estacionar sem stress
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              GetParked oferece uma solução completa para encontrar, reservar e pagar por estacionamento, tudo em um só
              lugar.
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-8">
          {mainFeatures.map((feature, index) => (
            <FeatureCard key={index} feature={feature} delay={feature.delay} />
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-12">
          {additionalFeatures.map((feature, index) => (
            <FeatureCard key={index} feature={feature} delay={feature.delay} />
          ))}
        </div>
      </div>
    </section>
  )
}
