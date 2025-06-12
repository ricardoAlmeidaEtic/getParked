import { useState, useEffect } from 'react'
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
  const [pricePerHour, setPricePerHour] = useState<number>(0)
  const [totalPrice, setTotalPrice] = useState<number>(0)
  const [formData, setFormData] = useState({
    start_time: '',
    end_time: ''
  })

  // Busca o preço por hora do estacionamento
  useEffect(() => {
    const fetchParkingPrice = async () => {
      if (!parkingId) return

      const { data: parking, error } = await supabase
        .from('parkings')
        .select('hourly_rate')
        .eq('id', parkingId)
        .single()

      if (error) {
        console.error('Erro ao buscar preço do estacionamento:', error)
        return
      }

      if (parking) {
        setPricePerHour(parking.hourly_rate)
      }
    }

    if (isOpen) {
      fetchParkingPrice()
    }
  }, [isOpen, parkingId, supabase])

  // Calcula o valor total quando os horários são alterados
  useEffect(() => {
    if (formData.start_time && formData.end_time) {
      const startDate = new Date()
      const endDate = new Date()
      const [startHours, startMinutes] = formData.start_time.split(':')
      const [endHours, endMinutes] = formData.end_time.split(':')

      startDate.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0)
      endDate.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0)

      const diffInHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)
      const total = diffInHours * pricePerHour
      setTotalPrice(total)
    }
  }, [formData.start_time, formData.end_time, pricePerHour])

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        start_time: '',
        end_time: ''
      })
      setTotalPrice(0)
    }
  }, [isOpen])

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

    // Cria as datas completas com o dia atual
    const today = new Date()
    const startDate = new Date(today)
    const endDate = new Date(today)

    // Converte os horários para o formato correto
    const [startHours, startMinutes] = formData.start_time.split(':')
    const [endHours, endMinutes] = formData.end_time.split(':')

    // Ajusta as horas considerando o timezone
    const timezoneOffset = today.getTimezoneOffset()
    startDate.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0)
    endDate.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0)

    // Adiciona o offset do timezone para compensar a conversão para UTC
    startDate.setMinutes(startDate.getMinutes() - timezoneOffset)
    endDate.setMinutes(endDate.getMinutes() - timezoneOffset)

    // Verifica se o horário de fim é maior que o de início
    if (endDate <= startDate) {
      showToast.error('O horário de fim deve ser maior que o horário de início')
      return
    }

    // Verifica se o horário de início é no futuro
    if (startDate < new Date()) {
      showToast.error('O horário de início deve ser no futuro')
      return
    }

    setIsSaving(true)
    try {
      // Obtém o usuário atual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      // Primeiro, verifica se há vagas disponíveis e bloqueia a vaga
      const { data: parking, error: parkingError } = await supabase
        .from('private_parking_markers')
        .select('available_spots')
        .eq('parking_id', parkingId)
        .single()

      if (parkingError) {
        console.error('Erro ao buscar estacionamento:', parkingError)
        throw parkingError
      }

      console.log('Dados do estacionamento antes da reserva:', parking)

      if (!parking) {
        showToast.error('Estacionamento não encontrado')
        return
      }

      if (parking.available_spots <= 0) {
        showToast.error('Não há vagas disponíveis neste momento')
        return
      }

      // Cria uma nova vaga
      const { data: newSpot, error: createSpotError } = await supabase
        .from('spots')
        .insert({
          parking_id: parkingId,
          is_available: false,
          is_reserved: true
        })
        .select('id')
        .single()

      if (createSpotError) {
        console.error('Erro ao criar vaga:', createSpotError)
        throw createSpotError
      }

      // Cria a reserva
      const { error: reservationError } = await supabase
        .from('reservations')
        .insert({
          client_id: user.id,
          spot_id: newSpot.id,
          start_time: startDate.toISOString(),
          end_time: endDate.toISOString(),
          total_price: totalPrice,
          status: 'confirmed'
        })

      if (reservationError) {
        console.error('Erro ao criar reserva:', reservationError)
        throw reservationError
      }

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
                Horário de Início
              </Label>
              <Input
                id="start_time"
                name="start_time"
                type="time"
                className="col-span-3"
                value={formData.start_time}
                onChange={handleInputChange}
                required
                min={new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end_time" className="text-right">
                Horário de Fim
              </Label>
              <Input
                id="end_time"
                name="end_time"
                type="time"
                className="col-span-3"
                value={formData.end_time}
                onChange={handleInputChange}
                required
                min={formData.start_time || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              />
            </div>
            {totalPrice > 0 && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  Valor Total
                </Label>
                <div className="col-span-3 text-lg font-semibold text-green-600">
                  €{totalPrice.toFixed(2)}
                </div>
              </div>
            )}
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