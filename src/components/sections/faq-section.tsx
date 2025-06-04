import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import FadeIn from "@/components/animations/fade-in"

export default function FaqSection() {
  const faqs = [
    {
      question: "Como funciona a reserva de vagas?",
      answer:
        "Você pode reservar uma vaga com até 7 dias de antecedência. Basta selecionar o local, a data e o horário desejados, e confirmar a reserva. Você receberá um código QR que deverá ser apresentado na entrada do estacionamento.",
    },
    {
      question: "Posso cancelar uma reserva?",
      answer:
        "Sim, você pode cancelar uma reserva até 2 horas antes do horário agendado e receber um reembolso completo. Cancelamentos com menos de 2 horas de antecedência estão sujeitos a uma taxa de 50% do valor pago.",
    },
    {
      question: "O GetParked está disponível em quais cidades?",
      answer:
        "Atualmente, o GetParked está disponível em 15 cidades em Portugal, incluindo Lisboa, Porto, Faro, Braga e Coimbra. Estamos constantemente expandindo nossa cobertura para novas localidades.",
    },
    {
      question: "Posso usar o GetParked para estacionamento de longa duração?",
      answer:
        "Sim, o GetParked permite reservas de longa duração, como para viagens ou estadias prolongadas. Muitos dos nossos parceiros oferecem tarifas especiais para estacionamento de vários dias ou semanas.",
    },
    {
      question: "Como posso adicionar mais veículos à minha conta?",
      answer:
        "Para adicionar mais veículos, acesse a secção 'Veículos' no seu perfil e clique em 'Adicionar Veículo'. O número de veículos que você pode adicionar depende do seu plano de assinatura.",
    },
    {
      question: "O que acontece se eu ultrapassar o tempo reservado?",
      answer:
        "Se você ultrapassar o tempo reservado, será cobrada uma taxa adicional conforme as tarifas do estacionamento. Recomendamos que você estenda sua reserva pelo aplicativo se perceber que precisará de mais tempo.",
    },
    {
      question: "Posso compartilhar minha conta com familiares?",
      answer:
        "Cada conta é individual, mas você pode cadastrar veículos que são utilizados por diferentes membros da família. No plano Premium, você pode adicionar múltiplos veículos à sua conta.",
    },
  ]

  return (
    <section id="faq" className="py-20 px-6 bg-gray-50 scroll-mt-16">
      <div className="container mx-auto">
        <FadeIn direction="up">
          <div className="text-center mb-16">
            <Badge className="mb-4">FAQ</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Perguntas Frequentes</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Encontre respostas para as dúvidas mais comuns sobre o GetParked.
            </p>
          </div>
        </FadeIn>

        <div className="max-w-3xl mx-auto">
          <FadeIn direction="up" delay={100}>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-semibold hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
