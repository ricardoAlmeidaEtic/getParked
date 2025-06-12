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

  useEffect(() => {
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
      } finally {
        setLoading(false)
      }
    }

    fetchReservations()
  }, [user, supabase])

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col">
        <div className="flex-1 pt-24 pb-16 px-4 md:px-8 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Sessão expirada</h1>
          <p className="mb-6">Por favor, inicie sessão novamente para ver os seus lugares reservados.</p>
          <Button onClick={() => router.push("/auth/signin")}>Iniciar sessão</Button>
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

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Minhas Reservas</h1>
            <Button 
              onClick={() => router.push('/map')}
              className="bg-primary hover:bg-primary/90"
            >
              Encontrar Vagas
            </Button>
          </div>

          {reservations.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-lg text-gray-600 mb-4">Você ainda não tem nenhuma reserva.</p>
              <Button 
                onClick={() => router.push('/map')}
                className="bg-primary hover:bg-primary/90"
              >
                Encontrar Vagas
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reservations.map((reservation) => (
                <ReservationCard key={reservation.id} reservation={reservation} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
