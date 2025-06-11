import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin, Car, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface ReservationCardProps {
  reservation: {
    id: string
    start_time: string
    end_time: string
    total_price: number | null
    status: string
    spots: {
      id: string
      number: string
      parkings: {
        name: string
        address: string
      }
    }[]
  }
}

export function ReservationCard({ reservation }: ReservationCardProps) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500 text-white'
      case 'pending':
        return 'bg-yellow-500 text-white'
      case 'cancelled':
        return 'bg-red-500 text-white'
      default:
        return 'bg-gray-500 text-white'
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

  const getTimeRemaining = () => {
    const now = new Date()
    const end = new Date(reservation.end_time)
    
    if (now > end) return null
    
    const diff = end.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m restantes`
    }
    return `${minutes}m restantes`
  }

  const timeRemaining = getTimeRemaining()

  return (
    <div className="group bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-primary/30">
      <div className="flex items-center justify-between mb-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <h2 className="text-xl font-semibold truncate max-w-[200px] text-gray-900">
                {reservation.spots[0]?.parkings?.name}
              </h2>
            </TooltipTrigger>
            <TooltipContent>
              <p>{reservation.spots[0]?.parkings?.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <span className={cn(
          "px-3 py-1 rounded-full text-xs font-medium shadow-sm",
          getStatusColor(reservation.status)
        )}>
          {getStatusText(reservation.status)}
        </span>
      </div>
      
      <div className="space-y-3 mb-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <MapPin className="h-4 w-4 flex-shrink-0 text-gray-500" />
                <span className="truncate">{reservation.spots[0]?.parkings?.address}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{reservation.spots[0]?.parkings?.address}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Car className="h-4 w-4 flex-shrink-0 text-gray-500" />
          <span>Vaga {reservation.spots[0]?.number}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Calendar className="h-4 w-4 flex-shrink-0 text-gray-500" />
          <span>{formatDateTime(reservation.start_time).split(' ')[0]}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Clock className="h-4 w-4 flex-shrink-0 text-gray-500" />
          <span>
            {formatDateTime(reservation.start_time).split(' ')[1]} - {formatDateTime(reservation.end_time).split(' ')[1]}
          </span>
        </div>

        {timeRemaining && reservation.status === 'confirmed' && (
          <div className="mt-2 text-sm font-medium text-primary-600">
            {timeRemaining}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">Valor Total</span>
          <span className="text-lg font-semibold text-primary-600">
            R$ {reservation.total_price?.toFixed(2) || '0.00'}
          </span>
        </div>
        <Button 
          variant="outline" 
          onClick={() => router.push(`/map?spot=${reservation.spots[0]?.id}`)}
          className="group-hover:bg-primary group-hover:text-white transition-colors border-gray-200 hover:border-primary"
        >
          <span className="mr-2">Ver Detalhes</span>
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
} 