import L from 'leaflet';

export class SelectionArea {
  private map: L.Map | null;
  private userPosition: L.LatLng;
  private selectionCircle: L.Circle | null = null;
  private readonly MAX_RADIUS = 200; // 200m em metros

  constructor(map: L.Map | null, userPosition: L.LatLng) {
    this.map = map;
    this.userPosition = userPosition;
  }

  public getUserPosition(): L.LatLng {
    return this.userPosition;
  }

  public show(): void {
    if (!this.map || typeof window === 'undefined') return;
    
    // Remove o círculo existente se houver
    this.hide();

    try {
      // Cria um novo círculo de seleção
      this.selectionCircle = L.circle(this.userPosition, {
        radius: this.MAX_RADIUS,
        color: '#3B82F6',
        fillColor: '#3B82F6',
        fillOpacity: 0,
        weight: 2,
        dashArray: '5, 5',
      });

      // Adiciona o círculo ao mapa apenas se o mapa existir
      if (this.map && this.selectionCircle) {
        this.selectionCircle.addTo(this.map);
      }
    } catch (error) {
      console.error('Erro ao criar círculo de seleção:', error);
    }
  }

  public hide(): void {
    if (this.selectionCircle) {
      this.selectionCircle.remove();
      this.selectionCircle = null;
    }
  }

  public isWithinRadius(position: L.LatLng): boolean {
    if (typeof window === 'undefined') return false;
    return this.userPosition.distanceTo(position) <= this.MAX_RADIUS;
  }
} 