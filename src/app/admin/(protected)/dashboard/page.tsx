'use client';

import { useEffect, useState } from 'react';
import { useAdminSupabase } from '@/providers/AdminSupabaseProvider';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Overview } from "./components/Overview";
import { FinancialOverview } from "./components/FinancialOverview";
import { RecentReservations } from "./components/RecentReservations";

type TimeBasedStatus = 'waiting' | 'in_progress' | 'done';

type DashboardStats = {
  totalReservations: number;
  totalRevenue: number;
  activeReservations: number;
  upcomingReservations: number;
  completedReservations: number;
  reservationsByStatus: { name: string; total: number }[];
  revenueByMonth: { name: string; total: number }[];
};

export default function Dashboard() {
  const { user, supabase } = useAdminSupabase();
  const [stats, setStats] = useState<DashboardStats>({
    totalReservations: 0,
    totalRevenue: 0,
    activeReservations: 0,
    upcomingReservations: 0,
    completedReservations: 0,
    reservationsByStatus: [],
    revenueByMonth: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getTimeBasedStatus = (startTime: string, endTime: string): TimeBasedStatus => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Convert dates to timestamps for accurate comparison
    const currentTimestamp = now.getTime();
    const startTimestamp = start.getTime();
    const endTimestamp = end.getTime();

    if (currentTimestamp < startTimestamp) return 'waiting';
    if (currentTimestamp >= startTimestamp && currentTimestamp <= endTimestamp) return 'in_progress';
    return 'done';
  };

  const getMonthName = (date: Date): string => {
    return date.toLocaleString('pt-BR', { month: 'long' });
  };

  const fetchDashboardData = async () => {
    try {
      if (!user) throw new Error('Not authenticated');

      // Get parking ID for this owner
      const { data: parking } = await supabase
        .from('parkings')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!parking) {
        throw new Error('No parking found');
      }

      // Get all spots for this parking
      const { data: spots } = await supabase
        .from('spots')
        .select('id')
        .eq('parking_id', parking.id);

      // Initialize empty data if no spots found
      if (!spots?.length) {
        setStats({
          totalReservations: 0,
          totalRevenue: 0,
          activeReservations: 0,
          upcomingReservations: 0,
          completedReservations: 0,
          reservationsByStatus: [
            { name: 'Aguardando', total: 0 },
            { name: 'Em andamento', total: 0 },
            { name: 'Finalizadas', total: 0 }
          ],
          revenueByMonth: Array.from(new Map<string, number>().entries()).map(([name, total]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            total
          }))
        });
        return;
      }

      const spotIds = spots.map(spot => spot.id);

      // Get all reservations
      const { data: reservations, error: reservationsError } = await supabase
        .from('reservations')
        .select('*')
        .in('spot_id', spotIds);

      if (reservationsError) {
        throw new Error('Error fetching reservations: ' + reservationsError.message);
      }

      if (!reservations) {
        throw new Error('No reservations found');
      }

      // Calculate statistics
      const statusCounts = {
        waiting: 0,
        in_progress: 0,
        done: 0
      };

      // Initialize revenue by month
      const revenueByMonth = new Map<string, number>();
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        revenueByMonth.set(getMonthName(date), 0);
      }

      let totalRevenue = 0;

      reservations.forEach(reservation => {
        const status = getTimeBasedStatus(reservation.start_time, reservation.end_time);
        statusCounts[status]++;
        
        // Calculate revenue by month
        const reservationDate = new Date(reservation.start_time);
        const monthKey = getMonthName(reservationDate);
        if (revenueByMonth.has(monthKey)) {
          revenueByMonth.set(
            monthKey, 
            (revenueByMonth.get(monthKey) || 0) + (reservation.total_price || 0)
          );
        }

        totalRevenue += reservation.total_price || 0;
      });

      setStats({
        totalReservations: reservations.length,
        totalRevenue,
        activeReservations: statusCounts.in_progress,
        upcomingReservations: statusCounts.waiting,
        completedReservations: statusCounts.done,
        reservationsByStatus: [
          { name: 'Aguardando', total: statusCounts.waiting },
          { name: 'Em andamento', total: statusCounts.in_progress },
          { name: 'Finalizadas', total: statusCounts.done }
        ],
        revenueByMonth: Array.from(revenueByMonth.entries()).map(([name, total]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          total
        }))
      });
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar dados: {error}</p>
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
    <div className="p-8 space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(stats.totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Reservas em Andamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeReservations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Reservas Finalizadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.completedReservations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Próximas Reservas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.upcomingReservations}</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Visão Geral</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview data={stats.reservationsByStatus} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Reservas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentReservations />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Receita por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <FinancialOverview data={stats.revenueByMonth} />
        </CardContent>
      </Card>
    </div>
  );
} 