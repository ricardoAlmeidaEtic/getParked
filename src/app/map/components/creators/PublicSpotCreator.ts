import L from 'leaflet'
import { SelectionArea } from '@/app/map/components/utils'
import { showToast } from '@/lib/toast'

export class PublicSpotCreator {
  private map: L.Map
  private marker: L.Marker | null = null
  private selectionArea: SelectionArea
  private onPositionChange: ((position: L.LatLng | null) => void) | null = null

  constructor(map: L.Map, userPosition: L.LatLng) {
    this.map = map
    this.selectionArea = new SelectionArea(map, userPosition)
  }

  public startCreation(onPositionChange: (position: L.LatLng | null) => void): void {
    this.onPositionChange = onPositionChange
    this.selectionArea.show()

    // Garante que o zoom inicial seja aplicado
    this.map.setView(this.selectionArea.getUserPosition(), 18, {
      animate: true,
      duration: 0.5
    })

    // Cria o marcador inicial na posição do usuário
    const userPosition = this.selectionArea.getUserPosition()
    this.createOrUpdateMarker(userPosition)

    this.map.on('click', this.handleMapClick)
  }

  public stopCreation(): void {
    this.map.off('click', this.handleMapClick)
    this.selectionArea.hide()
    if (this.marker) {
      this.marker.remove()
      this.marker = null
    }
    if (this.onPositionChange) {
      this.onPositionChange(null)
    }
  }

  private createMarkerIcon(): L.DivIcon {
    return L.divIcon({
      className: 'custom-marker public-spot',
      html: `
        <div class="w-6 h-6 bg-yellow-400 rounded-full border-2 border-yellow-600 flex items-center justify-center text-xs font-bold">
          P
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })
  }

  private createOrUpdateMarker(position: L.LatLng): void {
    if (this.marker) {
      this.marker.setLatLng(position)
    } else {
      this.marker = L.marker(position, {
        draggable: true,
        icon: this.createMarkerIcon()
      }).addTo(this.map)

      this.marker.on('dragend', () => {
        const newPosition = this.marker?.getLatLng()
        if (newPosition && this.onPositionChange) {
          if (this.selectionArea.isWithinRadius(newPosition)) {
            this.onPositionChange(newPosition)
          } else {
            showToast.error('A vaga deve estar dentro de 1km da sua localização atual')
            this.marker?.setLatLng(position) // Volta para a posição anterior
          }
        }
      })
    }

    if (this.onPositionChange) {
      this.onPositionChange(position)
    }
  }

  private handleMapClick = (e: L.LeafletMouseEvent): void => {
    const position = e.latlng

    if (!this.selectionArea.isWithinRadius(position)) {
      showToast.error('A vaga deve estar dentro de 1km da sua localização atual')
      return
    }

    // Mantém o zoom atual ao clicar
    this.map.setView(position, this.map.getZoom(), {
      animate: true,
      duration: 0.2
    })

    this.createOrUpdateMarker(position)
  }

  public getCurrentPosition(): L.LatLng | null {
    return this.marker?.getLatLng() || null
  }
} 