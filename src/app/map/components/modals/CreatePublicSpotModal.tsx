import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { showToast } from '@/lib/toast'
import L from 'leaflet'
import { SelectionArea, createPublicSpotMarker } from '@/app/map/components/utils'

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
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutos a partir de agora
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
      <div className="space-y-6">
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Localização Selecionada</h3>
          </div>
          
          {position && (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Latitude</p>
                  <p className="font-mono text-sm text-gray-900">{position.lat.toFixed(6)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Longitude</p>
                  <p className="font-mono text-sm text-gray-900">{position.lng.toFixed(6)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-4 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onEditPosition}
            disabled={isSubmitting}
            className="flex-grow md:flex-grow-0 px-6 py-2 rounded-lg shadow-sm text-gray-700 border-gray-300 hover:bg-gray-100 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Editar Localização
          </Button>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-grow md:flex-grow-0 px-6 py-2 rounded-lg shadow-sm text-gray-700 border-gray-300 hover:bg-gray-100 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!position || isSubmitting}
            loading={isSubmitting}
            className="flex-grow md:flex-grow-0 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            Confirmar e Salvar
          </Button>
        </div>
      </div>
    </Modal>
  )
} 