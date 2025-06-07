import L from 'leaflet'
import { AdminSelectionArea } from './selection-area'

export class AdminSpotCreator {
  private map: L.Map
  private marker: L.Marker | null = null
  private selectionArea: AdminSelectionArea
  private onPositionChange: ((position: L.LatLng | null) => void) | null = null
  private isEditing: boolean = false

  constructor(map: L.Map, userPosition: L.LatLng) {
    this.map = map
    this.selectionArea = new AdminSelectionArea(map, userPosition)
    console.log('AdminSpotCreator initialized at:', userPosition.lat, userPosition.lng)
  }

  public startCreation(onPositionChange: (position: L.LatLng | null) => void, isEditing: boolean = false): void {
    this.onPositionChange = onPositionChange
    this.isEditing = isEditing
    this.selectionArea.show()

    const userPosition = this.selectionArea.getUserPosition()

    // Se não estiver editando, cria o marcador na posição do usuário
    if (!isEditing) {
      this.createOrUpdateMarker(userPosition)
    }

    this.map.on('click', this.handleMapClick)
    console.log('AdminSpotCreator: Creation mode started')
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
    this.isEditing = false
    console.log('AdminSpotCreator: Creation mode stopped')
  }

  private createMarkerIcon(): L.DivIcon {
    return L.divIcon({
      className: 'custom-marker public-spot',
      html: `
        <div style="width: 24px; height: 24px; background-color: #ef4444; border-radius: 50%; border: 2px solid #b91c1c; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; color: white;">
          P
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })
  }

  private createOrUpdateMarker(position: L.LatLng): void {
    console.log('Creating/updating marker at:', position.lat, position.lng)
    
    if (this.marker) {
      this.marker.setLatLng(position)
      console.log('Marker position updated to:', position.lat, position.lng)
    } else {
      console.log('Creating new marker with icon...')
      this.marker = L.marker(position, {
        draggable: true,
        icon: this.createMarkerIcon()
      }).addTo(this.map)

      console.log('Marker added to map:', this.marker)

      this.marker.on('dragend', () => {
        const newPosition = this.marker?.getLatLng()
        if (newPosition && this.onPositionChange) {
          // No limitations for admin - allow anywhere
          console.log('ADMIN: Marker dragged to:', newPosition.lat, newPosition.lng)
          this.onPositionChange(newPosition)
        }
      })
      
      console.log('New marker created at:', position.lat, position.lng)
    }

    if (this.onPositionChange) {
      this.onPositionChange(position)
    }
  }

  private handleMapClick = (e: L.LeafletMouseEvent): void => {
    const position = e.latlng
    console.log('ADMIN: Map clicked at:', position.lat, position.lng)
    console.log('ADMIN: Creating marker...')

    // Remove all limitations for admin - allow clicking anywhere
    // Don't check isWithinRadius or show error messages
    
    // Don't center the map when clicking - just create marker
    this.createOrUpdateMarker(position)
  }

  public getCurrentPosition(): L.LatLng | null {
    const position = this.marker?.getLatLng() || null
    if (position) {
      console.log('Current marker position:', position.lat, position.lng)
    }
    return position
  }
} 