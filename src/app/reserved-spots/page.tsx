"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/providers/SupabaseProvider'
import { useProfile } from '@/hooks/useProfile'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin, Car } from 'lucide-react'

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
        // Buscar as reservas do usuário
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

        // Garantir que os dados estão no formato correto
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600'
      case 'pending':
        return 'text-yellow-600'
      case 'cancelled':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada'
      case 'pending':
        return 'Pendente'
      case 'cancelled':
        return 'Cancelada'
      default:
        return status
    }
  }

  // Redirecionar se não houver usuário
  if (!user) {
    return (
      <main className="flex min-h-screen flex-col">
        <div className="flex-1 pt-24 pb-16 px-4 md:px-8 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Sessão expirada</h1>
          <p className="mb-6">Por favor, faça login novamente para ver suas vagas reservadas.</p>
          <Button onClick={() => router.push("/auth/signin")}>Fazer Login</Button>
        </div>
      </main>
    )
  }

  // Exibir tela de carregamento
  if (profileLoading || loading) {
    return (
      <main className="flex min-h-screen flex-col">
        <div className="flex-1 pt-24 pb-16 px-4 md:px-8 flex items-center justify-center">
          <div className="animate-spin text-primary text-4xl">⏳</div>
        </div>
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen flex-col">
        <div className="flex-1 pt-24 pb-16 px-4 md:px-8 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Erro ao carregar perfil</h1>
            <p className="mb-6">Não foi possível carregar seus dados de usuário.</p>
            <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex-1 pt-24 pb-16 px-4 md:px-8">
        <h1 className="text-3xl font-bold mb-8">Minhas Reservas</h1>
        
        {reservations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 mb-4">Você ainda não tem nenhuma reserva.</p>
            <Button onClick={() => router.push('/map')}>
              Encontrar Vagas
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold truncate">{reservation.spots[0]?.parkings?.name}</h2>
                  <span className={`text-sm font-medium ${getStatusColor(reservation.status)}`}>
                    {getStatusText(reservation.status)}
                  </span>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{reservation.spots[0]?.parkings?.address}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Car className="h-4 w-4" />
                    <span>Vaga {reservation.spots[0]?.number}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDateTime(reservation.start_time).split(' ')[0]}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>
                      {formatDateTime(reservation.start_time).split(' ')[1]} - {formatDateTime(reservation.end_time).split(' ')[1]}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-primary font-medium">
                    R$ {reservation.total_price?.toFixed(2) || '0.00'}
                  </span>
                  <Button 
                    variant="outline" 
                    onClick={() => router.push(`/map?spot=${reservation.spots[0]?.id}`)}
                  >
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
} 