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
            A GetParked está comprometida em proteger a sua privacidade. Esta política descreve como recolhemos,
            usamos e protegemos os seus dados pessoais.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Informações que recolhemos</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-medium mb-2">Dados Pessoais</h3>
              <ul className="list-disc pl-6">
                <li>Nome completo</li>
                <li>Endereço de email</li>
                <li>Número de telefone</li>
                <li>Informações de pagamento</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2">Dados de Utilização</h3>
              <ul className="list-disc pl-6">
                <li>Dados de localização</li>
                <li>Histórico de reservas</li>
                <li>Preferências de estacionamento</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Como usamos os seus dados</h2>
          <p>Utilizamos os seus dados para:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Fornecer e melhorar os nossos serviços</li>
            <li>Processar as suas reservas</li>
            <li>Enviar notificações importantes</li>
            <li>Personalizar a sua experiência</li>
            <li>Prevenir fraudes</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Partilha de dados</h2>
          <p>
            Não vendemos os seus dados pessoais. Podemos partilhar os seus dados com:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Parceiros de estacionamento</li>
            <li>Fornecedores de serviços de pagamento</li>
            <li>Autoridades legais quando exigido por lei</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Os seus direitos</h2>
          <p>Tem direito a:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Aceder aos seus dados pessoais</li>
            <li>Corrigir informações imprecisas</li>
            <li>Solicitar a eliminação dos seus dados</li>
            <li>Retirar o seu consentimento</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Segurança</h2>
          <p>
            Implementámos medidas de segurança técnicas e organizacionais para proteger os seus dados
            contra acesso não autorizado, alteração, divulgação ou destruição.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Alterações na política</h2>
          <p>
            Podemos atualizar esta política periodicamente. Recomendamos que reveja esta página
            regularmente para se manter informado sobre quaisquer alterações.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Contacto</h2>
          <p>
            Para questões sobre privacidade, contacte-nos através do email:
            <a href="mailto:privacy@getparked.com" className="text-primary hover:underline ml-1">
              privacy@getparked.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}