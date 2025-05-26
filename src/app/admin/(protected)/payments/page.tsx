import React from 'react';

export default function PaymentsManagement() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">Gerenciar Pagamentos</h1>
      <div className="bg-white rounded shadow p-6">
        <div className="flex justify-between mb-4">
          <span className="font-semibold">Pagamentos</span>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Adicionar Pagamento</button>
        </div>
        <table className="min-w-full table-auto">
          <thead>
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Cliente</th>
              <th className="px-4 py-2">Valor</th>
              <th className="px-4 py-2">Data</th>
              <th className="px-4 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {/* Placeholder rows */}
            <tr>
              <td className="border px-4 py-2">1</td>
              <td className="border px-4 py-2">João Silva</td>
              <td className="border px-4 py-2">R$ 50,00</td>
              <td className="border px-4 py-2">2024-06-01</td>
              <td className="border px-4 py-2">
                <button className="text-blue-600 mr-2">Editar</button>
                <button className="text-red-600">Excluir</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
} 