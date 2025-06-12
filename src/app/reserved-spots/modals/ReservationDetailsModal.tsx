import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Car, CreditCard, AlertCircle, CheckCircle2, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

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
}

export function ReservationDetailsModal({ isOpen, onClose, reservation }: ReservationDetailsModalProps) {
  const router = useRouter()

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Detalhes da Reserva
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Status e ID da Reserva */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(reservation.status)}
              <span className="font-medium text-gray-900">
                {getStatusText(reservation.status)}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              ID: {reservation.id.slice(0, 8)}...
            </span>
          </div>

          {/* Informações do Estacionamento */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-900">
              {reservation.spots[0]?.parkings?.name}
            </h3>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>{reservation.spots[0]?.parkings?.address}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Car className="h-4 w-4 flex-shrink-0" />
              <span>Vaga {reservation.spots[0]?.number}</span>
            </div>
          </div>

          {/* Detalhes da Reserva */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span>Data</span>
              </div>
              <p className="font-medium text-gray-900">
                {formatDate(reservation.start_time)}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span>Horário</span>
              </div>
              <p className="font-medium text-gray-900">
                {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span>Duração</span>
              </div>
              <p className="font-medium text-gray-900">
                {calculateDuration()}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <CreditCard className="h-4 w-4 flex-shrink-0" />
                <span>Valor/Hora</span>
              </div>
              <p className="font-medium text-gray-900">
                R$ {reservation.spots[0]?.parkings?.hourly_rate.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Valor Total */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Valor Total</span>
              <span className="text-xl font-bold text-primary-600">
                R$ {reservation.total_price?.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Fechar
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90"
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
  )
} 