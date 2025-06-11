'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdminSupabase } from '@/providers/AdminSupabaseProvider';

type TimeBasedStatus = 'waiting' | 'in_progress' | 'done' | 'cancelled';

type Reservation = {
  id: string;
  client_id: string;
  spot_id: string;
  start_time: string;
  end_time: string;
  total_price: number | null;
  status: string;
  created_at: string;
  profiles: {
    id: string;
    full_name: string;
    email: string;
  };
  spots: {
    id: string;
    is_reserved: boolean;
    is_available: boolean;
  };
  client_name?: string;
  client_email?: string;
  timeStatus?: TimeBasedStatus;
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

      
      if (parkingError) {
        console.error('Error fetching parking:', parkingError);
        throw new Error('Error fetching parking data. Please make sure you have a parking registered.');
      }
      if (!parking) {
        console.error('No parking found for owner');
        throw new Error('No parking found. Please register a parking first.');
      }

      // Get all spots for this parking
      const { data: spots, error: spotsError } = await supabase
        .from('spots')
        .select('id, is_reserved, is_available')
        .eq('parking_id', parking.id);

      if (spotsError) {
        console.error('Error fetching spots:', spotsError);
        throw new Error('Error fetching parking spots.');
      }
      if (!spots || spots.length === 0) {
        console.log('No spots found for parking');
        setReservations([]);
        return;
      }

      // Get spot IDs array
      const spotIds = spots.map(spot => spot.id);

      // Get all reservations for spots in the owner's parking
      const { data: reservationsData, error: reservationsError } = await supabase
        .from('reservations')
        .select(`
          *,
          profiles (id, full_name, email),
          spots (id, is_reserved, is_available)
        `)
        .in('spot_id', spotIds)
        .order('created_at', { ascending: false });

      if (reservationsError) throw new Error('Error fetching reservations data.');
      
      // Add debug information to each reservation
      const processedReservations = (reservationsData || []).map(reservation => {

        const timeStatus = getTimeBasedStatus(
          reservation.start_time,
          reservation.end_time,
          reservation.spots.is_reserved,
          reservation.spots.is_available
        );

        return {
          ...reservation,
          timeStatus
        };
      });

      setReservations(processedReservations);
    } catch (err: any) {
      console.error('Error fetching reservations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
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

  const getTimeBasedStatus = (startTime: string, endTime: string, isReserved: boolean, isAvailable: boolean): TimeBasedStatus => {
    // If spot is not reserved and is available, the reservation was cancelled
    if (!isReserved && isAvailable) {
      return 'cancelled';
    }

    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Compare full dates
    if (start > now) {
      return 'waiting';
    }
    
    if (now >= start && now <= end) {
      return 'in_progress';
    }

    return 'done';
  };

  const getStatusBadge = (timeStatus: TimeBasedStatus) => {
    const statusColors = {
      waiting: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-green-100 text-green-800',
      done: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    const statusLabels = {
      waiting: 'Aguardando',
      in_progress: 'Em andamento',
      done: 'Finalizada',
      cancelled: 'Cancelada'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[timeStatus]}`}>
        {statusLabels[timeStatus]}
      </span>
    );
  };

  const getReservedBadge = (isReserved: boolean) => {
    const statusColors = isReserved
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';

    const statusLabel = isReserved ? 'Sim' : 'Não';

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors}`}>
        {statusLabel}
      </span>
    );
  };

  const handleCancelReservation = async (reservation: Reservation) => {
    try {
      // Update the spot status
      const { error: spotError } = await supabase
        .from('spots')
        .update({
          is_reserved: false,
          is_available: true
        })
        .eq('id', reservation.spot_id);

      if (spotError) throw spotError;

      // Update the reservation status
      const { error: reservationError } = await supabase
        .from('reservations')
        .update({
          status: 'cancelled'
        })
        .eq('id', reservation.id);

      if (reservationError) throw reservationError;

      // Refresh the reservations list
      await fetchReservations();
      
    } catch (error: any) {
      console.error('Error cancelling reservation:', error);
      setError('Erro ao cancelar reserva. Por favor, tente novamente.');
    }
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reservada</th>
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
                        {reservation.profiles?.full_name || 'Nome não disponível'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {reservation.profiles?.email || 'Email não disponível'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getReservedBadge(Boolean(reservation.spots?.is_reserved))}
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
                      {getStatusBadge(getTimeBasedStatus(
                        reservation.start_time, 
                        reservation.end_time,
                        reservation.spots.is_reserved,
                        reservation.spots.is_available
                      ))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <span className={reservation.spots.is_reserved ? '' : 'line-through text-gray-500'}>
                        {formatPrice(reservation.total_price ?? 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(reservation.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {reservation.spots.is_reserved && 
                       getTimeBasedStatus(reservation.start_time, reservation.end_time, true, false) === 'waiting' && (
                        <button
                          onClick={() => handleCancelReservation(reservation)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          Cancelar
                        </button>
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
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="text-sm font-medium text-yellow-800">Aguardando</h3>
              <p className="text-2xl font-bold text-yellow-900">
                {reservations.filter(r => getTimeBasedStatus(r.start_time, r.end_time, r.spots.is_reserved, r.spots.is_available) === 'waiting').length}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="text-sm font-medium text-green-800">Em andamento</h3>
              <p className="text-2xl font-bold text-green-900">
                {reservations.filter(r => getTimeBasedStatus(r.start_time, r.end_time, r.spots.is_reserved, r.spots.is_available) === 'in_progress').length}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-blue-800">Finalizadas</h3>
              <p className="text-2xl font-bold text-blue-900">
                {reservations.filter(r => getTimeBasedStatus(r.start_time, r.end_time, r.spots.is_reserved, r.spots.is_available) === 'done').length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 