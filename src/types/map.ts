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
  parking_id: string
  parking_name: string
  latitude: number
  longitude: number
  available_spots: number
  total_spots: number
  price_per_hour: number
  is_open: boolean
  opening_time?: string
  closing_time?: string
  phone?: string
}

export interface RouteInfo {
  duration: number // em minutos
  distance: number // em quilômetros
  waypoints: [number, number][] // array de [latitude, longitude]
}

export interface RouteInstruction {
  distance: number
  time: number
  text: string
  type: string
  coordinates: [number, number] | null
} 