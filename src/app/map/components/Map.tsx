import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import { Icon } from 'leaflet'
import { useSupabase } from '@/providers/SupabaseProvider'
import { PublicSpotMarker, PrivateParkingMarker } from '@/types/map'
import { ReservationModal } from './modals/ReservationModal'
import RouteInfoModal from './modals/RouteInfoModal'

export function Map() {
  const { supabase } = useSupabase()
  const [publicMarkers, setPublicMarkers] = useState<PublicSpotMarker[]>([])
  const [privateMarkers, setPrivateMarkers] = useState<PrivateParkingMarker[]>([])
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false)
  const [selectedParking, setSelectedParking] = useState<{ id: string; name: string } | null>(null)
  const [routeInfo, setRouteInfo] = useState<{
    isOpen: boolean
    distance: number
    duration: number
    destinationName: string
    destinationPosition: L.LatLng | null
    isNavigating: boolean
    spotDetails?: {
      type: 'public' | 'private'
      availableSpots?: number
      totalSpots?: number
      pricePerHour?: number
      status?: string
      expiresAt?: string
      openingTime?: string
      closingTime?: string
      phone?: string
      parkingId?: string
    }
  }>({
    isOpen: false,
    distance: 0,
    duration: 0,
    destinationName: '',
    destinationPosition: null,
    isNavigating: false
  })

  useEffect(() => {
    // ... existing code ...

    // Adiciona o listener para o evento de abrir o modal de reserva
    const handleOpenReservationModal = (event: CustomEvent) => {
      const { parkingId, parkingName } = event.detail
      setSelectedParking({ id: parkingId, name: parkingName })
      setIsReservationModalOpen(true)
    }

    window.addEventListener('openReservationModal', handleOpenReservationModal as EventListener)

    return () => {
      window.removeEventListener('openReservationModal', handleOpenReservationModal as EventListener)
    }
  }, [])

  const handleReservationComplete = () => {
    // Atualiza a lista de marcadores após uma reserva ser feita
    fetchMarkers()
  }

  const handleMarkerClick = (marker: PublicSpotMarker | PrivateParkingMarker) => {
    // Aqui você pode implementar a lógica para mostrar o RouteInfoModal
    // quando um marcador for clicado
    setRouteInfo({
      isOpen: true,
      distance: 0, // Você precisará calcular isso
      duration: 0, // Você precisará calcular isso
      destinationName: marker.name || marker.parking_name,
      destinationPosition: new L.LatLng(marker.latitude, marker.longitude),
      isNavigating: false,
      spotDetails: {
        type: 'parking_id' in marker ? 'private' : 'public',
        availableSpots: marker.available_spots,
        totalSpots: marker.total_spots,
        pricePerHour: marker.price_per_hour,
        status: marker.status,
        expiresAt: marker.expires_at,
        openingTime: marker.opening_time,
        closingTime: marker.closing_time,
        phone: marker.phone,
        parkingId: marker.parking_id
      }
    })
  }

  return (
    <>
      <MapContainer
        center={[position.lat, position.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {publicMarkers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.latitude, marker.longitude]}
            icon={publicSpotIcon}
            eventHandlers={{
              click: () => handleMarkerClick(marker)
            }}
          />
        ))}
        {privateMarkers.map((marker) => (
          <Marker
            key={marker.parking_id}
            position={[marker.latitude, marker.longitude]}
            icon={privateParkingIcon}
            eventHandlers={{
              click: () => handleMarkerClick(marker)
            }}
          />
        ))}
      </MapContainer>

      {selectedParking && (
        <ReservationModal
          isOpen={isReservationModalOpen}
          onClose={() => {
            setIsReservationModalOpen(false)
            setSelectedParking(null)
          }}
          parkingId={selectedParking.id}
          parkingName={selectedParking.name}
          onReservationComplete={handleReservationComplete}
        />
      )}

      <RouteInfoModal
        isOpen={routeInfo.isOpen}
        onClose={() => setRouteInfo(prev => ({ ...prev, isOpen: false }))}
        distance={routeInfo.distance}
        duration={routeInfo.duration}
        destinationName={routeInfo.destinationName}
        userPosition={null} // Você precisará implementar isso
        destinationPosition={routeInfo.destinationPosition}
        onSpotConfirmed={() => {}}
        onSpotNotFound={() => {}}
        onStartNavigation={() => {}}
        isNavigating={routeInfo.isNavigating}
        spotDetails={routeInfo.spotDetails}
      />
    </>
  )
} 