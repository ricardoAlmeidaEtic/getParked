'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdminSupabase } from '@/providers/AdminSupabaseProvider';

type Reservation = {
  id: string;
  client_id: string;
  spot_id: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: string;
  created_at: string;
  client?: {
    id: string;
    full_name: string;
    email: string;
  };
  spot?: {
    id: string;
    name: string;
    address: string;
  };
};

export default function Reservations() {
  const { user } = useAdminSupabase();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchReservations();
    }
  }, [user]);

  const fetchReservations = async () => {
    try {
      if (!user) throw new Error('Not authenticated');

      // First get the parking ID for this owner
      const { data: parking, error: parkingError } = await supabase
        .from('parkings')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (parkingError) throw parkingError;
      if (!parking) throw new Error('No parking found for this owner');

      // Fetch reservations with related client and spot data
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          client:profiles!reservations_client_id_fkey(
            id,
            full_name,
            email
          ),
          spot:parkings!reservations_spot_id_fkey(
            id,
            name,
            address
          )
        `)
        .eq('spot_id', parking.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReservations(data || []);
    } catch (err: any) {
      console.error('Error fetching reservations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateReservationStatus = async (reservationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: newStatus })
        .eq('id', reservationId);

      if (error) throw error;

      // Update local state
      setReservations(prev => prev.map(reservation => 
        reservation.id === reservationId 
          ? { ...reservation, status: newStatus }
          : reservation
      ));
    } catch (err: any) {
      console.error('Error updating reservation status:', err);
      setError(err.message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800', 
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
    };

    const statusLabels = {
      pending: 'Pendente',
      confirmed: 'Confirmada',
      cancelled: 'Cancelada', 
      completed: 'Concluída'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
        {statusLabels[status as keyof typeof statusLabels] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando reservas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar reservas: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover"
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
          <h1 className="text-3xl font-bold text-gray-900">Reservas</h1>
          <div className="bg-blue-50 px-4 py-2 rounded-lg">
            <span className="text-sm text-blue-600 font-medium">Total: {reservations.length} reservas</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Período</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criado em</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {reservation.client?.full_name || 'Nome não disponível'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {reservation.client?.email || 'Email não disponível'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <strong>Início:</strong> {formatDate(reservation.start_time)}
                      </div>
                      <div className="text-sm text-gray-500">
                        <strong>Fim:</strong> {formatDate(reservation.end_time)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(reservation.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatPrice(reservation.total_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(reservation.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {reservation.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                            className="text-green-600 hover:text-green-800"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => updateReservationStatus(reservation.id, 'cancelled')}
                            className="text-red-600 hover:text-red-800"
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                      {reservation.status === 'confirmed' && (
                        <button
                          onClick={() => updateReservationStatus(reservation.id, 'completed')}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Marcar como Concluída
                        </button>
                      )}
                      {(reservation.status === 'cancelled' || reservation.status === 'completed') && (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
                {reservations.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      Nenhuma reserva encontrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Cards */}
        {reservations.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="text-sm font-medium text-yellow-800">Pendentes</h3>
              <p className="text-2xl font-bold text-yellow-900">
                {reservations.filter(r => r.status === 'pending').length}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="text-sm font-medium text-green-800">Confirmadas</h3>
              <p className="text-2xl font-bold text-green-900">
                {reservations.filter(r => r.status === 'confirmed').length}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-blue-800">Concluídas</h3>
              <p className="text-2xl font-bold text-blue-900">
                {reservations.filter(r => r.status === 'completed').length}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h3 className="text-sm font-medium text-red-800">Canceladas</h3>
              <p className="text-2xl font-bold text-red-900">
                {reservations.filter(r => r.status === 'cancelled').length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 