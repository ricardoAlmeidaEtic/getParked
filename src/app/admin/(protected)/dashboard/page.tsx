import React from 'react';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Painel de Controle</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">Vagas de Estacionamento</h2>
            <p className="text-gray-600">[Resumo das vagas]</p>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">Clientes Ativos</h2>
            <p className="text-gray-600">[Resumo dos clientes]</p>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">Pagamentos Recentes</h2>
            <p className="text-gray-600">[Resumo dos pagamentos]</p>
          </div>
        </div>
        <section className="bg-white p-6 rounded shadow mb-6">
          <h2 className="text-lg font-semibold mb-2">Relatórios Rápidos</h2>
          <p className="text-gray-600">[Gráficos e estatísticas]</p>
        </section>
      </main>
    </div>
  );
} 