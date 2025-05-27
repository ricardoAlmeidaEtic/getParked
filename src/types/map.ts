export interface MapMarker {
  id: string
  latitude: number
  longitude: number
  name: string
  type: 'public' | 'private'
}

export interface PublicSpotMarker extends MapMarker {
  type: 'public'
  total_spots: number
  available_spots: number
}

export interface PrivateParkingMarker extends MapMarker {
  type: 'private'
  price_per_hour: number
  is_open: boolean
} 