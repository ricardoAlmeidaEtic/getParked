import L from 'leaflet'
import { createPublicSpotMarker } from './map-utils'
import { showToast } from '@/lib/toast'

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
    console.log('PublicSpotCreator - Iniciando criação de spot')
    this.isCreating = true
    this.onMarkerDragEnd = onMarkerDragEnd || null

    // Adiciona evento de clique no mapa
    this.map.on('click', this.handleMapClick)
    
    // Muda o cursor do mapa para indicar que está em modo de criação
    this.map.getContainer().style.cursor = 'crosshair'
  }

  public stopCreation(): void {
    if (!this.isCreating) return
    console.log('PublicSpotCreator - Parando criação de spot')
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

    console.log('PublicSpotCreator - Clique no mapa:', {
      clickPosition,
      distance,
      maxDistance: this.MAX_DISTANCE
    })

    // Verifica se o clique está dentro do raio permitido
    if (distance > this.MAX_DISTANCE) {
      showToast.error('A vaga deve estar dentro de 1km da sua localização')
      return
    }

    // Remove o marcador anterior se existir
    if (this.marker) {
      this.marker.remove()
    }

    // Cria um ícone amarelo personalizado
    const icon = L.divIcon({
      className: 'custom-marker public-spot',
      html: `
        <div style="
          width: 24px;
          height: 24px;
          background-color: #FBBF24;
          border: 2px solid #D97706;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          color: #92400E;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">
          P
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })

    console.log('PublicSpotCreator - Criando novo marcador')

    // Cria um novo marcador temporário com o ícone amarelo
    this.marker = L.marker(clickPosition, {
      draggable: true,
      autoPan: true,
      icon
    }).addTo(this.map)

    console.log('PublicSpotCreator - Marcador criado, notificando posição:', clickPosition)
    if (this.onMarkerDragEnd) {
      this.onMarkerDragEnd(clickPosition)
    }

    // Adiciona eventos de drag
    this.marker.on('dragstart', () => {
      console.log('PublicSpotCreator - Iniciando arrasto do marcador')
      this.map.getContainer().style.cursor = 'grabbing'
    })

    this.marker.on('drag', () => {
      if (this.onMarkerDragEnd && this.marker) {
        const newPosition = this.marker.getLatLng()
        const distance = this.userPosition!.distanceTo(newPosition)
        
        if (distance > this.MAX_DISTANCE) {
          this.marker.setLatLng(this.marker.getLatLng())
          showToast.error('A vaga deve estar dentro de 1km da sua localização')
          return
        }
        
        this.onMarkerDragEnd(newPosition)
      }
    })

    this.marker.on('dragend', () => {
      console.log('PublicSpotCreator - Finalizando arrasto do marcador')
      this.map.getContainer().style.cursor = 'crosshair'
      if (this.onMarkerDragEnd && this.marker) {
        const newPosition = this.marker.getLatLng()
        const distance = this.userPosition!.distanceTo(newPosition)
        
        if (distance > this.MAX_DISTANCE) {
          this.marker.setLatLng(this.marker.getLatLng())
          showToast.error('A vaga deve estar dentro de 1km da sua localização')
          return
        }
        
        this.onMarkerDragEnd(newPosition)
      }
    })

    // Centraliza o mapa no marcador
    this.map.setView(clickPosition)
  }

  public getCurrentPosition(): L.LatLng | null {
    return this.marker?.getLatLng() || null
  }
} 