export interface Spot {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  available: boolean
  price_per_hour: number
  created_at: string
  updated_at: string
  owner_id: string
} 