"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { showToast } from "@/components/ui/toast/toast-config"
import PricingTabs from "@/components/pricing/pricing-tabs"
import CancelConfirmation from "@/components/pricing/cancel-confirmation"
import { useSupabase } from "@/providers/SupabaseProvider"

interface UserData {
  name: string
  email: string
  plan: string
  joinDate: string
  credits?: number
  vehicles: any[]
  profileImage?: string
}

export default function PlanosPage() {
  const router = useRouter()
  const { user, loading, supabase } = useSupabase()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false)
  const [planToCancel, setPlanToCancel] = useState("")

  useEffect(() => {
    if (!loading && user) {
      // Criar dados do usuário baseado na autenticação do Supabase
      const userInfo: UserData = {
        name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
        email: user.email || '',
        plan: user.user_metadata?.plan || 'Gratuito',
        joinDate: new Date(user.created_at).toLocaleDateString('pt-BR', { 
          month: 'long', 
          year: 'numeric' 
        }),
        credits: user.user_metadata?.credits || 0,
        vehicles: user.user_metadata?.vehicles || [],
        profileImage: user.user_metadata?.avatar_url
      }
      setUserData(userInfo)
    }
  }, [user, loading])

  const handleSubscribe = async (planName: string, planType: string) => {
    if (!user) {
      showToast.error("Você precisa fazer login para assinar um plano")
      router.push("/auth/signin")
      return
    }

    // Verificar se está tentando fazer downgrade
    const plansHierarchy: Record<string, number> = {
      "Gratuito": 0,
      "Premium": 1,
      "Business": 2
    }

    const currentPlanLevel = plansHierarchy[userData?.plan || "Gratuito"]
    const targetPlanLevel = plansHierarchy[planName]

    if (targetPlanLevel < currentPlanLevel) {
      showToast.info(`Para mudar para o plano ${planName}, você precisa primeiro cancelar seu plano ${userData?.plan} atual`)
      return
    }

    if (userData?.plan === planName) {
      showToast.info(`Você já está no plano ${planName}`)
      return
    }

    setIsLoading(true)
    try {
      // Atualizar os metadados do usuário no Supabase
      const { data, error } = await supabase.auth.updateUser({
        data: {
          plan: planName,
          credits: (userData?.credits ?? 0) + (planName === "Premium" ? 50 : 100), // Bonus credits
        }
      })

      if (error) throw error

      if (userData) {
        const updatedUser = {
          ...userData,
          plan: planName,
          credits: (userData?.credits ?? 0) + (planName === "Premium" ? 50 : 100),
        }
        setUserData(updatedUser)
        showToast.success(`🎉 Assinatura do plano ${planName} (${planType}) realizada com sucesso!`)
      }
    } catch (error: any) {
      console.error("Erro ao atualizar plano:", error)
      showToast.error("Erro ao atualizar plano. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelPlan = (planName: string) => {
    setPlanToCancel(planName)
    setShowCancelConfirmation(true)
  }

  const confirmCancelPlan = async () => {
    setIsLoading(true)
    try {
      // Remove extra vehicles if downgrading
      const maxVehicles = 1 // Free plan limit
      const updatedVehicles = userData?.vehicles.slice(0, maxVehicles) || []

      // Atualizar os metadados do usuário no Supabase
      const { data, error } = await supabase.auth.updateUser({
        data: {
          plan: "Gratuito",
          vehicles: updatedVehicles,
        }
      })

      if (error) throw error

      if (userData) {
        const updatedUser = {
          ...userData,
          plan: "Gratuito",
          vehicles: updatedVehicles,
        }
        setUserData(updatedUser)
        showToast.success(`Plano ${planToCancel} cancelado com sucesso. Você foi transferido para o plano gratuito.`)

        if (userData.vehicles.length > maxVehicles) {
          showToast.info(
            `${userData.vehicles.length - maxVehicles} veículo(s) foram removidos devido ao limite do plano gratuito.`,
          )
        }
      }
    } catch (error: any) {
      console.error("Erro ao cancelar plano:", error)
      showToast.error("Erro ao cancelar plano. Tente novamente.")
    } finally {
      setShowCancelConfirmation(false)
      setPlanToCancel("")
      setIsLoading(false)
    }
  }

  const faqItems = [
    {
      question: "Posso mudar de plano a qualquer momento?",
      answer:
        "Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As mudanças entram em vigor imediatamente e o valor será ajustado proporcionalmente ao período restante da sua assinatura atual.",
    },
    {
      question: "Como funciona o período de teste?",
      answer:
        "Oferecemos 7 dias de teste gratuito para os planos Premium e Business. Você não será cobrado durante este período e pode cancelar a qualquer momento antes do término do teste sem nenhum custo.",
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
    {
      question: "Posso usar o mesmo plano em múltiplos dispositivos?",
      answer:
        "Sim, você pode acessar sua conta GetParked em múltiplos dispositivos simultaneamente. Todas as suas informações, como veículos cadastrados e histórico de estacionamentos, estarão sincronizadas em todos os dispositivos.",
    },
    {
      question: "Como funciona a cobrança para planos anuais?",
      answer:
        "Nos planos anuais, o valor total é cobrado de uma só vez no momento da assinatura. Você recebe um desconto significativo em comparação ao pagamento mensal, resultando em uma economia de 20% ao longo do ano.",
    },
    {
      question: "O que acontece se eu exceder o limite de veículos do meu plano?",
      answer:
        "Se você precisar adicionar mais veículos além do limite do seu plano atual, será necessário fazer upgrade para um plano superior ou, no caso do plano Business, pagar uma taxa adicional por veículo extra cadastrado.",
    },
  ]

  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1 pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-3">Escolha o Plano Ideal</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Selecione o plano que melhor atende às suas necessidades de estacionamento e comece a economizar tempo e
              dinheiro hoje mesmo.
            </p>
            {!user && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto">
                <p className="text-blue-800 text-sm">
                  <strong>Faça login</strong> para assinar um plano e desbloquear todos os recursos premium!
                </p>
              </div>
            )}
          </div>

          <PricingTabs
            currentUserPlan={userData?.plan}
            onSubscribe={handleSubscribe}
            onCancel={handleCancelPlan}
            isLoading={isLoading}
          />

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

      {showCancelConfirmation && (
        <CancelConfirmation
          planName={planToCancel}
          onConfirm={confirmCancelPlan}
          onCancel={() => {
            setShowCancelConfirmation(false)
            setPlanToCancel("")
          }}
          isLoading={isLoading}
        />
      )}
    </main>
  )
}
