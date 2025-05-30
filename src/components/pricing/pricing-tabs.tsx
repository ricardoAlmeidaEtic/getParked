"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PlanCard from "./plan-card"

interface PricingTabsProps {
  currentUserPlan?: string
  onSubscribe: (planName: string, planType: string) => void
  onCancel: (planName: string) => void
  isLoading?: boolean
}

export default function PricingTabs({ currentUserPlan, onSubscribe, onCancel, isLoading }: PricingTabsProps) {
  const plans = {
    monthly: [
      {
        title: "Gratuito",
        description: "Para uso pessoal básico",
        price: "€0",
        period: "para sempre",
        features: [
          "Busca de estacionamentos próximos",
          "Navegação básica",
          "Histórico limitado (últimos 7 dias)",
          "1 veículo cadastrado",
        ],
        isFreePlan: true,
      },
      {
        title: "Premium",
        description: "Para uso frequente",
        price: "€9,99",
        period: "por mês",
        features: [
          "Tudo do plano Gratuito",
          "Navegação avançada com rotas alternativas",
          "Histórico completo",
          "Até 3 veículos cadastrados",
          "Reserva de vagas antecipada",
          "Descontos exclusivos em estacionamentos parceiros",
        ],
        isRecommended: true,
      },
      {
        title: "Business",
        description: "Para empresas e frotas",
        price: "€24,99",
        period: "por mês",
        features: [
          "Tudo do plano Premium",
          "Veículos ilimitados",
          "Gestão de frota",
          "Relatórios detalhados",
          "API para integração com sistemas próprios",
          "Suporte prioritário 24/7",
        ],
      },
    ],
    annual: [
      {
        title: "Gratuito",
        description: "Para uso pessoal básico",
        price: "€0",
        period: "para sempre",
        features: [
          "Busca de estacionamentos próximos",
          "Navegação básica",
          "Histórico limitado (últimos 7 dias)",
          "1 veículo cadastrado",
        ],
        isFreePlan: true,
      },
      {
        title: "Premium",
        description: "Para uso frequente",
        price: "€95,90",
        period: "por ano (€7,99/mês)",
        features: [
          "Tudo do plano Gratuito",
          "Navegação avançada com rotas alternativas",
          "Histórico completo",
          "Até 3 veículos cadastrados",
          "Reserva de vagas antecipada",
          "Descontos exclusivos em estacionamentos parceiros",
        ],
        isRecommended: true,
      },
      {
        title: "Business",
        description: "Para empresas e frotas",
        price: "€239,90",
        period: "por ano (€19,99/mês)",
        features: [
          "Tudo do plano Premium",
          "Veículos ilimitados",
          "Gestão de frota",
          "Relatórios detalhados",
          "API para integração com sistemas próprios",
          "Suporte prioritário 24/7",
        ],
      },
    ],
  }

  return (
    <Tabs defaultValue="monthly" className="w-full max-w-4xl mx-auto">
      <div className="flex justify-center mb-8">
        <TabsList className="bg-gray-100 p-1 border-2 border-gray-200 shadow-sm">
          <TabsTrigger 
            value="monthly" 
            className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md px-8 py-2 transition-all duration-300"
          >
            Mensal
          </TabsTrigger>
          <TabsTrigger 
            value="annual" 
            className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md px-8 py-2 transition-all duration-300"
          >
            <span className="flex flex-col items-center">
              <span>Anual</span>
              <span className="text-xs font-medium text-green-600">20% de desconto</span>
            </span>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="monthly" className="space-y-8 md:space-y-0 md:grid md:grid-cols-3 md:gap-6">
        {plans.monthly.map((plan, index) => (
          <PlanCard
            key={`monthly-${index}`}
            title={plan.title}
            description={plan.description}
            price={plan.price}
            period={plan.period}
            features={plan.features}
            isRecommended={plan.isRecommended}
            isCurrentPlan={currentUserPlan === plan.title}
            isFreePlan={plan.isFreePlan}
            onSubscribe={() => onSubscribe(plan.title, "Mensal")}
            onCancel={() => onCancel(plan.title)}
            isLoading={isLoading}
          />
        ))}
      </TabsContent>

      <TabsContent value="annual" className="space-y-8 md:space-y-0 md:grid md:grid-cols-3 md:gap-6">
        {plans.annual.map((plan, index) => (
          <PlanCard
            key={`annual-${index}`}
            title={plan.title}
            description={plan.description}
            price={plan.price}
            period={plan.period}
            features={plan.features}
            isRecommended={plan.isRecommended}
            isCurrentPlan={currentUserPlan === plan.title}
            isFreePlan={plan.isFreePlan}
            onSubscribe={() => onSubscribe(plan.title, "Anual")}
            onCancel={() => onCancel(plan.title)}
            isLoading={isLoading}
          />
        ))}
      </TabsContent>
    </Tabs>
  )
} 