import L from 'leaflet'
import { SelectionArea } from './map-functions/selection-area'
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

  private handleMapClick = (e: L.LeafletMouseEvent): void => {
    const position = e.latlng

    if (!this.selectionArea.isWithinRadius(position)) {
      return
    }

    if (this.marker) {
      this.marker.setLatLng(position)
    } else {
      this.marker = L.marker(position, {
        draggable: true
      }).addTo(this.map)

      this.marker.on('dragend', () => {
        const newPosition = this.marker?.getLatLng()
        if (newPosition && this.onPositionChange) {
          this.onPositionChange(newPosition)
        }
      })
    }

    if (this.onPositionChange) {
      this.onPositionChange(position)
    }
  }

  public getCurrentPosition(): L.LatLng | null {
    return this.marker?.getLatLng() || null
  }
} 