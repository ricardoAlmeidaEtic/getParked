import L from 'leaflet'
import { PublicSpotMarker, PrivateParkingMarker } from '@/types/map'

export function createPublicSpotMarker(marker: PublicSpotMarker): L.Marker {
  try {
    const icon = L.divIcon({
      className: 'custom-marker public-spot',
      html: `
        <div class="w-6 h-6 bg-yellow-400 rounded-full border-2 border-yellow-600 flex items-center justify-center text-xs font-bold">
          ${marker.available_spots}
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })

    const markerInstance = L.marker([marker.latitude, marker.longitude], { 
      icon,
      title: marker.name,
      alt: marker.name,
      riseOnHover: true
    })

    return markerInstance
  } catch (error) {
    console.error('Erro ao criar marcador público:', error)
    throw error
  }
}

export function createPrivateParkingMarker(marker: PrivateParkingMarker): L.Marker {
  try {
    // Verifica se o estacionamento está aberto baseado no horário atual
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes() // Converte para minutos
    
    const openingMinutes = marker.opening_time 
      ? parseInt(marker.opening_time.split(':')[0]) * 60 + parseInt(marker.opening_time.split(':')[1])
      : null
    const closingMinutes = marker.closing_time
      ? parseInt(marker.closing_time.split(':')[0]) * 60 + parseInt(marker.closing_time.split(':')[1])
      : null
    
    const isOpen = openingMinutes !== null && closingMinutes !== null
      ? currentTime >= openingMinutes && currentTime <= closingMinutes
      : true // Se não tiver horário definido, considera como aberto

    const icon = L.divIcon({
      className: 'custom-marker private-parking',
      html: `
        <div class="w-6 h-6 ${isOpen ? 'bg-green-500 border-green-700' : 'bg-red-500 border-red-700'} rounded-full border-2 flex items-center justify-center text-xs font-bold text-white">
          ${marker.available_spots}
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })

    const markerInstance = L.marker([marker.latitude, marker.longitude], { 
      icon,
      title: marker.parking_name,
      alt: marker.parking_name,
      riseOnHover: true
    })

    return markerInstance
  } catch (error) {
    console.error('Erro ao criar marcador privado:', error)
    throw error
  }
} 