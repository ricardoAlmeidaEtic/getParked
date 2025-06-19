import L from 'leaflet'
import 'leaflet-routing-machine'
import { showToast } from './toast'
import { MapMarker } from '@/types/map'

const ROUTE_ERROR_THRESHOLD = 50 // metros de desvio para considerar erro na rota
const ROUTE_UPDATE_INTERVAL = 5000 // 5 segundos

export class RouteManager {
  private map: L.Map
  private routeControl: L.Routing.Control | null = null
  private currentRoute: any | null = null
  private userMarker: L.CircleMarker | null = null
  private destinationMarker: MapMarker | null = null
  private routeUpdateInterval: NodeJS.Timeout | null = null
  private lastUserPosition: L.LatLng | null = null

  constructor(map: L.Map) {
    this.map = map
    console.log('RouteManager inicializado com mapa:', map)
  }

  public calculateRoute(
    start: L.LatLng,
    destination: MapMarker,
    userMarker: L.CircleMarker
  ): void {
    console.log('=== INÍCIO DO CÁLCULO DE ROTA ===')
    console.log('Coordenadas de início:', {
      lat: start.lat,
      lng: start.lng
    })
    console.log('Coordenadas de destino:', {
      lat: destination.latitude,
      lng: destination.longitude
    })

    if (!start || !destination) {
      console.error('Coordenadas inválidas:', { start, destination })
      showToast.error('Não foi possível calcular a rota: coordenadas inválidas')
      return
    }

    this.userMarker = userMarker
    this.destinationMarker = destination
    this.lastUserPosition = start

    // Remove rota anterior se existir
    this.clearRoute()

    try {
      console.log('Criando controle de rota...')
      
      // Cria o controle de rota com configurações otimizadas
      this.routeControl = L.Routing.control({
        waypoints: [
          L.latLng(start.lat, start.lng),
          L.latLng(destination.latitude, destination.longitude)
        ],
        routeWhileDragging: false,
        showAlternatives: false,
        lineOptions: {
          styles: [
            { color: '#3B82F6', weight: 6, opacity: 0.8 }
          ],
          extendToWaypoints: true,
          missingRouteTolerance: 0
        },
        router: L.Routing.osrmv1({
          serviceUrl: 'https://routing.openstreetmap.de/routed-car/route/v1',
          timeout: 30000
        }),
        show: false, // Esconde o painel de instruções padrão
        addWaypoints: false, // Desativa adição de waypoints
        draggableWaypoints: false // Desativa arrastar waypoints
      } as any)

      console.log('Controle de rota criado, adicionando ao mapa...')
      
      // Adiciona o controle ao mapa
      this.routeControl.addTo(this.map)

      // Adiciona evento para quando a rota for calculada
      this.routeControl.on('routesfound', (e: any) => {
        console.log('=== ROTA ENCONTRADA ===')
        console.log('Detalhes da rota:', e)
        
        const routes = e.routes
        if (routes && routes.length > 0) {
          this.currentRoute = routes[0]
          
          console.log('Resumo da rota:', {
            distância: `${(routes[0].summary.totalDistance / 1000).toFixed(1)}km`,
            tempo: `${Math.round(routes[0].summary.totalTime / 60)}min`,
            instruções: routes[0].instructions?.length || 0
          })
          
          // Ajusta o zoom para mostrar toda a rota
          const bounds = L.latLngBounds(routes[0].coordinates)
          this.map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 16
          })

          // Mostra informações da rota
          const distance = (routes[0].summary.totalDistance / 1000).toFixed(1)
          const duration = Math.round(routes[0].summary.totalTime / 60)
          
          // Cria um popup com as informações da rota
          const popup = L.popup()
            .setLatLng(start)
            .setContent(`
              <div class="p-2">
                <h3 class="font-bold mb-2">Rota Calculada</h3>
                <p>Distância: ${distance}km</p>
                <p>Tempo estimado: ${duration}min</p>
                <p class="text-sm text-gray-500 mt-2">Siga as instruções no mapa</p>
              </div>
            `)
            .openOn(this.map)

          showToast.info(`Distância: ${distance}km • Tempo estimado: ${duration}min`)
        } else {
          console.error('Nenhuma rota encontrada')
          showToast.error('Não foi possível encontrar uma rota válida')
        }
      })

      // Adiciona evento para erros
      this.routeControl.on('routingerror', (e: any) => {
        console.error('=== ERRO NO CÁLCULO DA ROTA ===')
        console.error('Detalhes do erro:', e)
        showToast.error('Não foi possível calcular a rota. Tente novamente em alguns instantes.')
      })

      console.log('Eventos de rota configurados com sucesso')

    } catch (error) {
      console.error('=== ERRO AO INICIALIZAR ROTA ===')
      console.error('Detalhes do erro:', error)
      showToast.error('Erro ao calcular rota. Tente novamente em alguns instantes.')
    }

    // Inicia monitoramento da posição
    this.startRouteMonitoring()
  }

  private startRouteMonitoring() {
    console.log('Iniciando monitoramento de rota...')
    
    this.routeUpdateInterval = setInterval(() => {
      if (!this.userMarker || !this.destinationMarker || !this.lastUserPosition) {
        console.log('Monitoramento de rota: componentes necessários não inicializados')
        return
      }

      const currentPosition = this.userMarker.getLatLng()
      const distanceFromRoute = this.calculateDistanceFromRoute(currentPosition)

      console.log('Monitoramento de rota:', {
        distânciaAtual: distanceFromRoute.toFixed(2) + 'm',
        limite: ROUTE_ERROR_THRESHOLD + 'm'
      })

      if (distanceFromRoute > ROUTE_ERROR_THRESHOLD) {
        console.log('Usuário desviou da rota, recalculando...')
        // Recalcula rota se o usuário estiver muito desviado
        this.calculateRoute(currentPosition, this.destinationMarker, this.userMarker)
      }
    }, ROUTE_UPDATE_INTERVAL)
  }

  private calculateDistanceFromRoute(currentPosition: L.LatLng): number {
    if (!this.currentRoute) return 0

    const route = this.currentRoute.coordinates
    if (!route) return 0

    // Encontra o ponto mais próximo na rota
    let minDistance = Infinity
    route.forEach((waypoint: L.LatLng) => {
      const distance = currentPosition.distanceTo(waypoint)
      minDistance = Math.min(minDistance, distance)
    })

    return minDistance
  }

  public clearRoute(): void {
    console.log('Limpando rota atual...')
    
    if (this.routeControl) {
      this.map.removeControl(this.routeControl)
      this.routeControl = null
      this.currentRoute = null
    }

    if (this.routeUpdateInterval) {
      clearInterval(this.routeUpdateInterval)
      this.routeUpdateInterval = null
    }

    this.lastUserPosition = null
    console.log('Rota limpa com sucesso')
  }
} 