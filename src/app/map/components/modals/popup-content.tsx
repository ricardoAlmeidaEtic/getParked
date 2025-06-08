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

export function createPrivateParkingPopupContent(marker: PrivateParkingMarker): string {
  // Verifica se o estacionamento está aberto baseado no horário atual
  const now = new Date()
  const currentTime = now.getHours() * 60 + now.getMinutes()
  
  const openingMinutes = marker.opening_time 
    ? parseInt(marker.opening_time.split(':')[0]) * 60 + parseInt(marker.opening_time.split(':')[1])
    : null
  const closingMinutes = marker.closing_time
    ? parseInt(marker.closing_time.split(':')[0]) * 60 + parseInt(marker.closing_time.split(':')[1])
    : null
  
  const isOpen = openingMinutes !== null && closingMinutes !== null
    ? currentTime >= openingMinutes && currentTime <= closingMinutes
    : true

  const formatTime = (time: string | null) => {
    if (!time) return 'Não especificado'
    return time
  }

  return `
    <div class="p-4">
      <h3 class="text-lg font-semibold mb-2">${marker.parking_name}</h3>
      <div class="space-y-2">
        <p class="flex items-center text-sm">
          <span class="font-medium mr-2">Status:</span>
          <span class="${isOpen ? 'text-green-600' : 'text-red-600'} font-medium">
            ${isOpen ? 'Aberto' : 'Fechado'}
          </span>
        </p>
        <p class="flex items-center text-sm">
          <span class="font-medium mr-2">Vagas disponíveis:</span>
          <span class="text-gray-700">${marker.available_spots}</span>
        </p>
        <p class="flex items-center text-sm">
          <span class="font-medium mr-2">Horário de funcionamento:</span>
          <span class="text-gray-700">${formatTime(marker.opening_time)} - ${formatTime(marker.closing_time)}</span>
        </p>
        ${marker.phone ? `
          <p class="flex items-center text-sm">
            <span class="font-medium mr-2">Telefone:</span>
            <span class="text-gray-700">${marker.phone}</span>
          </p>
        ` : ''}
      </div>
      <button 
        onclick="window.dispatchEvent(new CustomEvent('startNavigation', { detail: { lat: ${marker.latitude}, lng: ${marker.longitude}, name: '${marker.parking_name}' } }))"
        class="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
      >
        Navegar até aqui
      </button>
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