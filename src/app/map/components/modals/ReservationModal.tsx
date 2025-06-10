import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { showToast } from '@/lib/toast'
import { useSupabase } from '@/providers/SupabaseProvider'
import { useProfile } from '@/hooks/useProfile'

interface ReservationModalProps {
  isOpen: boolean
  onClose: () => void
  parkingId: string
  parkingName: string
  onReservationComplete: () => void
}

export function ReservationModal({
  isOpen,
  onClose,
  parkingId,
  parkingName,
  onReservationComplete
}: ReservationModalProps) {
  const { supabase, session } = useSupabase()
  const { profile } = useProfile()
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    start_time: '',
    end_time: '',
    vehicle_id: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleReservation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session || !profile) return

    if (profile.plan !== 'Premium') {
      showToast.error('Você precisa ter o plano Premium para fazer reservas')
      return
    }

    if (!formData.start_time || !formData.end_time) {
      showToast.error('Preencha todos os campos obrigatórios')
      return
    }

    setIsSaving(true)
    try {
      // Inicia uma transação
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      // Primeiro, verifica se há vagas disponíveis e bloqueia a vaga
      const { data: parking, error: parkingError } = await supabase
        .from('private_parking_markers')
        .select('available_spots')
        .eq('parking_id', parkingId)
        .single()

      if (parkingError) throw parkingError
      if (!parking || parking.available_spots <= 0) {
        showToast.error('Não há vagas disponíveis neste momento')
        return
      }

      // Busca uma vaga disponível e a marca como ocupada
      const { data: spot, error: spotError } = await supabase
        .from('private_spots')
        .select('id')
        .eq('parking_id', parkingId)
        .eq('is_occupied', false)
        .limit(1)
        .single()

      if (spotError) throw spotError
      if (!spot) {
        showToast.error('Não foi possível encontrar uma vaga disponível')
        return
      }

      // Atualiza o status da vaga para ocupada
      const { error: updateSpotError } = await supabase
        .from('private_spots')
        .update({ is_occupied: true })
        .eq('id', spot.id)

      if (updateSpotError) throw updateSpotError

      // Cria a reserva
      const { error: reservationError } = await supabase
        .from('reservations')
        .insert({
          client_id: user.id,
          private_spot_id: spot.id,
          start_time: formData.start_time,
          end_time: formData.end_time,
          status: 'confirmed'
        })

      if (reservationError) throw reservationError

      // Atualiza o número de vagas disponíveis
      const { error: updateError } = await supabase
        .from('private_parking_markers')
        .update({ available_spots: parking.available_spots - 1 })
        .eq('parking_id', parkingId)

      if (updateError) throw updateError

      showToast.success('Reserva realizada com sucesso!')
      onReservationComplete()
      onClose()
    } catch (error: any) {
      console.error('Erro ao fazer reserva:', error)
      showToast.error(error.message || 'Ocorreu um erro ao fazer a reserva')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reservar Vaga</DialogTitle>
          <DialogDescription>
            Preencha os detalhes da sua reserva para o estacionamento {parkingName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleReservation}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start_time" className="text-right">
                Início
              </Label>
              <Input
                id="start_time"
                name="start_time"
                type="datetime-local"
                className="col-span-3"
                value={formData.start_time}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end_time" className="text-right">
                Fim
              </Label>
              <Input
                id="end_time"
                name="end_time"
                type="datetime-local"
                className="col-span-3"
                value={formData.end_time}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <span className="animate-spin mr-2">⏳</span> Salvando...
                </>
              ) : (
                "Reservar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 