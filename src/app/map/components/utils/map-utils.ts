import L from 'leaflet'
import { PublicSpotMarker, PrivateParkingMarker } from '@/types/map'

export function createPublicSpotMarker(marker: PublicSpotMarker): L.Marker {
  const icon = L.divIcon({
    className: 'custom-marker public-spot',
    html: `
      <div class="w-6 h-6 bg-green-500 rounded-full border-2 border-green-700 flex items-center justify-center text-xs font-bold text-white">
        ${marker.available_spots}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  })

  const markerInstance = L.marker([marker.latitude, marker.longitude], { icon })
  
  markerInstance.on('click', () => {
    window.dispatchEvent(new CustomEvent('showRouteInfo', {
      detail: {
        type: 'public',
        marker: marker
      }
    }))
  })

  return markerInstance
}

export function createPrivateParkingMarker(marker: PrivateParkingMarker, isPremium: boolean = false): L.Marker {
  console.log('Criando ícone para marcador privado:', marker)
  
  const icon = L.divIcon({
    className: 'custom-marker private-parking',
    html: `
      <div class="w-6 h-6 bg-blue-500 rounded-full border-2 border-blue-700 flex items-center justify-center text-xs font-bold text-white">
        ${marker.available_spots}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  })

  console.log('Ícone criado:', icon)

  const markerInstance = L.marker([marker.latitude, marker.longitude], { icon })
  console.log('Instância do marcador criada:', markerInstance)
  
  markerInstance.on('click', () => {
    window.dispatchEvent(new CustomEvent('showRouteInfo', {
      detail: {
        type: 'private',
        marker: marker,
        isPremium: isPremium
      }
    }))
  })

  console.log('Evento de clique vinculado ao marcador')
  return markerInstance
} 