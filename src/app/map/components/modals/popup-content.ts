import { PublicSpotMarker, PrivateParkingMarker } from '@/types/map'

export function createPublicSpotPopupContent(marker: PublicSpotMarker): string {
  const expiresAt = new Date(marker.expires_at)
  const now = new Date()
  const timeLeft = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000))
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return `
    <div class="p-2">
      <h3 class="font-bold">${marker.name}</h3>
      <p>Vagas disponíveis: ${marker.available_spots}/${marker.total_spots}</p>
      <p class="text-sm text-gray-500 mt-1">Expira em: ${minutes}:${seconds.toString().padStart(2, '0')}</p>
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