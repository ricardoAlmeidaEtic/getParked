'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '@/app/map/map-styles.css'
import { AdminSpotCreator } from './admin-spot-creator'

interface AdminMapComponentProps {
  isCreatingSpot: boolean
  onMarkerPositionChange: (position: L.LatLng | null) => void
  onMarkerCreated: () => void
  onUserPositionChange: (position: L.LatLng) => void
  initialPosition?: { lat: number; lng: number } | L.LatLng
}

// Create parking marker icon (same as in admin-spot-creator)
const createParkingIcon = () => {
  return L.divIcon({
    className: 'custom-marker public-spot',
    html: `
      <div style="width: 24px; height: 24px; background-color: #ef4444; border-radius: 50%; border: 2px solid #b91c1c; display: flex; align-items: center; justify-center; font-size: 12px; font-weight: bold; color: white;">
        P
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

export default function AdminMapComponent({
  isCreatingSpot,
  onMarkerPositionChange,
  onMarkerCreated,
  onUserPositionChange,
  initialPosition
}: AdminMapComponentProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const userMarkerRef = useRef<L.CircleMarker | null>(null)
  const creatorRef = useRef<AdminSpotCreator | null>(null)
  const userLocationDetected = useRef<boolean>(false)

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Initialize map with initial position if available
    const initialCenter = initialPosition 
      ? (initialPosition instanceof L.LatLng ? initialPosition : L.latLng(initialPosition.lat, initialPosition.lng))
      : L.latLng(0, 0)
      
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      minZoom: 0,
      maxZoom: 19,
      zoomSnap: 0.5,
      zoomDelta: 0.5,
      wheelDebounceTime: 40,
      preferCanvas: true
    }).setView(initialCenter, 16)
    mapRef.current = map

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      tileSize: 256,
      zoomOffset: 0,
      detectRetina: true
    }).addTo(map)

    // Add zoom controls
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map)

    // Create location pane with lower z-index
    const locationPane = map.createPane('locationPane')
    if (locationPane) {
      locationPane.style.zIndex = '400' // Below markers (600)
    }

    // Wait for map to load completely
    map.whenReady(() => {
      if (initialPosition) {
        // If we have initial position (settings page), use it immediately
        const parkingLatLng = initialPosition instanceof L.LatLng 
          ? initialPosition 
          : L.latLng(initialPosition.lat, initialPosition.lng)

        // First create the orange marker
        creatorRef.current = new AdminSpotCreator(map, parkingLatLng)
        creatorRef.current.startCreation((position) => {
          if (position) {
            console.log('ADMIN: Setting initial marker position:', position)
            onMarkerPositionChange(position)
          }
        }, false) // Set to false to ensure marker is created

        // Then add the blue location markers
        userLocationDetected.current = true
        onUserPositionChange(parkingLatLng)
        
        // Create blue circle marker for location
        const circle = L.circleMarker(parkingLatLng, {
          radius: 15,
          color: '#3B82F6',
          fillColor: '#3B82F6',
          fillOpacity: 0.3,
          weight: 2,
          pane: 'locationPane'
        }).addTo(map)

        userMarkerRef.current = circle

        // Add center point
        L.circleMarker(parkingLatLng, {
          radius: 8,
          color: '#3B82F6',
          fillColor: '#3B82F6',
          fillOpacity: 0.8,
          weight: 2,
          pane: 'locationPane'
        }).addTo(map)

        // Add accuracy circle
        L.circle(parkingLatLng, {
          radius: 10, // Fixed small radius for settings page
          color: '#3B82F6',
          fillColor: '#3B82F6',
          fillOpacity: 0.1,
          weight: 1,
          dashArray: '5, 5',
          pane: 'locationPane'
        }).addTo(map)

        circle.bindPopup('Localização atual do estacionamento')
      }
    })

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
      }
      if (creatorRef.current) {
        creatorRef.current.stopCreation()
      }
      userLocationDetected.current = false
    }
  }, [])

  // Effect to manage spot creation mode
  useEffect(() => {
    if (!mapRef.current) return

    if (isCreatingSpot && !creatorRef.current && initialPosition) {
      const parkingLatLng = initialPosition instanceof L.LatLng 
        ? initialPosition 
        : L.latLng(initialPosition.lat, initialPosition.lng)
      
      creatorRef.current = new AdminSpotCreator(mapRef.current, parkingLatLng)
      creatorRef.current.startCreation((position) => {
        if (position) {
          console.log('ADMIN: Marker position changed to:', position)
          onMarkerPositionChange(position)
        }
      }, false) // Set to false to ensure marker is created
    } else if (!isCreatingSpot && creatorRef.current) {
      creatorRef.current.stopCreation()
      creatorRef.current = null
      onMarkerPositionChange(null)
    }
  }, [isCreatingSpot])

  return (
    <div 
      ref={mapContainerRef} 
      className="absolute inset-0 w-full h-full z-0"
    />
  )
} 