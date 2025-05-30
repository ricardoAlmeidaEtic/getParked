import { supabase } from './supabase'
import { PublicSpotMarker, PrivateParkingMarker } from '@/types/map'

export async function getPublicSpotMarkers(): Promise<PublicSpotMarker[]> {
  const { data, error } = await supabase
    .from('public_spot_markers')
    .select('*')

  if (error) {
    console.error('Erro ao buscar marcadores públicos:', error)
    return []
  }

  return data as PublicSpotMarker[]
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