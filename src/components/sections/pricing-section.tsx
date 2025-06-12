"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckCircle2, Star } from "lucide-react"
import FadeIn from "@/components/animations/fade-in"
import { useSupabase } from "@/providers/SupabaseProvider"
import { showToast } from "@/components/ui/toast/toast-config"

interface Plan {
  id: string
  name: string
  price: number
  search_limit: number
  vehicle_limit: number
  allow_reservations: boolean
  realtime_navigation: boolean
  priority_support: boolean
}

export default function PricingSection() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const { supabase } = useSupabase()

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('price', { ascending: true })

      if (error) throw error

      setPlans(data || [])
    } catch (error: any) {
      console.error('Erro ao carregar planos:', error)
      showToast.error('Erro ao carregar planos')
    } finally {
      setLoading(false)
    }
  }

  const renderPlanFeatures = (plan: Plan) => {
    const features = [
      {
        text: "Pesquisa de estacionamentos próximos",
        included: true,
      },
      {
        text: "Navegação básica",
        included: true,
      },
      {
        text: `Histórico limitado (últimos ${plan.search_limit} dias)`,
        included: true,
      },
      {
        text: `${plan.vehicle_limit} veículo${plan.vehicle_limit > 1 ? "s" : ""} registado${plan.vehicle_limit > 1 ? "s" : ""}`,
        included: true,
      },
      {
        text: "Navegação avançada com rotas alternativas",
        included: plan.realtime_navigation,
      },
      {
        text: "Reserva de lugares antecipada",
        included: plan.allow_reservations,
      },
      {
        text: "Descontos exclusivos em parques parceiros",
        included: plan.priority_support,
      },
    ]

    return features
  }

  const faqItems = [
    {
      question: "Posso mudar de plano a qualquer momento?",
      answer:
        "Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As mudanças entram em vigor imediatamente e o valor será ajustado proporcionalmente ao período restante da sua assinatura atual.",
    },
    {
      question: "Qual a política de reembolso?",
      answer:
        "Oferecemos reembolso total nos primeiros 30 dias após a assinatura se você não estiver satisfeito com o serviço. Após este período, reembolsos são avaliados caso a caso pela nossa equipe de suporte.",
    },
    {
      question: "Preciso fornecer dados de pagamento para o plano gratuito?",
      answer:
        "Não, o plano gratuito não requer nenhuma informação de pagamento e pode ser usado por tempo indeterminado com as funcionalidades básicas do GetParked.",
    },
  ]

  if (loading) {
    return (
      <section id="pricing" className="py-20 px-6 bg-white scroll-mt-16">
        <div className="container mx-auto text-center">
          <p>Carregando planos...</p>
        </div>
      </section>
    )
  }

  const renderPlanCard = (plan: Plan, isAnnual: boolean = false) => {
    const isPopular = plan.name === "Premium"
    const features = renderPlanFeatures(plan)
    const price = isAnnual ? plan.price * 12 * 0.8 : plan.price

    return (
      <Card
        className={`flex flex-col border-2 ${
          isPopular
            ? "border-primary relative shadow-lg transform transition-all duration-300 hover:shadow-xl hover:scale-[1.07]"
            : "border-gray-200 hover:border-primary transition-all duration-300 hover:shadow-lg"
        }`}
      >
        {isPopular && (
          <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-xs font-semibold rounded-bl-lg flex items-center">
            <Star className="h-3 w-3 mr-1 fill-white" />
            RECOMENDADO
          </div>
        )}
        <CardHeader>
          <CardTitle>{plan.name}</CardTitle>
          <CardDescription>{plan.name === "Free" ? "Para uso pessoal básico" : "Para uso frequente"}</CardDescription>
          <div className="mt-4 text-3xl font-bold">€{price.toFixed(2)}</div>
          <p className="text-sm text-gray-500">
            {plan.price === 0
              ? "para sempre"
              : isAnnual
                ? `por ano (€${(plan.price * 0.8).toFixed(2)}/mês)`
                : "por mês"}
          </p>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="space-y-2">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-start">
                <CheckCircle2
                  className={`h-5 w-5 ${feature.included ? "text-green-500" : "text-gray-300"} mr-2 shrink-0 mt-0.5`}
                />
                <span className={feature.included ? "" : "text-gray-400"}>{feature.text}</span>
              </div>
            ))}
          </div>
        </CardContent>
        <div className="p-6 pt-0">
          {(plan.name !== "Free" && plan.name !== "Gratuito") && (
            <Button
              variant={isPopular ? "default" : "outline"}
              className={`w-full group relative overflow-hidden ${
                isPopular
                  ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                  : "bg-primary text-primary-foreground hover:bg-primary-hover"
              }`}
            >
              <Link href="/auth/signup" className="flex items-center justify-center w-full">
                Assinar Agora
              </Link>
            </Button>
          )}
        </div>
      </Card>
    )
  }

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

        <Tabs defaultValue="monthly" className="w-full max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <TabsList>
              <TabsTrigger value="monthly">Mensal</TabsTrigger>
              <TabsTrigger value="annual">Anual (20% de desconto)</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="monthly"
            className="space-y-8 md:space-y-0 md:grid md:grid-cols-2 md:gap-8 md:justify-items-center"
          >
            {plans.map((plan) => (
              <FadeIn key={plan.id} direction="up">
                {renderPlanCard(plan)}
              </FadeIn>
            ))}
          </TabsContent>

          <TabsContent
            value="annual"
            className="space-y-8 md:space-y-0 md:grid md:grid-cols-2 md:gap-8 md:justify-items-center"
          >
            {plans.map((plan) => (
              <FadeIn key={plan.id} direction="up">
                {renderPlanCard(plan, true)}
              </FadeIn>
            ))}
          </TabsContent>
        </Tabs>

        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Dúvidas frequentes</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-medium hover:text-primary">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
