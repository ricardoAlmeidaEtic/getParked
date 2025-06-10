import { Button } from '@/components/ui/button'
import L from 'leaflet'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { showToast } from '@/lib/toast'
import Image from 'next/image'
import { useProfile } from '@/hooks/useProfile'
import { useSupabase } from '@/providers/SupabaseProvider'
import { ReservationModal } from './ReservationModal'

interface RouteInfoModalProps {
  isOpen: boolean
  onClose: () => void
  distance: number
  duration: number
  destinationName: string
  userPosition: L.LatLng | null
  destinationPosition: L.LatLng
  onSpotConfirmed: () => void
  onSpotNotFound: () => void
  onStartNavigation: () => void
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
}

export default function RouteInfoModal({
  isOpen,
  onClose,
  distance,
  duration,
  destinationName,
  userPosition,
  destinationPosition,
  onSpotConfirmed,
  onSpotNotFound,
  onStartNavigation,
  isNavigating,
  spotDetails
}: RouteInfoModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const [isNearDestination, setIsNearDestination] = useState(false)
  const { profile } = useProfile()
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      requestAnimationFrame(() => {
        setIsVisible(true)
      })
    } else {
      setIsVisible(false)
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    if (!userPosition || !destinationPosition) return

    const checkDistance = () => {
      const distance = userPosition.distanceTo(destinationPosition)
      setIsNearDestination(distance <= 100)
    }

    const interval = setInterval(checkDistance, 1000)
    checkDistance()

    return () => clearInterval(interval)
  }, [userPosition, destinationPosition])

  const handleConfirmSpot = async () => {
    try {
      const { error } = await supabase
        .from('public_spot_markers')
        .update({ status: 'confirmed' })
        .eq('latitude', destinationPosition.lat)
        .eq('longitude', destinationPosition.lng)

      if (error) throw error

      showToast.success('Vaga confirmada com sucesso!')
      onSpotConfirmed()
      onClose()
    } catch (error) {
      console.error('Erro ao confirmar vaga:', error)
      showToast.error('Erro ao confirmar vaga')
    }
  }

  const handleSpotNotFound = async () => {
    try {
      const { error } = await supabase
        .from('public_spot_markers')
        .update({ status: 'not_found' })
        .eq('latitude', destinationPosition.lat)
        .eq('longitude', destinationPosition.lng)

      if (error) throw error

      showToast.info('Obrigado pelo feedback!')
      onSpotNotFound()
      onClose()
    } catch (error) {
      console.error('Erro ao atualizar status da vaga:', error)
      showToast.error('Erro ao atualizar status da vaga')
    }
  }

  const handleStartNavigation = () => {
    onStartNavigation()
    onClose()
  }

  const formatTime = (time: string | undefined) => {
    if (!time) return 'Não especificado'
    return time
  }

  const formatExpirationTime = (expiresAt: string | undefined) => {
    if (!expiresAt) return 'Não especificado'
    const expirationDate = new Date(expiresAt)
    const now = new Date()
    const diffInMinutes = Math.floor((expirationDate.getTime() - now.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 0) return 'Expirado'
    if (diffInMinutes < 60) return `${diffInMinutes} minutos`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} horas`
    return `${Math.floor(diffInMinutes / 1440)} dias`
  }

  const handleOpenReservationModal = () => {
    if (!profile || profile.plan !== 'Premium') {
      showToast.error('Você precisa ter o plano Premium para fazer reservas')
      return
    }
    setIsReservationModalOpen(true)
  }

  if (!shouldRender) return null

  return (
    <>
      <div 
        className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm z-[1000] transition-all duration-300 ${
          isVisible 
            ? 'translate-y-0 opacity-100' 
            : 'translate-y-full opacity-0'
        }`}
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50">
          <div className="p-4 sm:p-5">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-lg">🚗</span>
                </div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Informações da Vaga</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded-full"
                aria-label="Fechar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              {/* Spot Info */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-3 sm:p-4 rounded-lg border border-blue-200/50">
                <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-3 flex items-center">
                  <span className="mr-1.5">🎯</span>
                  {destinationName}
                </h3>
                
                {/* Spot Details */}
                <div className="bg-white/80 p-3 rounded-lg shadow-sm mb-3">
                  <div className="space-y-2">
                    <p className="flex items-center text-sm">
                      <span className="font-medium mr-2">Tipo:</span>
                      <span className="text-gray-700">
                        {spotDetails?.type === 'public' ? 'Vaga Pública' : 'Estacionamento Privado'}
                      </span>
                    </p>
                    
                    {spotDetails?.type === 'public' ? (
                      <>
                        <p className="flex items-center text-sm">
                          <span className="font-medium mr-2">Vagas disponíveis:</span>
                          <span className="text-gray-700">
                            {spotDetails.availableSpots}/{spotDetails.totalSpots}
                          </span>
                        </p>
                        <p className="flex items-center text-sm">
                          <span className="font-medium mr-2">Expira em:</span>
                          <span className="text-gray-700">
                            {formatExpirationTime(spotDetails.expiresAt)}
                          </span>
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="flex items-center text-sm">
                          <span className="font-medium mr-2">Horário:</span>
                          <span className="text-gray-700">
                            {formatTime(spotDetails?.openingTime)} - {formatTime(spotDetails?.closingTime)}
                          </span>
                        </p>
                        {spotDetails?.phone && (
                          <p className="flex items-center text-sm">
                            <span className="font-medium mr-2">Telefone:</span>
                            <span className="text-gray-700">{spotDetails.phone}</span>
                          </p>
                        )}
                      </>
                    )}
                    
                    {spotDetails?.pricePerHour && (
                      <p className="flex items-center text-sm">
                        <span className="font-medium mr-2">Preço/hora:</span>
                        <span className="text-gray-700">R$ {spotDetails.pricePerHour.toFixed(2)}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Route Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/80 p-2 sm:p-3 rounded-lg shadow-sm">
                    <div className="flex items-center space-x-1.5 mb-1">
                      <span className="text-base">📏</span>
                      <p className="text-xs sm:text-sm font-medium text-gray-500">Distância</p>
                    </div>
                    <p className="text-base sm:text-lg font-bold text-gray-900">{distance.toFixed(1)} km</p>
                  </div>
                  <div className="bg-white/80 p-2 sm:p-3 rounded-lg shadow-sm">
                    <div className="flex items-center space-x-1.5 mb-1">
                      <span className="text-base">⏱️</span>
                      <p className="text-xs sm:text-sm font-medium text-gray-500">Tempo</p>
                    </div>
                    <p className="text-base sm:text-lg font-bold text-gray-900">{duration} min</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Navigation Button */}
                {!isNavigating && !isNearDestination && (
                  <Button
                    onClick={handleStartNavigation}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 py-4 shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center group"
                  >
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Iniciar Navegação
                  </Button>
                )}

                {/* Reservation Button for Private Parking */}
                {spotDetails?.type === 'private' && spotDetails.availableSpots && spotDetails.availableSpots > 0 && (
                  <Button
                    onClick={handleOpenReservationModal}
                    className="w-full bg-green-500 hover:bg-green-600 text-white transition-all duration-200 py-4 shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center group"
                  >
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Reservar Vaga
                  </Button>
                )}

                {/* Confirmation Buttons */}
                {isNearDestination && (
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-4">Você chegou ao destino! A vaga está disponível?</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        onClick={handleSpotNotFound}
                        className="w-full bg-red-500 hover:bg-red-600 text-white transition-all duration-200 py-6 shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center group"
                      >
                        <Image
                          src="/icons/spot-not-found.svg"
                          alt="Vaga não encontrada"
                          width={40}
                          height={40}
                          className="w-10 h-10 transform group-hover:scale-110 transition-transform duration-200"
                        />
                      </Button>
                      <Button
                        onClick={handleConfirmSpot}
                        className="w-full bg-green-500 hover:bg-green-600 text-white transition-all duration-200 py-6 shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center group"
                      >
                        <Image
                          src="/icons/spot-confirmed.svg"
                          alt="Vaga confirmada"
                          width={40}
                          height={40}
                          className="w-10 h-10 transform group-hover:scale-110 transition-transform duration-200"
                        />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reservation Modal */}
      {isReservationModalOpen && spotDetails?.parkingId && (
        <ReservationModal
          isOpen={isReservationModalOpen}
          onClose={() => setIsReservationModalOpen(false)}
          parkingId={spotDetails.parkingId}
          parkingName={destinationName}
          onReservationComplete={() => {
            setIsReservationModalOpen(false)
            onClose()
          }}
        />
      )}
    </>
  )
} 