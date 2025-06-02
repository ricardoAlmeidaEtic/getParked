import { PublicSpotMarker, PrivateParkingMarker } from '@/types/map'

export function createPublicSpotPopupContent(marker: PublicSpotMarker): string {
  return `
    <div class="p-2">
      <h3 class="font-bold">${marker.name}</h3>
      <p>Vagas disponíveis: ${marker.available_spots}/${marker.total_spots}</p>
    </div>
  `
}

export function createPrivateParkingPopupContent(marker: PrivateParkingMarker): string {
  return `
    <div class="p-2">
      <h3 class="font-bold">${marker.name}</h3>
      <p>Preço/hora: R$ ${marker.price_per_hour.toFixed(2)}</p>
      <p>Status: ${marker.is_open ? 'Aberto' : 'Fechado'}</p>
    </div>
  `
} 