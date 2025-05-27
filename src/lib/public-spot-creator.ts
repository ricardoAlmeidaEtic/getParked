import L from 'leaflet'
import { createPublicSpotMarker } from './map-utils'

export class PublicSpotCreator {
  private map: L.Map
  private marker: L.Marker | null = null
  private isCreating: boolean = false
  private userPosition: L.LatLng | null = null
  private readonly MAX_DISTANCE = 1000 // 1km em metros
  private onMarkerDragEnd: ((position: L.LatLng) => void) | null = null

  constructor(map: L.Map, userPosition: L.LatLng) {
    this.map = map
    this.userPosition = userPosition
  }

  public startCreation(onMarkerDragEnd?: (position: L.LatLng) => void): void {
    if (this.isCreating) return
    this.isCreating = true
    this.onMarkerDragEnd = onMarkerDragEnd || null

    // Adiciona evento de clique no mapa
    this.map.on('click', this.handleMapClick)
    
    // Muda o cursor do mapa para indicar que está em modo de criação
    this.map.getContainer().style.cursor = 'crosshair'
  }

  public stopCreation(): void {
    if (!this.isCreating) return
    this.isCreating = false
    this.onMarkerDragEnd = null

    // Remove evento de clique
    this.map.off('click', this.handleMapClick)
    
    // Remove o marcador se existir
    if (this.marker) {
      this.marker.remove()
      this.marker = null
    }

    // Restaura o cursor padrão
    this.map.getContainer().style.cursor = ''
  }

  private handleMapClick = (e: L.LeafletMouseEvent) => {
    if (!this.userPosition) return

    const clickPosition = e.latlng
    const distance = this.userPosition.distanceTo(clickPosition)

    // Verifica se o clique está dentro do raio permitido
    if (distance > this.MAX_DISTANCE) {
      return
    }

    // Remove o marcador anterior se existir
    if (this.marker) {
      this.marker.remove()
    }

    // Cria um novo marcador temporário
    this.marker = L.marker(clickPosition, {
      draggable: true,
      autoPan: true
    }).addTo(this.map)

    // Adiciona eventos de drag
    this.marker.on('dragstart', () => {
      this.map.getContainer().style.cursor = 'grabbing'
    })

    this.marker.on('drag', () => {
      if (this.onMarkerDragEnd && this.marker) {
        this.onMarkerDragEnd(this.marker.getLatLng())
      }
    })

    this.marker.on('dragend', () => {
      this.map.getContainer().style.cursor = 'crosshair'
      if (this.onMarkerDragEnd && this.marker) {
        this.onMarkerDragEnd(this.marker.getLatLng())
      }
    })

    // Centraliza o mapa no marcador
    this.map.setView(clickPosition)
  }

  public getCurrentPosition(): L.LatLng | null {
    return this.marker?.getLatLng() || null
  }
} 