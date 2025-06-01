import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { showToast } from '@/lib/toast'
import L from 'leaflet'
import { SelectionArea } from '@/lib/map-functions/selection-area'
import { getPublicSpotMarkers } from '@/lib/map-markers'
import { createPublicSpotMarker } from '@/lib/map-utils'

interface CreatePublicSpotModalProps {
  isOpen: boolean
  onClose: () => void
  initialPosition: L.LatLng | null
  onMarkerCreated: () => void
  onEditPosition: () => void
  userPosition: L.LatLng | null
  onCancel: () => void
}

export default function CreatePublicSpotModal({
  isOpen,
  onClose,
  initialPosition,
  onMarkerCreated,
  onEditPosition,
  userPosition,
  onCancel
}: CreatePublicSpotModalProps) {
  const [position, setPosition] = useState<L.LatLng | null>(initialPosition)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    setPosition(initialPosition)
  }, [initialPosition])

  const handleClose = () => {
    if (isSubmitting) return
    
    if (position) {
      showToast.warning('Criação de vaga cancelada')
      onCancel()
    }
    
    onClose()
  }

  const checkUserSpotLimit = async (userId: string): Promise<boolean> => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', userId)
        .single()

      if (profileError) throw profileError

      const maxSpots = profile.plan === 'Premium' ? 5 : 2

      const { count, error: countError } = await supabase
        .from('public_spot_markers')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'active')

      if (countError) throw countError

      return (count || 0) < maxSpots
    } catch (error) {
      console.error('Erro ao verificar limite de vagas:', error)
      throw new Error('Erro ao verificar limite de vagas')
    }
  }

  const handleSubmit = async () => {
    if (!position) {
      showToast.error('Selecione uma posição no mapa')
      return
    }

    if (!userPosition) {
      showToast.error('Não foi possível obter sua localização atual')
      return
    }

    // Verifica se a posição está dentro do raio permitido
    const selectionArea = new SelectionArea(null as any, userPosition)
    if (!selectionArea.isWithinRadius(position)) {
      showToast.error('A vaga deve estar dentro de 1km da sua localização atual')
      return
    }

    setIsSubmitting(true)
    try {
      // Verifica autenticação do usuário
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error('Erro de autenticação:', authError)
        throw new Error('Erro de autenticação')
      }
      
      if (!user) {
        console.error('Usuário não autenticado')
        throw new Error('Usuário não autenticado')
      }

      // Verifica se o usuário tem perfil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (profileError || !profile) {
        console.error('Erro ao verificar perfil:', profileError)
        throw new Error('Perfil não encontrado')
      }

      // Verifica limite de vagas
      const canAddSpot = await checkUserSpotLimit(user.id)
      if (!canAddSpot) {
        throw new Error('Você atingiu o limite de vagas públicas. Faça upgrade para o plano Premium para criar mais vagas.')
      }

      // Prepara os dados da vaga
      const spotData = {
        latitude: Number(position.lat.toFixed(6)),
        longitude: Number(position.lng.toFixed(6)),
        created_at: new Date().toISOString(),
        user_id: user.id,
        type: 'public',
        total_spots: 1,
        available_spots: 1,
        status: 'active',
        name: `Vaga Pública - ${user.email?.split('@')[0] || 'Usuário'}`
      }

      console.log('Salvando vaga com dados:', spotData)

      // Insere o marcador
      const { error: insertError } = await supabase
        .from('public_spot_markers')
        .insert(spotData)

      if (insertError) {
        console.error('Erro ao inserir vaga:', insertError)
        throw insertError
      }

      showToast.success('Vaga pública registrada com sucesso!')
      onMarkerCreated()
      onClose()
    } catch (error: any) {
      console.error('Erro ao criar vaga pública:', error)
      showToast.error(error.message || 'Erro ao registrar vaga pública')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
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
            onClick={handleClose}
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