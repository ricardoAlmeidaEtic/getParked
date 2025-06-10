import { PublicSpotMarker, PrivateParkingMarker } from '../../../../types/map'

const formatExpirationTime = (expiresAt: string) => {
  const expirationDate = new Date(expiresAt)
  const now = new Date()
  const diffInMinutes = Math.floor((expirationDate.getTime() - now.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 0) return 'Expirado'
  if (diffInMinutes < 60) return `${diffInMinutes} minutos`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} horas`
  return `${Math.floor(diffInMinutes / 1440)} dias`
}

const formatTime = (time: string | null) => {
  if (!time) return 'Não especificado'
  return time
}

const isParkingOpen = (openingTime: string | null, closingTime: string | null) => {
  const now = new Date()
  const currentTime = now.getHours() * 60 + now.getMinutes()
  
  const openingMinutes = openingTime 
    ? parseInt(openingTime.split(':')[0]) * 60 + parseInt(openingTime.split(':')[1])
    : null
  const closingMinutes = closingTime
    ? parseInt(closingTime.split(':')[0]) * 60 + parseInt(closingTime.split(':')[1])
    : null
  
  return openingMinutes !== null && closingMinutes !== null
    ? currentTime >= openingMinutes && currentTime <= closingMinutes
    : true
}

export function createPrivateParkingPopupContent(marker: PrivateParkingMarker, isPremium: boolean = false) {
  const isOpen = isParkingOpen(marker.opening_time, marker.closing_time)
  const status = isOpen ? 'Aberto' : 'Fechado'
  const statusColor = isOpen ? 'text-green-500' : 'text-red-500'

  return `
    <div class="p-4">
      <h3 class="text-lg font-semibold mb-2">${marker.parking_name}</h3>
      <p class="mb-2">
        <span class="font-medium">Status:</span>
        <span class="${statusColor}">${status}</span>
      </p>
      <p class="mb-2">
        <span class="font-medium">Vagas disponíveis:</span>
        <span>${marker.available_spots}</span>
      </p>
      <p class="mb-4">
        <span class="font-medium">Horário de funcionamento:</span>
        <span>${marker.opening_time || '24h'} - ${marker.closing_time || '24h'}</span>
      </p>
      <div class="flex flex-col gap-2">
        <button
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${marker.latitude},${marker.longitude}', '_blank')"
        >
          Navegar até aqui
        </button>
        ${isPremium && marker.available_spots > 0 ? `
          <button
            class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
            onclick="window.dispatchEvent(new CustomEvent('openReservationModal', { detail: { parkingId: '${marker.parking_id}', parkingName: '${marker.parking_name}' } }))"
          >
            Reservar vaga
          </button>
        ` : !isPremium ? `
          <p class="text-sm text-gray-500">
            Faça upgrade para o plano Premium para reservar vagas
          </p>
        ` : ''}
      </div>
    </div>
  `
}

export const createPublicSpotPopupContent = (marker: PublicSpotMarker) => {
  return `
    <div class="popup-content">
      <div class="popup-header">
        <h3>Vaga Pública</h3>
        <span class="status ${marker.status.toLowerCase()}">${marker.status}</span>
      </div>
      <div class="popup-body">
        <p><strong>Vagas disponíveis:</strong> ${marker.available_spots}</p>
        <p><strong>Expira em:</strong> ${formatExpirationTime(marker.expires_at)}</p>
        <p><strong>Preço:</strong> R$ ${marker.price_per_hour}/hora</p>
        <p><strong>Endereço:</strong> ${marker.address}</p>
      </div>
      <div class="popup-footer">
        <button 
          onclick="window.dispatchEvent(new CustomEvent('startNavigation', { detail: { lat: ${marker.latitude}, lng: ${marker.longitude}, name: '${marker.name}' } }))"
          class="navigate-btn"
        >
          Navegar até aqui
        </button>
      </div>
    </div>
  `
} 