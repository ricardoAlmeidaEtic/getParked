import { Button } from '@/components/ui/button'
import L from 'leaflet'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { showToast } from '@/lib/toast'
import Image from 'next/image'

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
  onSpotNotFound
}: RouteInfoModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const [isNearDestination, setIsNearDestination] = useState(false)

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

  if (!shouldRender) return null

  return (
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
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Rota para Vaga</h2>
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
            {/* Route Info */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-3 sm:p-4 rounded-lg border border-blue-200/50">
              <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-3 flex items-center">
                <span className="mr-1.5">🎯</span>
                {destinationName}
              </h3>
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
  )
} 