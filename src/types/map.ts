export interface MapMarker {
  id: string
  latitude: number
  longitude: number
  name: string
  type: 'public' | 'private'
}

export interface PublicSpotMarker {
  id: string
  user_id: string
  user_name: string
  user_email: string
  latitude: number
  longitude: number
  is_available: boolean
  is_occupied: boolean
  created_at: string
  expires_at: string
  occupied_at: string | null
  occupied_by: string | null
  credits_earned: number
  updated_at: string
  available_spots: number
  total_spots: number
  price_per_hour: number
  status: string
  name: string
  address: string
}

export interface PrivateParkingMarker {
  id: string
  parking_id: string
  parking_name: string
  latitude: number
  longitude: number
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