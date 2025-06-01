'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { showToast } from '@/lib/toast'
import { getPublicSpotMarkers, getPrivateParkingMarkers } from '@/lib/map-markers'
import { createPublicSpotMarker, createPrivateParkingMarker } from '@/lib/map-utils'
import { RouteManager } from '@/lib/route-utils'
import { PublicSpotCreator } from '@/lib/public-spot-creator'
import { CreatePublicSpotModal } from '@/components/CreatePublicSpotModal'
import { MapMarker } from '@/types/map'
import { Button } from '@/components/ui/button'

// Importação dinâmica do Leaflet
const MapComponent = dynamic(() => import('./components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100">
      <div className="text-gray-600">Carregando mapa...</div>
    </div>
  )
})

export default function MapPage() {
  const [isCreatingSpot, setIsCreatingSpot] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentMarkerPosition, setCurrentMarkerPosition] = useState<any>(null)

  const handleCreateSpotClick = () => {
    if (isCreatingSpot) {
      // Se já estiver criando, cancela a criação
      setIsCreatingSpot(false)
      setCurrentMarkerPosition(null)
      setIsModalOpen(false)
    } else {
      // Inicia a criação
      console.log('Iniciando criação de vaga pública')
      setIsCreatingSpot(true)
      setCurrentMarkerPosition(null)
    }
  }

  const handleMarkerCreated = () => {
    console.log('Marcador criado - desativando modo de criação')
    setIsCreatingSpot(false)
  }

  const handleMarkerPositionChange = (position: any) => {
    console.log('Posição do marcador alterada:', position)
    if (position) {
      console.log('Abrindo modal de confirmação com posição:', position)
      setCurrentMarkerPosition(position)
      setIsModalOpen(true)
    } else {
      console.log('Posição nula recebida, fechando modal')
      setIsModalOpen(false)
      setCurrentMarkerPosition(null)
    }
  }

  const handleModalClose = () => {
    console.log('Fechando modal')
    setIsModalOpen(false)
    setCurrentMarkerPosition(null)
  }

  const handleEditPosition = () => {
    console.log('Editando posição - voltando para seleção no mapa')
    setIsModalOpen(false)
    setCurrentMarkerPosition(null)
    setIsCreatingSpot(true)
  }

  // Adicionar useEffect para monitorar mudanças de estado
  useEffect(() => {
    console.log('Estado atual:', {
      isCreatingSpot,
      isModalOpen,
      currentMarkerPosition: currentMarkerPosition ? {
        lat: currentMarkerPosition.lat,
        lng: currentMarkerPosition.lng
      } : null
    })
  }, [isCreatingSpot, isModalOpen, currentMarkerPosition])

  return (
    <div className="relative w-full h-screen">
      <MapComponent
        isCreatingSpot={isCreatingSpot}
        onMarkerPositionChange={handleMarkerPositionChange}
        onMarkerCreated={handleMarkerCreated}
      />
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
              GetParked - Map
            </h1>
            <Button
              onClick={handleCreateSpotClick}
              className="pointer-events-auto"
              variant={isCreatingSpot ? "destructive" : "default"}
            >
              {isCreatingSpot ? "Cancelar Criação" : "Criar Vaga Pública"}
            </Button>
          </div>
        </div>
      </div>

      <CreatePublicSpotModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        initialPosition={currentMarkerPosition}
        onMarkerCreated={handleMarkerCreated}
        onEditPosition={handleEditPosition}
      />
    </div>
  )
} 