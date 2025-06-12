import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Cookies | GetParked",
  description: "Política de Cookies do GetParked - Saiba como utilizamos cookies para melhorar sua experiência.",
};

export default function CookiePolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Política de Cookies</h1>
      
      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">O que são cookies?</h2>
          <p>
            Cookies são pequenos ficheiros de texto que são armazenados no seu dispositivo quando visita o nosso site.
            Ajudam-nos a melhorar a sua experiência de navegação e a perceber como interage com o nosso site.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Como utilizamos os cookies?</h2>
          <p>Utilizamos cookies para:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Manter a sua sessão durante a visita</li>
            <li>Lembrar as suas preferências</li>
            <li>Perceber como utiliza o nosso site</li>
            <li>Melhorar os nossos serviços</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Tipos de cookies que utilizamos</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-medium mb-2">Cookies Essenciais</h3>
              <p>
                Necessários para o funcionamento básico do site. Não podem ser desativados.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2">Cookies de Desempenho</h3>
              <p>
                Ajudam-nos a perceber como os visitantes interagem com o nosso site.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2">Cookies de Funcionalidade</h3>
              <p>
                Permitem que o site recorde as suas escolhas e forneça funcionalidades melhoradas.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Como controlar os cookies</h2>
          <p>
            Pode controlar e/ou eliminar cookies conforme desejar. Pode eliminar todos os cookies que já estão
            no seu computador e pode configurar a maioria dos navegadores para impedir que sejam colocados.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Alterações nesta política</h2>
          <p>
            Podemos atualizar a nossa política de cookies periodicamente. Recomendamos que reveja esta página
            regularmente para se manter informado sobre quaisquer alterações.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Contacto</h2>
          <p>
            Se tiver dúvidas sobre a nossa política de cookies, contacte-nos através do email:
            <a href="mailto:privacy@getparked.com" className="text-primary hover:underline ml-1">
              privacy@getparked.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}