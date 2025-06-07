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
      <div style="width: 24px; height: 24px; background-color: #ef4444; border-radius: 50%; border: 2px solid #b91c1c; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; color: white;">
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
  const markers = useRef<L.Marker[]>([])

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Initialize map with initial position if available
    const initialCenter = initialPosition 
      ? (initialPosition instanceof L.LatLng ? initialPosition : L.latLng(initialPosition.lat, initialPosition.lng))
      : L.latLng(0, 0)
      
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      minZoom: 15,
      maxZoom: 19,
      zoomSnap: 0.5,
      zoomDelta: 0.5,
      wheelDebounceTime: 40,
      preferCanvas: true
    }).setView(initialCenter, 16)
    mapRef.current = map

    // Adiciona o tile layer do OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      tileSize: 256,
      zoomOffset: 0,
      detectRetina: true
    }).addTo(map)

    // Adiciona controles de zoom
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map)

    // Função para adicionar a localização do usuário
    const addUserLocation = (position: GeolocationPosition) => {
      if (!mapRef.current || userLocationDetected.current) return

      const { latitude, longitude } = position.coords
      const userLatLng = L.latLng(latitude, longitude)
      
      console.log('ADMIN: User location detected at:', latitude, longitude)
      userLocationDetected.current = true
      onUserPositionChange(userLatLng)

      mapRef.current.setView(userLatLng, 16)
      
      const accuracy = position.coords.accuracy
      const circle = L.circleMarker(userLatLng, {
        radius: 15,
        color: '#3B82F6',
        fillColor: '#3B82F6',
        fillOpacity: 0.3,
        weight: 2,
      }).addTo(mapRef.current)

      userMarkerRef.current = circle

      L.circleMarker(userLatLng, {
        radius: 8,
        color: '#3B82F6',
        fillColor: '#3B82F6',
        fillOpacity: 0.8,
        weight: 2,
      }).addTo(mapRef.current)

      L.circle(userLatLng, {
        radius: accuracy,
        color: '#3B82F6',
        fillColor: '#3B82F6',
        fillOpacity: 0.1,
        weight: 1,
        dashArray: '5, 5',
      }).addTo(mapRef.current)

      circle.bindPopup(`Sua localização atual (precisão: ${Math.round(accuracy)}m)`)
    }

    // Wait for map to load completely
    map.whenReady(() => {
      if (initialPosition) {
        // If we have initial position (settings page), use it immediately
        const parkingLatLng = initialPosition instanceof L.LatLng 
          ? initialPosition 
          : L.latLng(initialPosition.lat, initialPosition.lng)
        addUserLocation({ coords: { latitude: parkingLatLng.lat, longitude: parkingLatLng.lng, accuracy: 10 } } as GeolocationPosition)
        
        // Also create a marker at the initial position
        const initialMarker = L.marker(parkingLatLng, {
          draggable: true,
          icon: createParkingIcon()
        }).addTo(map)
        
        markers.current.push(initialMarker)
        
        // Update the marker position callback with initial position
        console.log('ADMIN: Setting initial marker position:', parkingLatLng)
        onMarkerPositionChange(parkingLatLng)
        
        // Make the marker draggable and update position on drag
        initialMarker.on('dragend', (e) => {
          const newPosition = e.target.getLatLng()
          console.log('ADMIN: Marker dragged to:', newPosition)
          onMarkerPositionChange(newPosition)
        })
      } else if (navigator.geolocation && !userLocationDetected.current) {
        // Otherwise get user location (register page)
        navigator.geolocation.getCurrentPosition(
          addUserLocation,
          (error) => {
            console.error('ADMIN: Erro ao obter localização:', error)
          }
        )
      }
    })

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
      }
      userLocationDetected.current = false
    }
  }, []) // Remove onUserPositionChange dependency to prevent loop

  // Efeito para gerenciar o modo de criação de spots
  useEffect(() => {
    if (!mapRef.current || !userMarkerRef.current) return

    if (isCreatingSpot) {
      // Only start creation if not already started
      if (!creatorRef.current) {
        const userPosition = userMarkerRef.current.getLatLng()
        console.log('ADMIN: Starting creation mode at user position:', userPosition.lat, userPosition.lng)
        
        creatorRef.current = new AdminSpotCreator(mapRef.current, userPosition)
        
        creatorRef.current.startCreation((position) => {
          if (position) {
            console.log('ADMIN: Marker position changed to:', position.lat, position.lng)
            console.log('ADMIN: About to call onMarkerPositionChange with:', position)
            onMarkerPositionChange(position)
            console.log('ADMIN: Called onMarkerPositionChange')
          }
        }, false) // Not editing, creating new
      }
    } else {
      if (creatorRef.current) {
        console.log('ADMIN: Stopping creation mode')
        creatorRef.current.stopCreation()
        creatorRef.current = null
      }
      onMarkerPositionChange(null)
    }
  }, [isCreatingSpot, onMarkerPositionChange])

  return (
    <div 
      ref={mapContainerRef} 
      className="absolute inset-0 w-full h-full z-0"
    />
  )
} 