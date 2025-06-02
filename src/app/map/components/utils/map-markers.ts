import { supabase } from '@/lib/supabase'
import { PublicSpotMarker, PrivateParkingMarker } from '@/types/map'

export async function getPublicSpotMarkers(): Promise<PublicSpotMarker[]> {
  try {
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
  const { data, error } = await supabase
    .from('private_parking_markers')
    .select('*')

  if (error) {
    console.error('Erro ao buscar marcadores privados:', error)
    return []
  }

  return data as PrivateParkingMarker[]
} 