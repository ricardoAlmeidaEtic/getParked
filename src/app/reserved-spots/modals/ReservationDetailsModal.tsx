import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Car, CreditCard, AlertCircle, CheckCircle2, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSupabase } from "@/providers/SupabaseProvider"
import { showToast } from "@/lib/toast"
import { useState } from "react"
import { ConfirmCancelModal } from "./ConfirmCancelModal"

interface ReservationDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  reservation: {
    id: string
    start_time: string
    end_time: string
    total_price: number | null
    status: string
    created_at: string
    spots: {
      id: string
      number: string
      parkings: {
        name: string
        address: string
        hourly_rate: number
      }
    }[]
  }
  onReservationCancelled?: () => void
}

export function ReservationDetailsModal({ isOpen, onClose, reservation, onReservationCancelled }: ReservationDetailsModalProps) {
  const router = useRouter()
  const { supabase } = useSupabase()
  const [isCancelling, setIsCancelling] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada'
      case 'pending':
        return 'Pendente'
      case 'cancelled':
        return 'Cancelada'
      default:
        return status
    }
  }

  const calculateDuration = () => {
    const start = new Date(reservation.start_time)
    const end = new Date(reservation.end_time)
    const diff = end.getTime() - start.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const handleCancelClick = () => {
    setIsConfirmModalOpen(true)
  }

  const handleCancelReservation = async () => {
    setIsCancelling(true)
    try {
      // Atualiza o status da reserva
      const { error: reservationError } = await supabase
        .from('reservations')
        .update({
          status: 'cancelled'
        })
        .eq('id', reservation.id)

      if (reservationError) {
        console.error('Erro ao cancelar reserva:', reservationError)
        throw reservationError
      }

      showToast.success('Reserva cancelada com sucesso!')
      onReservationCancelled?.()
      setIsConfirmModalOpen(false)
      onClose()
    } catch (error: any) {
      console.error('Erro ao cancelar reserva:', error)
      showToast.error('Erro ao cancelar reserva. Por favor, tente novamente.')
    } finally {
      setIsCancelling(false)
    }
  }

  const canCancelReservation = () => {
    // Mostra o botão apenas se a reserva estiver confirmada
    return reservation.status === 'confirmed'
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 pr-8">
              Detalhes da Reserva
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
            {/* Status e ID da Reserva */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="flex items-center gap-2">
                {getStatusIcon(reservation.status)}
                <span className="font-medium text-gray-900 text-sm sm:text-base">
                  {getStatusText(reservation.status)}
                </span>
              </div>
              <span className="text-xs sm:text-sm text-gray-500">
                ID: {reservation.id.slice(0, 8)}...
              </span>
            </div>

            {/* Informações do Estacionamento */}
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                {reservation.spots[0]?.parkings?.name}
              </h3>
              <div className="flex items-start gap-2 text-gray-600">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm break-words">{reservation.spots[0]?.parkings?.address}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Car className="h-4 w-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm">Vaga {reservation.spots[0]?.number}</span>
              </div>
            </div>

            {/* Detalhes da Reserva */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">Data</span>
                </div>
                <p className="font-medium text-gray-900 text-sm sm:text-base">
                  {formatDate(reservation.start_time)}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">Horário</span>
                </div>
                <p className="font-medium text-gray-900 text-sm sm:text-base break-all">
                  {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">Duração</span>
                </div>
                <p className="font-medium text-gray-900 text-sm sm:text-base">
                  {calculateDuration()}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <CreditCard className="h-4 w-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">Valor/Hora</span>
                </div>
                <p className="font-medium text-gray-900 text-sm sm:text-base">
                  R$ {reservation.spots[0]?.parkings?.hourly_rate.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Valor Total */}
            <div className="border-t pt-3 sm:pt-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm sm:text-base">Valor Total</span>
                <span className="text-lg sm:text-xl font-bold text-primary-600">
                  R$ {reservation.total_price?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
              <Button
                variant="outline"
                className="flex-1 text-sm sm:text-base py-2 sm:py-3"
                onClick={onClose}
              >
                Fechar
              </Button>
              {canCancelReservation() && (
                <Button
                  variant="destructive"
                  className="flex-1 text-sm sm:text-base py-2 sm:py-3"
                  onClick={handleCancelClick}
                >
                  Cancelar Reserva
                </Button>
              )}
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 text-sm sm:text-base py-2 sm:py-3"
                onClick={() => {
                  onClose()
                  router.push(`/map?spot=${reservation.spots[0]?.id}`)
                }}
              >
                Ver no Mapa
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmCancelModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleCancelReservation}
        isCancelling={isCancelling}
      />
    </>
  )
} 