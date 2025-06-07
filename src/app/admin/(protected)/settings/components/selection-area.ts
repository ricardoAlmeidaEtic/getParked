import L from 'leaflet';

export class AdminSelectionArea {
  private map: L.Map | null;
  private userPosition: L.LatLng;
  private selectionCircle: L.Circle | null = null;
  private readonly MAX_RADIUS = 50000; // 50km - removed 200m limitation for admin

  constructor(map: L.Map | null, userPosition: L.LatLng) {
    this.map = map;
    this.userPosition = userPosition;
    console.log('AdminSelectionArea created at:', userPosition.lat, userPosition.lng);
  }

  public getUserPosition(): L.LatLng {
    return this.userPosition;
  }

  public show(): void {
    if (!this.map || typeof window === 'undefined') return;
    
    // For admin use, we don't show any selection circle since there are no limitations
    console.log('AdminSelectionArea: No circle shown for admin (unlimited range)');
    
    // Remove any existing circle
    this.hide();
  }

  public hide(): void {
    if (this.selectionCircle) {
      try {
        // Check if circle has a map reference before removing
        if ((this.selectionCircle as any)._map || this.map) {
          this.selectionCircle.remove();
        }
      } catch (error) {
        console.warn('Error removing selection circle:', error);
      } finally {
        this.selectionCircle = null;
      }
    }
  }

  public isWithinRadius(position: L.LatLng): boolean {
    if (typeof window === 'undefined') return false;
    const distance = this.userPosition.distanceTo(position);
    console.log('Distance check:', distance, 'meters from user position');
    return distance <= this.MAX_RADIUS; // Should always be true now with 50km limit
  }
} 