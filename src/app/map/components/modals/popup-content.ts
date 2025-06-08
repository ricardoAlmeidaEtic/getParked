import { PublicSpotMarker, PrivateParkingMarker } from '@/types/map'

export function createPublicSpotPopupContent(marker: PublicSpotMarker): string {
  const expiresAt = new Date(marker.expires_at)
  const now = new Date()
  const timeLeft = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000))
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return `
    <div class="p-4">
      <h3 class="text-lg font-semibold mb-2">${marker.name}</h3>
      <div class="space-y-2">
        <p class="flex items-center text-sm">
          <span class="font-medium mr-2">Vagas disponíveis:</span>
          <span class="text-gray-700">${marker.available_spots}/${marker.total_spots}</span>
        </p>
        <p class="flex items-center text-sm">
          <span class="font-medium mr-2">Expira em:</span>
          <span class="text-gray-700">${minutes}:${seconds.toString().padStart(2, '0')}</span>
        </p>
      </div>
      <button 
        onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${marker.latitude},${marker.longitude}', '_blank')"
        class="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
      >
        Navegar até aqui
      </button>
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