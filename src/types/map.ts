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
  expires_at: string
  status: string
  price_per_hour: number
  address: string
}

export interface PrivateParkingMarker extends MapMarker {
  type: 'private'
  parking_id: string
  parking_name: string
  available_spots: number
  opening_time: string | null
  closing_time: string | null
  phone: string | null
  created_at: string
}

export interface RouteInfo {
  duration: number // em minutos
  distance: number // em quilômetros
  waypoints: [number, number][] // array de [latitude, longitude]
} 