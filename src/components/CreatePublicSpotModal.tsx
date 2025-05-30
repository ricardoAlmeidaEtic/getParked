import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { showToast } from '@/lib/toast'
import L from 'leaflet'
import { SelectionArea } from '@/lib/map-functions/selection-area'

interface CreatePublicSpotModalProps {
  isOpen: boolean
  onClose: () => void
  initialPosition: L.LatLng | null
  onMarkerCreated: () => void
  onEditPosition: () => void
  userPosition: L.LatLng | null
}

export function CreatePublicSpotModal({
  isOpen,
  onClose,
  initialPosition,
  onMarkerCreated,
  onEditPosition,
  userPosition
}: CreatePublicSpotModalProps) {
  const [position, setPosition] = useState<L.LatLng | null>(initialPosition)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setPosition(initialPosition)
  }, [initialPosition])

  const handleSubmit = async () => {
    if (!position || !userPosition) return

    // Verifica se a posição está dentro do raio permitido
    const selectionArea = new SelectionArea(null as any, userPosition)
    if (!selectionArea.isWithinRadius(position)) {
      showToast.error('A vaga deve estar dentro de 1km da sua localização atual')
      return
    }

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
      title="Confirmar Localização da Vaga"
    >
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            Confirme se a localização selecionada está correta:
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
            onClick={onEditPosition}
            disabled={isSubmitting}
          >
            Editar Localização
          </Button>
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
            Confirmar e Salvar
          </Button>
        </div>
      </div>
    </Modal>
  )
} 