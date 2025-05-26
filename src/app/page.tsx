export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            GetParked
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Sistema de gerenciamento de estacionamento inteligente
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Gestão Eficiente</h2>
              <p className="text-gray-600">Controle total sobre vagas, clientes e pagamentos</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Relatórios Detalhados</h2>
              <p className="text-gray-600">Acompanhe o desempenho do seu estacionamento</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Interface Intuitiva</h2>
              <p className="text-gray-600">Fácil de usar e gerenciar</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 