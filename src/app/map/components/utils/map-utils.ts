import L from 'leaflet'
import { PublicSpotMarker, PrivateParkingMarker } from '@/types/map'
import { createPublicSpotPopupContent, createPrivateParkingPopupContent } from '../modals/popup-content'

export function createPublicSpotMarker(marker: PublicSpotMarker): L.Marker {
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

  const markerInstance = L.marker([marker.latitude, marker.longitude], { icon })
    .bindPopup(createPublicSpotPopupContent(marker))

  // Adiciona evento de clique para garantir que o popup seja aberto
  markerInstance.on('click', () => {
    markerInstance.openPopup()
  })

  return markerInstance
}

export function createPrivateParkingMarker(marker: PrivateParkingMarker): L.Marker {
  const icon = L.divIcon({
    className: 'custom-marker private-parking',
    html: `
      <div class="w-6 h-6 bg-gray-400 rounded-full border-2 border-gray-600 flex items-center justify-center text-xs font-bold">
        ${marker.is_open ? 'A' : 'F'}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })

  const markerInstance = L.marker([marker.latitude, marker.longitude], { icon })
    .bindPopup(createPrivateParkingPopupContent(marker))

  // Adiciona evento de clique para garantir que o popup seja aberto
  markerInstance.on('click', () => {
    markerInstance.openPopup()
  })

  return markerInstance
} 