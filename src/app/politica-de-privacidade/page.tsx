import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade | GetParked",
  description: "Política de Privacidade do GetParked - Saiba como protegemos seus dados pessoais.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Política de Privacidade</h1>
      
      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Introdução</h2>
          <p>
            A GetParked está comprometida em proteger sua privacidade. Esta política descreve como coletamos,
            usamos e protegemos suas informações pessoais.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Informações que coletamos</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-medium mb-2">Informações Pessoais</h3>
              <ul className="list-disc pl-6">
                <li>Nome completo</li>
                <li>Endereço de e-mail</li>
                <li>Número de telefone</li>
                <li>Informações de pagamento</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2">Informações de Uso</h3>
              <ul className="list-disc pl-6">
                <li>Dados de localização</li>
                <li>Histórico de reservas</li>
                <li>Preferências de estacionamento</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Como usamos suas informações</h2>
          <p>Utilizamos suas informações para:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Fornecer e melhorar nossos serviços</li>
            <li>Processar suas reservas</li>
            <li>Enviar notificações importantes</li>
            <li>Personalizar sua experiência</li>
            <li>Prevenir fraudes</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Compartilhamento de dados</h2>
          <p>
            Não vendemos suas informações pessoais. Podemos compartilhar seus dados com:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Parceiros de estacionamento</li>
            <li>Provedores de serviços de pagamento</li>
            <li>Autoridades legais quando exigido por lei</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Seus direitos</h2>
          <p>Você tem o direito de:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Acessar seus dados pessoais</li>
            <li>Corrigir informações imprecisas</li>
            <li>Solicitar a exclusão de seus dados</li>
            <li>Retirar seu consentimento</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Segurança</h2>
          <p>
            Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações
            contra acesso não autorizado, alteração, divulgação ou destruição.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Alterações na política</h2>
          <p>
            Podemos atualizar esta política periodicamente. Recomendamos que você revise esta página
            regularmente para se manter informado sobre quaisquer alterações.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Contato</h2>
          <p>
            Para questões sobre privacidade, entre em contato conosco através do email:
            <a href="mailto:privacy@getparked.com" className="text-primary hover:underline ml-1">
              privacy@getparked.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
} 