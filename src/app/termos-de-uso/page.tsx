import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso | GetParked",
  description: "Termos de Uso do GetParked - Conheça as regras e condições para uso de nossa plataforma.",
};

export default function TermsOfUsePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Termos de Uso</h1>
      
      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Aceitação dos Termos</h2>
          <p>
            Ao acessar e usar o GetParked, você concorda em cumprir estes termos de uso. Se você não concordar
            com qualquer parte destes termos, não poderá acessar o serviço.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Descrição do Serviço</h2>
          <p>
            O GetParked é uma plataforma que conecta usuários a estacionamentos disponíveis, permitindo
            reservas e pagamentos online.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Conta do Usuário</h2>
          <p>Para usar nossos serviços, você deve:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Ter pelo menos 18 anos de idade</li>
            <li>Fornecer informações precisas e completas</li>
            <li>Manter suas credenciais de login seguras</li>
            <li>Ser responsável por todas as atividades em sua conta</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Reservas e Pagamentos</h2>
          <div className="space-y-4">
            <p>
              Ao fazer uma reserva, você concorda em:
            </p>
            <ul className="list-disc pl-6">
              <li>Fornecer informações de pagamento válidas</li>
              <li>Pagar o valor total da reserva</li>
              <li>Respeitar as políticas de cancelamento</li>
              <li>Usar o estacionamento conforme as regras estabelecidas</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Conduta do Usuário</h2>
          <p>Você concorda em não:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Usar o serviço de forma ilegal</li>
            <li>Violar direitos de propriedade intelectual</li>
            <li>Interferir no funcionamento do serviço</li>
            <li>Realizar atividades fraudulentas</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Limitação de Responsabilidade</h2>
          <p>
            O GetParked não se responsabiliza por danos indiretos, incidentais ou consequentes decorrentes
            do uso ou impossibilidade de uso do serviço.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Modificações</h2>
          <p>
            Reservamos o direito de modificar estes termos a qualquer momento. As alterações entram em vigor
            imediatamente após sua publicação.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Lei Aplicável</h2>
          <p>
            Estes termos são regidos pelas leis de Portugal e qualquer disputa será submetida à jurisdição
            exclusiva dos tribunais portugueses.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Contacto</h2>
          <p>
            Para questões sobre estes termos, contacte-nos através do email:
            <a href="mailto:legal@getparked.com" className="text-primary hover:underline ml-1">
              legal@getparked.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}