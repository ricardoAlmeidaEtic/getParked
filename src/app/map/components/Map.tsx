import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'
import { useSupabase } from '@/providers/SupabaseProvider'
import { PublicSpotMarker, PrivateParkingMarker } from '@/types/map'
import { createPublicSpotPopupContent, createPrivateParkingPopupContent } from './modals/popup-content'
import { ReservationModal } from './modals/ReservationModal'

export function Map() {
  const { supabase } = useSupabase()
  const [publicMarkers, setPublicMarkers] = useState<PublicSpotMarker[]>([])
  const [privateMarkers, setPrivateMarkers] = useState<PrivateParkingMarker[]>([])
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false)
  const [selectedParking, setSelectedParking] = useState<{ id: string; name: string } | null>(null)

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
          >
            <Popup>
              <div dangerouslySetInnerHTML={{ __html: createPublicSpotPopupContent(marker) }} />
            </Popup>
          </Marker>
        ))}
        {privateMarkers.map((marker) => (
          <Marker
            key={marker.parking_id}
            position={[marker.latitude, marker.longitude]}
            icon={privateParkingIcon}
          >
            <Popup>
              <div dangerouslySetInnerHTML={{ __html: createPrivateParkingPopupContent(marker) }} />
            </Popup>
          </Marker>
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
    </>
  )
} 