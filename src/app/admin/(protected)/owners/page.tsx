'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdminSupabase } from '@/providers/AdminSupabaseProvider';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { showToast } from "@/lib/toast";

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  updated_at: string;
  credits: number;
  plan: string;
  parkings?: Array<{
    id: string;
    name: string;
    address: string;
    hourly_rate: number;
    private_parking_markers?: Array<{
      available_spots: number;
    }>;
  }>;
}

type Owner = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  updated_at: string;
  credits: number;
  plan: string;
  parking?: {
    id: string;
    name: string;
    address: string;
    hourly_rate: number;
    available_spots?: number;
  };
};

export default function OwnersManagement() {
  const { user } = useAdminSupabase();
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCreatingOwner, setIsCreatingOwner] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [ownerToDelete, setOwnerToDelete] = useState<string | null>(null);

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
          parkings:parkings(
            id,
            name,
            address,
            hourly_rate,
            private_parking_markers(available_spots)
          )
        `)
        .eq('role', 'owner')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Transform the data to include parking info
      const ownersWithParking = profiles?.map((profile: Profile) => ({
        ...profile,
        parking: profile.parkings?.[0] ? {
          ...profile.parkings[0],
          available_spots: profile.parkings[0].private_parking_markers?.[0]?.available_spots
        } : null
      })) || [];

      setOwners(ownersWithParking);
    } catch (err: any) {
      console.error('Error fetching owners:', err);
      setError(err.message);
      showToast.error('Erro ao carregar proprietários');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOwner = async (formData: FormData) => {
    setActionLoading(true);
    try {
      const email = formData.get('email') as string;
      const fullName = formData.get('full_name') as string;
      const password = formData.get('password') as string;

      // Create auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'owner'
          }
        }
      });

      if (signUpError) throw signUpError;

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user!.id,
          email,
          full_name: fullName,
          role: 'owner',
          credits: 0,
          plan: 'Basic',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      showToast.success('Proprietário criado com sucesso!');
      setIsCreatingOwner(false);
      fetchOwners();
    } catch (err: any) {
      console.error('Error creating owner:', err);
      showToast.error(err.message || 'Erro ao criar proprietário');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditOwner = (owner: Owner) => {
    setEditingOwner(owner);
  };

  const handleSaveOwner = async (formData: FormData) => {
    if (!editingOwner) return;
    setActionLoading(true);

    try {
      const updatedData = {
        full_name: formData.get('full_name') as string,
        email: formData.get('email') as string,
        plan: formData.get('plan') as string,
        credits: parseInt(formData.get('credits') as string) || 0,
      };

      const { error } = await supabase
        .from('profiles')
        .update({
          ...updatedData,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingOwner.id);

      if (error) throw error;

      // Update local state
      setOwners((prev: Owner[]) => prev.map((owner: Owner) => 
        owner.id === editingOwner.id 
          ? { ...owner, ...updatedData }
          : owner
      ));

      showToast.success('Proprietário atualizado com sucesso!');
      setEditingOwner(null);
    } catch (err: any) {
      console.error('Error updating owner:', err);
      showToast.error(err.message || 'Erro ao atualizar proprietário');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteOwner = async (ownerId: string) => {
    setActionLoading(true);
    try {
      // Delete associated parking first
      const { error: parkingError } = await supabase
        .from('parkings')
        .delete()
        .eq('owner_id', ownerId);

      if (parkingError) throw parkingError;

      // Delete user auth and profile (cascade delete will handle the rest)
      const { error } = await supabase.auth.admin.deleteUser(ownerId);
      if (error) throw error;

      // Remove from local state
      setOwners((prev: Owner[]) => prev.filter((owner: Owner) => owner.id !== ownerId));
      showToast.success('Proprietário excluído com sucesso!');
      setShowDeleteConfirm(false);
      setOwnerToDelete(null);
    } catch (err: any) {
      console.error('Error deleting owner:', err);
      showToast.error(err.message || 'Erro ao excluir proprietário');
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Proprietários</h1>
            <p className="mt-2 text-gray-600">Gerencie os proprietários de estacionamentos cadastrados no sistema.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 px-4 py-2 rounded-lg">
              <span className="text-sm text-blue-600 font-medium">Total: {owners.length} proprietários</span>
            </div>
            <Button 
              onClick={() => setIsCreatingOwner(true)}
              className="bg-primary hover:bg-primary-hover text-white"
              disabled={actionLoading}
            >
              Novo Proprietário
            </Button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proprietário</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plano</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Créditos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estacionamento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taxa/Hora</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Registro</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {owners.map((owner: Owner) => (
                  <tr key={owner.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{owner.full_name || 'Nome não definido'}</div>
                      <div className="text-sm text-gray-500">ID: {owner.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{owner.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        owner.plan === 'Premium' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {owner.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {owner.credits}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {owner.parking ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">{owner.parking.name}</div>
                          <div className="text-sm text-gray-500">{owner.parking.address}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Vagas disponíveis: {owner.parking.available_spots || 0}
                          </div>
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
                        disabled={actionLoading}
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => {
                          setOwnerToDelete(owner.id);
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
                {owners.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                      Nenhum proprietário encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Owner Modal */}
        <Dialog open={isCreatingOwner} onOpenChange={setIsCreatingOwner}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Proprietário</DialogTitle>
            </DialogHeader>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateOwner(new FormData(e.currentTarget));
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="full_name">Nome Completo</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1"
                  minLength={6}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreatingOwner(false)}
                  disabled={actionLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Criando...' : 'Criar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={!!editingOwner} onOpenChange={(open: boolean) => !open && setEditingOwner(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Proprietário</DialogTitle>
            </DialogHeader>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveOwner(new FormData(e.currentTarget));
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="edit_full_name">Nome Completo</Label>
                <Input
                  id="edit_full_name"
                  name="full_name"
                  type="text"
                  defaultValue={editingOwner?.full_name || ''}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit_email">Email</Label>
                <Input
                  id="edit_email"
                  name="email"
                  type="email"
                  defaultValue={editingOwner?.email}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit_plan">Plano</Label>
                <select
                  id="edit_plan"
                  name="plan"
                  defaultValue={editingOwner?.plan}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                >
                  <option value="Basic">Basic</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>
              <div>
                <Label htmlFor="edit_credits">Créditos</Label>
                <Input
                  id="edit_credits"
                  name="credits"
                  type="number"
                  defaultValue={editingOwner?.credits}
                  required
                  min="0"
                  className="mt-1"
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingOwner(null)}
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
                Tem certeza que deseja excluir este proprietário? Esta ação não pode ser desfeita e removerá todos os dados associados, incluindo o estacionamento.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setOwnerToDelete(null);
                }}
                disabled={actionLoading}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => ownerToDelete && handleDeleteOwner(ownerToDelete)}
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