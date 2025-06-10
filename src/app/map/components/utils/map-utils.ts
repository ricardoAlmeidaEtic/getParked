import L from 'leaflet'
import { PublicSpotMarker, PrivateParkingMarker } from '@/types/map'
import { createPublicSpotPopupContent, createPrivateParkingPopupContent } from '../modals/popup-content'

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
  })

  const markerInstance = L.marker([marker.latitude, marker.longitude], { icon })
  
  markerInstance.bindPopup(createPublicSpotPopupContent(marker), {
    maxWidth: 300,
    className: 'custom-popup'
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
  })

  console.log('Ícone criado:', icon)

  const markerInstance = L.marker([marker.latitude, marker.longitude], { icon })
  console.log('Instância do marcador criada:', markerInstance)
  
  markerInstance.bindPopup(createPrivateParkingPopupContent(marker, isPremium), {
    maxWidth: 300,
    className: 'custom-popup'
  })

  console.log('Popup vinculado ao marcador')
  return markerInstance
} 