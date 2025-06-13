'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdminSupabase } from '@/providers/AdminSupabaseProvider';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { showToast } from "@/lib/toast";

interface Parking {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  hourly_rate: number;
  is_public: boolean;
  created_at: string;
  owner: {
    id: string;
    full_name: string;
    email: string;
    plan: string;
  };
  private_parking_markers?: Array<{
    available_spots: number;
    opening_time: string;
    closing_time: string;
    phone: string;
  }>;
  spots?: Array<{
    id: string;
    number: string;
    is_available: boolean;
  }>;
}

export default function ParkingsManagement() {
  const { user } = useAdminSupabase();
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [editingParking, setEditingParking] = useState<Parking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [parkingToDelete, setParkingToDelete] = useState<string | null>(null);


  useEffect(() => {
    checkAdminRole();
    fetchParkings();
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

  const fetchParkings = async () => {
    try {
      // Fetch all parkings with owner information and markers
      const { data: parkingsData, error: parkingsError } = await supabase
        .from('parkings')
        .select(`
          *,
          profiles!parkings_owner_id_fkey(
            id,
            full_name,
            email,
            plan
          ),
          private_parking_markers(
            available_spots,
            opening_time,
            closing_time,
            phone
          ),
          spots(
            id,
            number,
            is_available
          )
        `)
        .order('created_at', { ascending: false });

      if (parkingsError) throw parkingsError;

      // Transform the data to match our interface
      const transformedParkings = parkingsData?.map((parking: any) => ({
        ...parking,
        owner: parking.profiles || {
          id: parking.owner_id,
          full_name: 'Unknown Owner',
          email: 'N/A',
          plan: 'N/A'
        }
      })) || [];

      setParkings(transformedParkings);
    } catch (err: any) {
      console.error('Error fetching parkings:', err);
      setError(err.message);
      showToast.error('Erro ao carregar estacionamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleEditParking = (parking: Parking) => {
    setEditingParking(parking);
  };

  const handleSaveParking = async (formData: FormData) => {
    if (!editingParking) return;
    setActionLoading(true);

    try {
      const updatedData = {
        name: formData.get('name') as string,
        address: formData.get('address') as string,
        hourly_rate: parseFloat(formData.get('hourly_rate') as string) || 0,
        is_public: formData.get('is_public') === 'true',
      };

      const { error } = await supabase
        .from('parkings')
        .update(updatedData)
        .eq('id', editingParking.id);

      if (error) throw error;

      // Update local state
      setParkings((prev: Parking[]) => prev.map((parking: Parking) => 
        parking.id === editingParking.id 
          ? { ...parking, ...updatedData }
          : parking
      ));

      showToast.success('Estacionamento atualizado com sucesso!');
      setEditingParking(null);
    } catch (err: any) {
      console.error('Error updating parking:', err);
      showToast.error(err.message || 'Erro ao atualizar estacionamento');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteParking = async (parkingId: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('parkings')
        .delete()
        .eq('id', parkingId);

      if (error) throw error;

      // Remove from local state
      setParkings((prev: Parking[]) => prev.filter((parking: Parking) => parking.id !== parkingId));
      showToast.success('Estacionamento excluído com sucesso!');
      setShowDeleteConfirm(false);
      setParkingToDelete(null);
    } catch (err: any) {
      console.error('Error deleting parking:', err);
      showToast.error(err.message || 'Erro ao excluir estacionamento');
    } finally {
      setActionLoading(false);
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
            <p className="mt-4 text-gray-600">Carregando estacionamentos...</p>
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Estacionamentos</h1>
            <p className="mt-2 text-gray-600">Gerencie todos os estacionamentos cadastrados no sistema.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 px-4 py-2 rounded-lg">
              <span className="text-sm text-blue-600 font-medium">Total: {parkings.length} estacionamentos</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estacionamento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endereço</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taxa/Hora</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vagas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Criação</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parkings.map((parking: Parking) => (
                  <tr key={parking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{parking.name}</div>
                      <div className="text-sm text-gray-500">ID: {parking.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{parking.address}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">€{parking.hourly_rate}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Disponíveis: {parking.private_parking_markers?.[0]?.available_spots || 0}
                      </div>
                      <div className="text-sm text-gray-500">
                        Total spots: {parking.spots?.length || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(parking.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                          onClick={() => handleEditParking(parking)}
                          className="text-primary hover:text-primary-hover mr-4"
                          disabled={actionLoading}
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => {
                            setParkingToDelete(parking.id);
                            setShowDeleteConfirm(true);
                          }}
                          className="text-red-600 hover:text-red-800"
                          disabled={actionLoading}
                        >
                          Excluir
                        </button>
                    </td>
                  </tr>
                ))}
                {parkings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      Nenhum estacionamento encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Modal */}
        <Dialog open={!!editingParking} onOpenChange={(open: boolean) => !open && setEditingParking(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Estacionamento</DialogTitle>
            </DialogHeader>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveParking(new FormData(e.currentTarget));
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="edit_name">Nome</Label>
                <Input
                  id="edit_name"
                  name="name"
                  type="text"
                  defaultValue={editingParking?.name || ''}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit_address">Endereço</Label>
                <Input
                  id="edit_address"
                  name="address"
                  type="text"
                  defaultValue={editingParking?.address || ''}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit_hourly_rate">Taxa por Hora (€)</Label>
                <Input
                  id="edit_hourly_rate"
                  name="hourly_rate"
                  type="number"
                  step="0.01"
                  defaultValue={editingParking?.hourly_rate}
                  required
                  min="0"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit_is_public">Tipo</Label>
                <select
                  id="edit_is_public"
                  name="is_public"
                  defaultValue={editingParking?.is_public ? 'true' : 'false'}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                >
                  <option value="false">Privado</option>
                  <option value="true">Público</option>
                </select>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingParking(null)}
                  disabled={actionLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Salvando...' : 'Salvar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir este estacionamento? Esta ação não pode ser desfeita e removerá todos os dados associados.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setParkingToDelete(null);
                }}
                disabled={actionLoading}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => parkingToDelete && handleDeleteParking(parkingToDelete)}
                disabled={actionLoading}
              >
                {actionLoading ? 'Excluindo...' : 'Excluir'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 