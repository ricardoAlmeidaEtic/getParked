import { Button } from '@/components/ui/button'
import L from 'leaflet'
import { useEffect, useState } from 'react'

interface RouteInfoModalProps {
  isOpen: boolean
  onClose: () => void
  distance: number
  duration: number
  destinationName: string
}

export default function RouteInfoModal({
  isOpen,
  onClose,
  distance,
  duration,
  destinationName
}: RouteInfoModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      // Pequeno delay para garantir que a animação funcione
      requestAnimationFrame(() => {
        setIsVisible(true)
      })
    } else {
      setIsVisible(false)
      // Aguarda a animação terminar antes de remover o componente
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!shouldRender) return null

  return (
    <div 
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-sm z-[1000] ${
        isVisible ? 'route-info-modal-enter' : 'route-info-modal-exit'
      }`}
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 mx-4">
        <div className="p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-lg">🚗</span>
              </div>
              <h2 className="text-base font-semibold text-gray-900">Rota para Vaga</h2>
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

          <div className="space-y-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-3 rounded-lg border border-blue-200/50">
              <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                <span className="mr-1.5">🎯</span>
                {destinationName}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/80 p-2 rounded-lg shadow-sm">
                  <div className="flex items-center space-x-1.5 mb-1">
                    <span className="text-base">📏</span>
                    <p className="text-xs font-medium text-gray-500">Distância</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{distance.toFixed(1)} km</p>
                </div>
                <div className="bg-white/80 p-2 rounded-lg shadow-sm">
                  <div className="flex items-center space-x-1.5 mb-1">
                    <span className="text-base">⏱️</span>
                    <p className="text-xs font-medium text-gray-500">Tempo</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{duration} min</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 