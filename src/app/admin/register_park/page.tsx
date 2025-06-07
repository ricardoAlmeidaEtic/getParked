'use client';

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAdminSupabase } from '@/providers/AdminSupabaseProvider'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import L from 'leaflet'

// Use custom AdminMapComponent with no limitations
const AdminMapComponent = dynamic(() => import('./components/AdminMapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] flex items-center justify-center bg-gray-100">
      <div className="text-gray-600">Loading map...</div>
    </div>
  )
})

type ParkingFormData = {
  name: string
  address: string
  latitude: number
  longitude: number
  hourly_rate: number
  available_spots: number
  opening_time: string
  closing_time: string
  phone: string
}

export default function RegisterParkPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAdminSupabase()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isCreatingSpot, setIsCreatingSpot] = useState(true) // Always in creation mode for admin
  const [userPosition, setUserPosition] = useState<L.LatLng | null>(null)
  const [formData, setFormData] = useState<ParkingFormData>({
    name: '',
    address: '',
    latitude: 0,
    longitude: 0,
    hourly_rate: 0,
    available_spots: 1,
    opening_time: '08:00',
    closing_time: '22:00',
    phone: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle marker position changes from MapComponent
  const handleMarkerPositionChange = (position: L.LatLng | null) => {
    if (position) {
      setFormData(prev => ({
        ...prev,
        latitude: position.lat,
        longitude: position.lng
      }))
    }
  }

  // Dummy handlers to satisfy MapComponent interface
  const handleMarkerCreated = () => {
    // Do nothing for admin use case
  }

  const handleUserPositionChange = (position: L.LatLng) => {
    setUserPosition(position)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🚀 Form submit started');
    e.preventDefault()
    setError('')
    setLoading(true)

    console.log('📝 Form data:', formData);
    console.log('👤 User:', user);
    console.log('⏳ Auth loading:', authLoading);

    if (authLoading) {
      console.log('❌ Auth still loading');
      setError('Please wait while authentication loads...')
      setLoading(false)
      return
    }

    if (formData.latitude === 0 && formData.longitude === 0) {
      console.log('❌ No location selected');
      setError('Please select a location on the map')
      setLoading(false)
      return
    }

    try {
      if (!user) {
        console.log('❌ User not authenticated');
        throw new Error('User not authenticated')
      }

      console.log('✅ Starting database operations...');

      // First insert into parkings table
      console.log('💾 Inserting parking data...');
      const { data: parkingData, error: insertError } = await supabase
        .from('parkings')
        .insert({
          name: formData.name,
          address: formData.address,
          latitude: formData.latitude,
          longitude: formData.longitude,
          hourly_rate: formData.hourly_rate,
          owner_id: user.id, // Set the current admin user as owner
          is_public: false // Always false for private parking admin form
        })
        .select()
        .single()

      if (insertError) {
        console.error('❌ Parking insert error:', insertError);
        throw insertError;
      }

      console.log('✅ Parking created:', parkingData);

      // Then insert into private_parking_markers table
      if (parkingData) {
        console.log('💾 Inserting marker data...');
        const { error: markerError } = await supabase
          .from('private_parking_markers')
          .insert({
            parking_id: parkingData.id,
            parking_name: formData.name,
            latitude: formData.latitude,
            longitude: formData.longitude,
            available_spots: formData.available_spots,
            opening_time: formData.opening_time,
            closing_time: formData.closing_time,
            phone: formData.phone
          })

        if (markerError) {
          console.error('❌ Marker insert error:', markerError);
          throw markerError;
        }

        console.log('✅ Marker created successfully');
      }

      console.log('🎉 Success! Redirecting to dashboard...');
      router.push('/admin/dashboard')
    } catch (err: any) {
      console.error('❌ Error creating parking:', err)
      setError(err.message || 'An error occurred while creating the parking')
    } finally {
      console.log('🔄 Setting loading to false');
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Register a new parking
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Location
            </label>
            <div className="mt-2">
              <div className="h-[400px] rounded-md overflow-hidden border border-gray-300">
                <AdminMapComponent 
                  isCreatingSpot={isCreatingSpot}
                  onMarkerPositionChange={handleMarkerPositionChange}
                  onMarkerCreated={handleMarkerCreated}
                  onUserPositionChange={handleUserPositionChange}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Click on the map to select the parking location
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
              Parking Name
            </label>
            <div className="mt-2">
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium leading-6 text-gray-900">
              Address
            </label>
            <div className="mt-2">
              <textarea
                id="address"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Enter the parking address"
              />
            </div>
          </div>

          <div>
            <label htmlFor="hourly_rate" className="block text-sm font-medium leading-6 text-gray-900">
              Hourly Rate (€)
            </label>
            <div className="mt-2">
              <input
                id="hourly_rate"
                name="hourly_rate"
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.hourly_rate}
                onChange={handleChange}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label htmlFor="available_spots" className="block text-sm font-medium leading-6 text-gray-900">
              Available Spots
            </label>
            <div className="mt-2">
              <input
                id="available_spots"
                name="available_spots"
                type="number"
                min="1"
                required
                value={formData.available_spots}
                onChange={handleChange}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="opening_time" className="block text-sm font-medium leading-6 text-gray-900">
                Opening Time
              </label>
              <div className="mt-2">
                <input
                  id="opening_time"
                  name="opening_time"
                  type="time"
                  required
                  value={formData.opening_time}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label htmlFor="closing_time" className="block text-sm font-medium leading-6 text-gray-900">
                Closing Time
              </label>
              <div className="mt-2">
                <input
                  id="closing_time"
                  name="closing_time"
                  type="time"
                  required
                  value={formData.closing_time}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium leading-6 text-gray-900">
              Phone Number
            </label>
            <div className="mt-2">
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="+351 123 456 789"
              />
            </div>
          </div>

          {/* Note: This form is for private parking only (is_public = false) */}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:bg-primary/50"
            >
              {loading ? 'Creating...' : 'Create Parking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 