import Link from "next/link"
import { Button } from "@/components/ui/button"
import FadeIn from "@/components/animations/fade-in"

export default function CtaSection() {
  return (
    <section className="py-20 px-6 bg-black text-white">
      <div className="container mx-auto text-center">
        <FadeIn direction="up">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Pronto para estacionar sem stress?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de condutores que poupam tempo e dinheiro com o GetParked todos os dias.
          </p>
          <Button
            size="lg"
            className="bg-primary text-black hover:bg-primary-hover transition-all duration-300 transform hover:scale-105"
          >
            <Link href="/auth/signup">Criar Conta Gratuita</Link>
          </Button>
          <p className="mt-4 text-gray-400">Não é necessário cartão de crédito</p>
        </FadeIn>
      </div>
    </section>
  )
}
