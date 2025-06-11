'use client';

import { useEffect, useState } from 'react';
import { useAdminSupabase } from '@/providers/AdminSupabaseProvider';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Profile {
  id: string;
  full_name: string;
  email: string;
}

interface Reservation {
  id: string;
  client_id: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: string;
  profiles: Profile;
  spots: {
    id: string;
    is_reserved: boolean;
    is_available: boolean;
  };
}

export function RecentReservations() {
  const { user, supabase } = useAdminSupabase();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentReservations = async () => {
      if (!user) return;

      try {
        // Get parking ID for this owner
        const { data: parking } = await supabase
          .from('parkings')
          .select('id')
          .eq('owner_id', user.id)
          .single();

        if (!parking) return;

        // Get all spots for this parking
        const { data: spots } = await supabase
          .from('spots')
          .select('id')
          .eq('parking_id', parking.id);

        if (!spots?.length) return;

        const spotIds = spots.map(spot => spot.id);

        // Get 5 most recent reservations with client info
        const { data } = await supabase
          .from('reservations')
          .select(`
            *,
            profiles (id, full_name, email),
            spots (id, is_reserved, is_available)
          `)
          .in('spot_id', spotIds)
          .order('created_at', { ascending: false })
          .limit(5);

        if (data) {
          setReservations(data);
        }
      } catch (error) {
        console.error('Error fetching recent reservations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentReservations();
  }, [user, supabase]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
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

  const getTimeBasedStatus = (reservation: Reservation): 'waiting' | 'in_progress' | 'done' | 'cancelled' => {
    // If spot is not reserved and is available, the reservation was cancelled
    if (!reservation.spots.is_reserved && reservation.spots.is_available) return 'cancelled';

    const now = new Date();
    const start = new Date(reservation.start_time);
    const end = new Date(reservation.end_time);

    // Convert dates to timestamps for accurate comparison
    const currentTimestamp = now.getTime();
    const startTimestamp = start.getTime();
    const endTimestamp = end.getTime();

    if (currentTimestamp < startTimestamp) return 'waiting';
    if (currentTimestamp >= startTimestamp && currentTimestamp <= endTimestamp) return 'in_progress';
    return 'done';
  };

  const getStatusBadge = (reservation: Reservation) => {
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

    const timeStatus = getTimeBasedStatus(reservation);
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[timeStatus]}`}>
        {statusLabels[timeStatus]}
      </span>
    );
  };

  if (loading) {
    return <div className="text-center py-4">Carregando...</div>;
  }

  return (
    <div className="space-y-8">
      {reservations.map((reservation) => (
        <div key={reservation.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              {getInitials(reservation.profiles?.full_name || 'Cliente')}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {reservation.profiles?.full_name || 'Nome não disponível'}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatDate(reservation.start_time)}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-4">
            {getStatusBadge(reservation)}
            <span className={`font-medium ${!reservation.spots.is_reserved ? 'line-through text-gray-500' : ''}`}>
              {formatPrice(reservation.total_price)}
            </span>
          </div>
        </div>
      ))}
      {reservations.length === 0 && (
        <div className="text-center text-sm text-muted-foreground py-4">
          Nenhuma reserva recente
        </div>
      )}
    </div>
  );
}