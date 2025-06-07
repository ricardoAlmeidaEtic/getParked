'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdminSupabase } from '@/providers/AdminSupabaseProvider';

type Owner = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  updated_at: string;
  parking?: {
    id: string;
    name: string;
    address: string;
    hourly_rate: number;
  };
};

export default function OwnersManagement() {
  const { user } = useAdminSupabase();
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminRole();
    fetchOwners();
  }, [user]);

  const checkAdminRole = async () => {
    if (!user) return;
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      setIsAdmin(profile?.role === 'admin');
    } catch (err) {
      console.error('Error checking admin role:', err);
    }
  };

  const fetchOwners = async () => {
    try {
      // Fetch all owner profiles with their parking information
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          *,
          parkings:parkings(id, name, address, hourly_rate)
        `)
        .eq('role', 'owner')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Transform the data to include parking info
      const ownersWithParking = profiles?.map(profile => ({
        ...profile,
        parking: profile.parkings?.[0] || null
      })) || [];

      setOwners(ownersWithParking);
    } catch (err: any) {
      console.error('Error fetching owners:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditOwner = (owner: Owner) => {
    setEditingOwner(owner);
  };

  const handleSaveOwner = async (updatedData: { full_name: string; email: string }) => {
    if (!editingOwner) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updatedData.full_name,
          email: updatedData.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingOwner.id);

      if (error) throw error;

      // Update local state
      setOwners(prev => prev.map(owner => 
        owner.id === editingOwner.id 
          ? { ...owner, ...updatedData }
          : owner
      ));

      setEditingOwner(null);
    } catch (err: any) {
      console.error('Error updating owner:', err);
      setError(err.message);
    }
  };

  const handleDeleteOwner = async (ownerId: string) => {
    if (!confirm('Tem certeza que deseja excluir este proprietário? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const { error } = await supabase.auth.admin.deleteUser(ownerId);
      if (error) throw error;

      // Remove from local state
      setOwners(prev => prev.filter(owner => owner.id !== ownerId));
    } catch (err: any) {
      console.error('Error deleting owner:', err);
      setError(err.message);
    }
  };

  // Only allow admins to access this page
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h1>
          <p className="text-gray-600">Apenas administradores podem acessar esta página.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando proprietários...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Proprietários</h1>
          <div className="bg-blue-50 px-4 py-2 rounded-lg">
            <span className="text-sm text-blue-600 font-medium">Total: {owners.length} proprietários</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proprietário</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estacionamento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taxa/Hora</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Registro</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {owners.map((owner) => (
                  <tr key={owner.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{owner.full_name || 'Nome não definido'}</div>
                      <div className="text-sm text-gray-500">ID: {owner.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{owner.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {owner.parking ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">{owner.parking.name}</div>
                          <div className="text-sm text-gray-500">{owner.parking.address}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-red-500">Sem estacionamento</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {owner.parking ? `€${owner.parking.hourly_rate}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(owner.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleEditOwner(owner)}
                        className="text-primary hover:text-primary-hover mr-4"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDeleteOwner(owner.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
                {owners.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      Nenhum proprietário encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Modal */}
        {editingOwner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Editar Proprietário</h3>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    handleSaveOwner({
                      full_name: formData.get('full_name') as string,
                      email: formData.get('email') as string
                    });
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                    <input
                      type="text"
                      name="full_name"
                      defaultValue={editingOwner.full_name || ''}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      defaultValue={editingOwner.email}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setEditingOwner(null)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-hover"
                    >
                      Salvar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 