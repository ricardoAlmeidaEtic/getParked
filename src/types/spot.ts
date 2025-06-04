export interface Spot {
  id: string
  user_id: string
  latitude: number
  longitude: number
  type: 'public' | 'private'
  total_spots: number
  available_spots: number
  status: 'active' | 'inactive'
  name: string
  created_at: string
  updated_at: string
  expires_at: string
} 