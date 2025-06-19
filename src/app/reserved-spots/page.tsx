"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/providers/SupabaseProvider'
import { useProfile } from '@/hooks/useProfile'
import { Button } from '@/components/ui/button'
import { ReservationCard } from './components/ReservationCard'
import { LoadingState } from './components/LoadingState'
import { ProfileError } from './components/ProfileError'
import { SessionExpired } from './components/SessionExpired'
import { showToast } from '@/lib/toast'
import { Loader2 } from 'lucide-react'

interface Reservation {
  id: string
  client_id: string
  spot_id: string
  start_time: string
  end_time: string
  total_price: number | null
  status: string
  created_at: string
  spots: {
    id: string
    parking_id: string
    number: string
    is_available: boolean
    is_reserved: boolean
    parkings: {
      id: string
      name: string
      address: string
      hourly_rate: number
    }
  }[]
}

export default function ReservedSpotsPage() {
  const router = useRouter()
  const { supabase, user } = useSupabase()
  const { profile, loading: profileLoading } = useProfile()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  const fetchReservations = async () => {
    if (!user) {
      console.log('Usuário não autenticado')
      return
    }

    console.log('Buscando reservas para o usuário:', user.id)

    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          id,
          client_id,
          spot_id,
          start_time,
          end_time,
          total_price,
          status,
          created_at,
          spots (
            id,
            parking_id,
            number,
            is_available,
            is_reserved,
            parkings (
              id,
              name,
              address,
              hourly_rate
            )
          )
        `)
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar reservas:', error)
        throw error
      }

      const formattedReservations = (data || []).map(reservation => ({
        ...reservation,
        spots: Array.isArray(reservation.spots) ? reservation.spots : [reservation.spots]
      })) as unknown as Reservation[]

      console.log('Reservas encontradas:', formattedReservations)
      setReservations(formattedReservations)
    } catch (error) {
      console.error('Erro ao buscar reservas:', error)
      showToast.error('Erro ao carregar reservas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReservations()
  }, [user, supabase])

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col bg-gray-50">
        <div className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">Sessão expirada</h1>
            <p className="mb-6 text-sm sm:text-base text-gray-600">Por favor, inicie sessão novamente para ver os seus lugares reservados.</p>
            <Button 
              onClick={() => router.push("/auth/signin")}
              className="bg-primary hover:bg-primary/90 text-sm sm:text-base py-2 sm:py-3 px-4 sm:px-6"
            >
              Iniciar sessão
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (profileLoading || loading) {
    return <LoadingState />;
  }

  if (!profile) {
    return <ProfileError />;
  }

  if (reservations.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 text-center sm:text-left">Minhas Reservas</h1>
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm sm:text-base">Você ainda não tem reservas.</p>
              <Button 
                onClick={() => router.push('/map')}
                className="mt-4 bg-primary hover:bg-primary/90"
              >
                Encontrar Vagas
              </Button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 text-center sm:text-left">Minhas Reservas</h1>
            <Button 
              onClick={() => router.push('/map')}
              className="bg-primary hover:bg-primary/90 text-sm sm:text-base py-2 sm:py-3 px-4 sm:px-6"
            >
              Encontrar Vagas
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {reservations.map((reservation) => (
              <ReservationCard 
                key={reservation.id} 
                reservation={reservation}
                onReservationCancelled={fetchReservations}
                onReservationDeleted={fetchReservations}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
