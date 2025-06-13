'use client';

import { useEffect, useState } from 'react';
import { useAdminSupabase } from '@/providers/AdminSupabaseProvider';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Overview } from "./components/Overview";
import { FinancialOverview } from "./components/FinancialOverview";
import { RecentReservations } from "./components/RecentReservations";

type TimeBasedStatus = 'waiting' | 'in_progress' | 'done';

type OwnerStats = {
  totalReservations: number;
  totalRevenue: number;
  activeReservations: number;
  upcomingReservations: number;
  completedReservations: number;
  reservationsByStatus: { name: string; total: number }[];
  revenueByMonth: { name: string; total: number }[];
};

type AdminStats = {
  totalParkings: number;
  totalSpots: number;
  averageSpotsPerParking: number;
  averageHourlyRate: number;
  minHourlyRate: number;
  maxHourlyRate: number;
  recentParkings: any[];
  allParkings: any[];
  spotsDistribution: { parkingName: string; spots: number; rate: number }[];
};

export default function Dashboard() {
  const { user, supabase } = useAdminSupabase();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [ownerStats, setOwnerStats] = useState<OwnerStats>({
    totalReservations: 0,
    totalRevenue: 0,
    activeReservations: 0,
    upcomingReservations: 0,
    completedReservations: 0,
    reservationsByStatus: [],
    revenueByMonth: []
  });
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalParkings: 0,
    totalSpots: 0,
    averageSpotsPerParking: 0,
    averageHourlyRate: 0,
    minHourlyRate: 0,
    maxHourlyRate: 0,
    recentParkings: [],
    allParkings: [],
    spotsDistribution: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getTimeBasedStatus = (startTime: string, endTime: string): TimeBasedStatus => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

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

  const fetchOwnerDashboardData = async () => {
    try {
      // Get parking ID for this owner
      const { data: parking } = await supabase
        .from('parkings')
        .select('id')
        .eq('owner_id', user!.id)
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
        setOwnerStats({
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

      setOwnerStats({
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
      console.error('Error fetching owner dashboard data:', err);
      throw err;
    }
  };

  const fetchAdminDashboardData = async () => {
    try {
      // Fetch all parkings, spots, and owner data
      const [
        { data: allParkings, error: parkingsError },
        { data: allSpots, error: spotsError },
        { data: owners, error: ownersError }
      ] = await Promise.all([
        supabase.from('parkings').select('id, name, owner_id, created_at, address, hourly_rate'),
        supabase.from('spots').select('id, parking_id'),
        supabase.from('profiles').select('id, full_name, email').eq('role', 'owner')
      ]);

      if (parkingsError) throw new Error('Error fetching parkings: ' + parkingsError.message);
      if (spotsError) throw new Error('Error fetching spots: ' + spotsError.message);
      if (ownersError) console.warn('Could not fetch owners:', ownersError.message);

      console.log('All parkings:', allParkings);
      console.log('All spots:', allSpots);

      // Get parking IDs
      const parkingIds = allParkings?.map(p => p.id) || [];
      
      // Filter spots to only include existing parkings
      const parkingSpots = allSpots?.filter(spot => parkingIds.includes(spot.parking_id)) || [];
      
      // Calculate basic statistics
      const totalParkings = allParkings?.length || 0;
      const totalSpots = parkingSpots?.length || 0;
      
      // Calculate advanced statistics
      const averageSpotsPerParking = totalParkings > 0 ? Math.round((totalSpots / totalParkings) * 10) / 10 : 0;
      
      const hourlyRates = allParkings?.map(p => p.hourly_rate) || [];
      const averageHourlyRate = hourlyRates.length > 0 ? 
        Math.round((hourlyRates.reduce((sum, rate) => sum + rate, 0) / hourlyRates.length) * 100) / 100 : 0;
      const minHourlyRate = hourlyRates.length > 0 ? Math.min(...hourlyRates) : 0;
      const maxHourlyRate = hourlyRates.length > 0 ? Math.max(...hourlyRates) : 0;

      // Create spots distribution data
      const spotsDistribution = allParkings?.map(parking => {
        const spotsCount = parkingSpots.filter(spot => spot.parking_id === parking.id).length;
        return {
          parkingName: parking.name,
          spots: spotsCount,
          rate: parking.hourly_rate
        };
      }) || [];

      // Enhance parkings with owner info and spot counts
      const enhancedParkings = allParkings?.map(parking => {
        const owner = owners?.find(o => o.id === parking.owner_id);
        const spotsCount = parkingSpots.filter(spot => spot.parking_id === parking.id).length;
        return {
          ...parking,
          ownerName: owner?.full_name || 'Unknown',
          ownerEmail: owner?.email || 'N/A',
          spotsCount
        };
      }) || [];

      // Get recent parkings (last 5)
      const recentParkings = enhancedParkings
        ?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5) || [];

      setAdminStats({
        totalParkings,
        totalSpots,
        averageSpotsPerParking,
        averageHourlyRate,
        minHourlyRate,
        maxHourlyRate,
        recentParkings,
        allParkings: enhancedParkings,
        spotsDistribution
      });
    } catch (err: any) {
      console.error('Error fetching admin dashboard data:', err);
      throw err;
    }
  };

  const fetchDashboardData = async () => {
    try {
      if (!user) throw new Error('Not authenticated');

      // Check user role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw new Error('Error fetching user profile');
      }

      setUserRole(profile?.role || null);

      if (profile?.role === 'admin') {
        await fetchAdminDashboardData();
      } else {
        await fetchOwnerDashboardData();
      }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
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

  // Admin Dashboard
  if (userRole === 'admin') {
    return (
      <div className="p-8 space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Administração - Estacionamentos</h1>
          <p className="text-gray-600 mt-2">Visão geral dos estacionamentos na plataforma GetParked</p>
        </div>

        {/* Admin Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Estacionamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{adminStats.totalParkings}</div>
              <p className="text-xs text-gray-600 mt-1">
                Estacionamentos registados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Vagas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{adminStats.totalSpots}</div>
              <p className="text-xs text-gray-600 mt-1">
                {adminStats.averageSpotsPerParking} vagas por estacionamento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Preço Médio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">€{adminStats.averageHourlyRate}</div>
              <p className="text-xs text-gray-600 mt-1">
                por hora
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faixa de Preços</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">€{adminStats.minHourlyRate} - €{adminStats.maxHourlyRate}</div>
              <p className="text-xs text-gray-600 mt-1">
                mín - máx por hora
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Spots Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Vagas por Estacionamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {adminStats.spotsDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full bg-primary"></div>
                    <div>
                      <p className="font-medium text-sm">{item.parkingName}</p>
                      <p className="text-xs text-gray-600">€{item.rate}/hora</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${(item.spots / adminStats.totalSpots) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-12 text-right">{item.spots}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Comprehensive Parking Table */}
        <Card>
          <CardHeader>
            <CardTitle>Todos os Estacionamentos</CardTitle>
            <p className="text-sm text-gray-600">Informação detalhada de todos os estacionamentos</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Nome</th>
                    <th className="text-left p-3 font-medium">Endereço</th>
                    <th className="text-left p-3 font-medium">Vagas</th>
                    <th className="text-left p-3 font-medium">Preço/Hora</th>
                    <th className="text-left p-3 font-medium">Criado</th>
                    <th className="text-left p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {adminStats.allParkings.map((parking, index) => (
                    <tr key={parking.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <p className="font-medium text-sm">{parking.name}</p>
                          <p className="text-xs text-gray-500">ID: {parking.id.slice(0, 8)}...</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="text-sm">{parking.address}</p>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {parking.spotsCount} vagas
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="font-medium text-green-600">€{parking.hourly_rate}</span>
                      </td>
                      <td className="p-3">
                        <p className="text-sm">{formatDate(parking.created_at)}</p>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          Ativo
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {adminStats.allParkings.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum estacionamento encontrado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Parkings Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Estacionamentos Recentes</CardTitle>
            <p className="text-sm text-gray-600">Últimos estacionamentos adicionados</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {adminStats.recentParkings.slice(0, 5).map((parking, index) => (
                <div key={parking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                      {parking.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{parking.name}</p>
                      <p className="text-xs text-gray-600">{parking.address}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {parking.spotsCount} vagas
                      </span>
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        €{parking.hourly_rate}/h
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{formatDate(parking.created_at)}</p>
                  </div>
                </div>
              ))}
              {adminStats.recentParkings.length === 0 && (
                <p className="text-gray-500 text-sm">Nenhum estacionamento encontrado</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Owner Dashboard
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
            <div className="text-2xl font-bold text-primary">{formatCurrency(ownerStats.totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Reservas em Andamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{ownerStats.activeReservations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Reservas Finalizadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{ownerStats.completedReservations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Próximas Reservas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{ownerStats.upcomingReservations}</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Visão Geral</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview data={ownerStats.reservationsByStatus} />
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
      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Visão Geral Financeira</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <FinancialOverview data={ownerStats.revenueByMonth} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 