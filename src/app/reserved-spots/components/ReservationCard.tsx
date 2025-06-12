import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin, Car, ExternalLink, CreditCard, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useState, useEffect } from 'react'
import { ReservationDetailsModal } from '../modals/ReservationDetailsModal'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useSupabase } from "@/providers/SupabaseProvider"
import { showToast } from "@/lib/toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"

interface ReservationCardProps {
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
  onReservationDeleted?: () => void
}

export function ReservationCard({ reservation, onReservationCancelled, onReservationDeleted }: ReservationCardProps) {
  const router = useRouter()
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [currentReservation, setCurrentReservation] = useState(reservation)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { supabase } = useSupabase()

  useEffect(() => {
    setCurrentReservation(reservation)
  }, [reservation])

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada'
      case 'cancelled':
        return 'Cancelada'
      case 'completed':
        return 'Concluída'
      default:
        return status
    }
  }

  const getTimeRemaining = () => {
    const now = new Date()
    const end = new Date(currentReservation.end_time)
    
    if (now > end) return 'Encerrada'
    
    const diff = end.getTime() - now.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    
    if (minutes < 0) return 'Encerrada'
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ${minutes % 60}m`
  }

  const timeRemaining = getTimeRemaining()

  const canDeleteReservation = () => {
    return currentReservation.status === 'cancelled' || currentReservation.status === 'completed'
  }

  const handleDeleteReservation = async () => {
    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', currentReservation.id)

      if (error) throw error

      showToast.success('Reserva excluída com sucesso!')
      onReservationDeleted?.()
      setIsDeleteModalOpen(false)
    } catch (error: any) {
      console.error('Erro ao excluir reserva:', error)
      showToast.error('Erro ao excluir reserva. Por favor, tente novamente.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Card className="w-full hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {currentReservation.spots[0]?.parkings?.name || 'Vaga'}
              </h3>
              <p className="text-sm text-gray-500">
                {currentReservation.spots[0]?.parkings?.address || 'Endereço não disponível'}
              </p>
            </div>
            <Badge className={getStatusColor(currentReservation.status)}>
              {getStatusText(currentReservation.status)}
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{formatDateTime(currentReservation.start_time).split(' ')[0]}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              <span>
                {formatDateTime(currentReservation.start_time).split(' ')[1]} - {formatDateTime(currentReservation.end_time).split(' ')[1]}
              </span>
            </div>
            <div className="flex items-center text-gray-600">
              <Car className="w-4 h-4 mr-2" />
              <span>{currentReservation.spots[0]?.number || 'Vaga'}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <CreditCard className="w-4 h-4 mr-2" />
              <span>R$ {currentReservation.total_price?.toFixed(2) || '0.00'}</span>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsDetailsModalOpen(true)}
            >
              Ver Detalhes
            </Button>
            {canDeleteReservation() && (
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <ReservationDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        reservation={currentReservation}
        onReservationCancelled={onReservationCancelled}
      />

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta reserva? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDeleteReservation}
              disabled={isDeleting}
            >
              {isDeleting ? 'Excluindo...' : 'Confirmar Exclusão'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 