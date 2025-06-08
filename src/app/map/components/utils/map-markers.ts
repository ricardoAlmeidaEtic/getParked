import { supabase } from '@/lib/supabase'
import { PublicSpotMarker, PrivateParkingMarker } from '@/types/map'

async function updateExpiredSpots() {
  try {
    const { error } = await supabase.rpc('update_expired_spot_markers')
    if (error) {
      console.error('Erro ao atualizar vagas expiradas:', error)
    }
  } catch (error) {
    console.error('Erro ao atualizar vagas expiradas:', error)
  }
}

export async function getPublicSpotMarkers(): Promise<PublicSpotMarker[]> {
  try {
    // Primeiro, atualiza as vagas expiradas
    await updateExpiredSpots()

    // Depois, busca as vagas ativas
    const { data, error } = await supabase
      .from('public_spot_markers')
      .select('*')
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())

    if (error) {
      console.error('Erro ao buscar marcadores públicos:', error)
      return []
    }

    console.log('Marcadores públicos carregados:', data)
    return data as PublicSpotMarker[]
  } catch (error) {
    console.error('Erro ao buscar marcadores públicos:', error)
    return []
  }
}

export async function getPrivateParkingMarkers(): Promise<PrivateParkingMarker[]> {
  try {
    const { data, error } = await supabase
      .from('private_parking_markers')
      .select('*')
      .order('parking_name', { ascending: true })

    if (error) {
      console.error('Erro ao buscar marcadores privados:', error)
      return []
    }

    // Transforma os dados para o formato esperado pelo mapa
    const markers = data.map(marker => ({
      ...marker,
      type: 'private' as const,
      name: marker.parking_name,
      id: marker.parking_id
    }))

    console.log('Marcadores privados carregados:', markers)
    return markers
  } catch (error) {
    console.error('Erro ao buscar marcadores privados:', error)
    return []
  }
} 