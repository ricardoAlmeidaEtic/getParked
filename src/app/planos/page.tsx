"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, Star, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { showToast } from "@/components/ui/toast/toast-config"
import { useSupabase } from "@/providers/SupabaseProvider"
import { useProfile } from "@/hooks/useProfile"
import { PaymentModal } from "./components/PaymentModal"
import { motion, AnimatePresence } from "framer-motion"

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

export default function PlanosPage() {
  const [selectedPlan, setSelectedPlan] = useState("free")
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPlanData, setSelectedPlanData] = useState<{
    name: string;
    type: string;
    price: number;
  } | null>(null)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const { supabase } = useSupabase()
  const { profile, refreshProfile } = useProfile()

  useEffect(() => {
    fetchPlans()
  }, [])

  // Add cleanup effect for animation
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    if (showSuccessAnimation) {
      timeoutId = setTimeout(() => {
        setShowSuccessAnimation(false)
      }, 2000) // Increased to 2 seconds
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [showSuccessAnimation])

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

  const handleSubscribe = async (planName: string, planType: string, price: number) => {
    if (planName === "free") {
      showToast.info("Já está no plano Gratuito")
      return
    }

    setSelectedPlanData({
      name: planName,
      type: planType,
      price: price
    })
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = async () => {
    if (!selectedPlanData || !profile) return

    try {
      console.log('Updating plan for profile:', profile.id)
      console.log('New plan data:', selectedPlanData)

      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          plan: selectedPlanData.name,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)
        .select()

      if (error) {
        console.error('Detailed error from Supabase:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        showToast.error('Erro ao atualizar plano. Tente novamente.')
        return
      }

      console.log('Update successful, new data:', data)

      // Close payment modal first
      setShowPaymentModal(false)
      
      // Show success animation
      setShowSuccessAnimation(true)
      
      try {
        // Refresh profile data
        await refreshProfile()
      } catch (refreshError) {
        console.error('Error refreshing profile:', refreshError)
        // Don't show error toast here since the plan update was successful
      }

      showToast.success(`Assinatura do plano ${selectedPlanData.name} (${selectedPlanData.type}) realizada com sucesso!`)
    } catch (error: any) {
      console.error('Unexpected error during plan update:', {
        message: error.message,
        stack: error.stack
      })
      showToast.error('Erro ao atualizar plano. Tente novamente.')
    }
  }

  const faqItems = [
    {
      question: "Posso mudar de plano a qualquer momento?",
      answer:
        "Sim, pode fazer upgrade ou downgrade do seu plano a qualquer momento. As alterações entram em vigor imediatamente e o valor será ajustado proporcionalmente ao período restante da sua subscrição atual.",
    },
    {
      question: "Qual a política de reembolso?",
      answer:
        "Oferecemos reembolso total nos primeiros 30 dias após a subscrição se não estiver satisfeito com o serviço. Após este período, os reembolsos são avaliados caso a caso pela nossa equipa de suporte.",
    },
    {
      question: "Preciso fornecer dados de pagamento para o plano gratuito?",
      answer:
        "Não, o plano gratuito não requer qualquer informação de pagamento e pode ser usado por tempo indeterminado com as funcionalidades básicas do GetParked.",
    },
    {
      question: "Posso usar o mesmo plano em múltiplos dispositivos?",
      answer:
        "Sim, pode aceder à sua conta GetParked em múltiplos dispositivos em simultâneo. Todas as suas informações, como veículos registados e histórico de estacionamentos, estarão sincronizadas em todos os dispositivos.",
    },
    {
      question: "Como funciona a cobrança para planos anuais?",
      answer:
        "Nos planos anuais, o valor total é cobrado de uma só vez no momento da subscrição. Recebe um desconto significativo em comparação com o pagamento mensal, resultando numa poupança de 20% ao longo do ano.",
    },
  ]

  const renderPlanFeatures = (plan: Plan) => {
    const features = [
      {
        text: "Pesquisa de parques de estacionamento próximos",
        included: true
      },
      {
        text: "Navegação básica",
        included: true
      },
      {
        text: `Histórico limitado (últimos ${plan.search_limit} dias)`,
        included: true
      },
      {
        text: `${plan.vehicle_limit} veículo${plan.vehicle_limit > 1 ? 's' : ''} registado${plan.vehicle_limit > 1 ? 's' : ''}`,
        included: true
      },
      {
        text: "Navegação avançada com rotas alternativas",
        included: plan.realtime_navigation
      },
      {
        text: "Reserva de lugares antecipada",
        included: plan.allow_reservations
      },
      {
        text: "Descontos exclusivos em parques parceiros",
        included: plan.priority_support
      }
    ]

    return (
      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <CheckCircle2 className={`h-5 w-5 ${feature.included ? 'text-green-500' : 'text-gray-300'} mr-2 shrink-0 mt-0.5`} />
            <span className={feature.included ? '' : 'text-gray-400'}>{feature.text}</span>
          </li>
        ))}
      </ul>
    )
  }

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Carregando planos...</h2>
          <p className="text-gray-500">Por favor, aguarde um momento.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col">
      <AnimatePresence mode="wait">
        {showSuccessAnimation && (
          <motion.div
            key="success-animation"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: [0.5, 1.2, 1] }}
              transition={{ duration: 0.8 }}
              className="bg-primary/20 backdrop-blur-sm rounded-full p-12"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 1.5, repeat: 1 }}
              >
                <Sparkles className="h-20 w-20 text-primary" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-3">Escolha o Plano Ideal</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Selecione o plano que melhor atende às suas necessidades de estacionamento e comece a economizar tempo e
              dinheiro hoje mesmo.
            </p>
          </div>

          <Tabs defaultValue="monthly" className="w-full max-w-4xl mx-auto">
            <div className="flex justify-center mb-8">
              <TabsList>
                <TabsTrigger value="monthly">Mensal</TabsTrigger>
                <TabsTrigger value="annual">Anual (20% de desconto)</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="monthly" className="space-y-8 md:space-y-0 md:grid md:grid-cols-2 md:gap-6">
              {plans.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`flex flex-col border-2 ${
                    plan.name === "Premium" ? "border-primary relative" : "border-gray-200"
                  } transition-all duration-300 hover:border-gray-300 hover:shadow-md`}
                >
                  {plan.name === "Premium" && (
                    <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-xs font-semibold rounded-bl-lg flex items-center">
                      <Star className="h-3 w-3 mr-1 fill-white" />
                      RECOMENDADO
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>
                      {plan.name === "Free" ? "Para uso pessoal básico" : "Para uso frequente"}
                    </CardDescription>
                    <div className="mt-4 text-3xl font-bold">
                      {plan.price === 0 ? "€0" : `€${plan.price.toFixed(2)}`}
                    </div>
                    <p className="text-sm text-gray-500">
                      {plan.price === 0 ? "para sempre" : "por mês"}
                    </p>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    {renderPlanFeatures(plan)}
                  </CardContent>
                  <CardFooter>
                    {(plan.name !== "Free" && plan.name !== "Gratuito") && (
                      <Button
                        variant={plan.name === "Premium" ? "default" : "outline"}
                        className="w-full group relative overflow-hidden"
                        onClick={() => handleSubscribe(plan.name, "Mensal", plan.price)}
                        disabled={profile?.plan === plan.name}
                      >
                        {profile?.plan === plan.name ? (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Plano Atual
                          </>
                        ) : (
                          <>
                            <span className="flex items-center transition-transform duration-300 group-hover:-translate-x-2">
                              Subscrever Agora
                            </span>
                            <ArrowRight className="absolute right-4 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:right-6" />
                          </>
                        )}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="annual" className="space-y-8 md:space-y-0 md:grid md:grid-cols-2 md:gap-6">
              {plans.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`flex flex-col border-2 ${
                    plan.name === "Premium" ? "border-primary relative" : "border-gray-200"
                  } transition-all duration-300 hover:border-gray-300 hover:shadow-md`}
                >
                  {plan.name === "Premium" && (
                    <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-xs font-semibold rounded-bl-lg flex items-center">
                      <Star className="h-3 w-3 mr-1 fill-white" />
                      RECOMENDADO
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>
                      {plan.name === "Free" ? "Para uso pessoal básico" : "Para uso frequente"}
                    </CardDescription>
                    <div className="mt-4 text-3xl font-bold">
                      {plan.price === 0 ? "€0" : `€${(plan.price * 12 * 0.8).toFixed(2)}`}
                    </div>
                    <p className="text-sm text-gray-500">
                      {plan.price === 0 ? "para sempre" : `por ano (€${(plan.price * 0.8).toFixed(2)}/mês)`}
                    </p>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    {renderPlanFeatures(plan)}
                  </CardContent>
                  <CardFooter>
                    {(plan.name !== "Free" && plan.name !== "Gratuito") && (
                      <Button
                        variant={plan.name === "Premium" ? "default" : "outline"}
                        className="w-full group relative overflow-hidden"
                        onClick={() => handleSubscribe(plan.name, "Anual", plan.price)}
                        disabled={profile?.plan === plan.name}
                      >
                        {profile?.plan === plan.name ? (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Plano Atual
                          </>
                        ) : (
                          <>
                            <span className="flex items-center transition-transform duration-300 group-hover:-translate-x-2">
                              Subscrever Agora
                            </span>
                            <ArrowRight className="absolute right-4 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:right-6" />
                          </>
                        )}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
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
      </div>

      {selectedPlanData && showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          planName={selectedPlanData.name}
          planType={selectedPlanData.type}
          price={selectedPlanData.price}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </main>
  )
}
