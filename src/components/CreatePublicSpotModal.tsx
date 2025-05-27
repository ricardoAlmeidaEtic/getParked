import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { showToast } from '@/lib/toast'
import L from 'leaflet'

interface CreatePublicSpotModalProps {
  isOpen: boolean
  onClose: () => void
  initialPosition: L.LatLng | null
  onMarkerCreated: () => void
}

export function CreatePublicSpotModal({
  isOpen,
  onClose,
  initialPosition,
  onMarkerCreated
}: CreatePublicSpotModalProps) {
  const [position, setPosition] = useState<L.LatLng | null>(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setPosition(initialPosition)
  }, [initialPosition])

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDragEnd = (e: L.DragEndEvent) => {
    setIsDragging(false)
    setPosition(e.target.getLatLng())
  }

  const handleSubmit = async () => {
    if (!position) return

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const { error } = await supabase
        .from('public_spot_markers')
        .insert({
          latitude: position.lat,
          longitude: position.lng,
          created_at: new Date().toISOString(),
          created_by: user.id
        })

      if (error) throw error

      showToast.success('Vaga pública registrada com sucesso!')
      onMarkerCreated()
      onClose()
    } catch (error) {
      console.error('Erro ao criar vaga pública:', error)
      showToast.error('Erro ao registrar vaga pública')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Vaga Pública"
    >
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            {isDragging 
              ? 'Arraste o pin para ajustar a localização...'
              : 'Clique e arraste o pin para ajustar a localização exata'}
          </p>
          {position && (
            <p className="text-sm text-gray-600 mt-2">
              Coordenadas: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!position || isSubmitting}
            loading={isSubmitting}
          >
            Registrar Vaga
          </Button>
        </div>
      </div>
    </Modal>
  )
} 