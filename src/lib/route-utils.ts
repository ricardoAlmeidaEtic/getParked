import L from 'leaflet'
import { MapMarker } from '@/types/map'

const ROUTE_ERROR_THRESHOLD = 50 // metros de desvio para considerar erro na rota
const ROUTE_UPDATE_INTERVAL = 5000 // 5 segundos

export class RouteManager {
  private map: L.Map
  private currentRoute: L.Routing.Control | null = null
  private userMarker: L.CircleMarker | null = null
  private destinationMarker: MapMarker | null = null
  private routeUpdateInterval: NodeJS.Timeout | null = null
  private lastUserPosition: L.LatLng | null = null

  constructor(map: L.Map) {
    this.map = map
  }

  public async calculateRoute(
    userPosition: L.LatLng,
    destination: MapMarker,
    userMarker: L.CircleMarker
  ) {
    this.userMarker = userMarker
    this.destinationMarker = destination
    this.lastUserPosition = userPosition

    // Remove rota anterior se existir
    this.clearRoute()

    // Cria nova rota
    this.currentRoute = L.Routing.control({
      waypoints: [
        userPosition,
        L.latLng(destination.latitude, destination.longitude)
      ],
      routeWhileDragging: true,
      show: false,
      lineOptions: {
        styles: [
          { color: '#3B82F6', weight: 4, opacity: 0.7 }
        ]
      },
      createMarker: () => null // Não cria marcadores adicionais
    }).addTo(this.map)

    // Adiciona informações de tempo e distância
    this.currentRoute.on('routesfound', (e) => {
      const route = e.routes[0]
      const duration = Math.round(route.summary.totalTime / 60) // minutos
      const distance = Math.round(route.summary.totalDistance / 1000) // km

      const popup = L.popup()
        .setLatLng(userPosition)
        .setContent(`
          <div class="p-2">
            <h3 class="font-bold">Rota para ${destination.name}</h3>
            <p>Tempo estimado: ${duration} minutos</p>
            <p>Distância: ${distance} km</p>
          </div>
        `)
        .openOn(this.map)
    })

    // Inicia monitoramento da posição
    this.startRouteMonitoring()
  }

  private startRouteMonitoring() {
    this.routeUpdateInterval = setInterval(() => {
      if (!this.userMarker || !this.destinationMarker || !this.lastUserPosition) return

      const currentPosition = this.userMarker.getLatLng()
      const distanceFromRoute = this.calculateDistanceFromRoute(currentPosition)

      if (distanceFromRoute > ROUTE_ERROR_THRESHOLD) {
        // Recalcula rota se o usuário estiver muito desviado
        this.calculateRoute(currentPosition, this.destinationMarker, this.userMarker)
      }
    }, ROUTE_UPDATE_INTERVAL)
  }

  private calculateDistanceFromRoute(currentPosition: L.LatLng): number {
    if (!this.currentRoute) return 0

    const route = this.currentRoute.getPlan()
    if (!route) return 0

    // Encontra o ponto mais próximo na rota
    let minDistance = Infinity
    route.getWaypoints().forEach(waypoint => {
      const distance = currentPosition.distanceTo(waypoint.latLng)
      minDistance = Math.min(minDistance, distance)
    })

    return minDistance
  }

  public clearRoute() {
    if (this.currentRoute) {
      this.map.removeControl(this.currentRoute)
      this.currentRoute = null
    }

    if (this.routeUpdateInterval) {
      clearInterval(this.routeUpdateInterval)
      this.routeUpdateInterval = null
    }

    this.lastUserPosition = null
  }
} 