import L from 'leaflet'
import { PublicSpotMarker, PrivateParkingMarker } from '@/types/map'

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

  const popupContent = `
    <div class="p-2">
      <h3 class="font-bold">${marker.name}</h3>
      <p>Vagas disponíveis: ${marker.available_spots}/${marker.total_spots}</p>
    </div>
  `

  return L.marker([marker.latitude, marker.longitude], { icon })
    .bindPopup(popupContent)
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

  const popupContent = `
    <div class="p-2">
      <h3 class="font-bold">${marker.name}</h3>
      <p>Preço/hora: R$ ${marker.price_per_hour.toFixed(2)}</p>
      <p>Status: ${marker.is_open ? 'Aberto' : 'Fechado'}</p>
    </div>
  `

  return L.marker([marker.latitude, marker.longitude], { icon })
    .bindPopup(popupContent)
} 