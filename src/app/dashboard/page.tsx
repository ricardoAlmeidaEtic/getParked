'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import './map-styles.css'
import { showToast } from '@/lib/toast'
import { getPublicSpotMarkers, getPrivateParkingMarkers } from '@/lib/map-markers'
import { createPublicSpotMarker, createPrivateParkingMarker } from '@/lib/map-utils'
import { RouteManager } from '@/lib/route-utils'
import { MapMarker } from '@/types/map'

export default function DashboardPage() {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const routeManagerRef = useRef<RouteManager | null>(null)
  const userMarkerRef = useRef<L.CircleMarker | null>(null)

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Inicializa o mapa
    const map = L.map(mapContainerRef.current, {
      zoomControl: false
    }).setView([0, 0], 13)
    mapRef.current = map

    // Inicializa o gerenciador de rotas
    routeManagerRef.current = new RouteManager(map)

    // Adiciona o tile layer do OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map)

    // Adiciona controle de zoom personalizado no canto inferior direito
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map)

    // Função para adicionar a localização do usuário
    const addUserLocation = (position: GeolocationPosition) => {
      if (!mapRef.current) return

      const { latitude, longitude } = position.coords
      mapRef.current.setView([latitude, longitude], 13)
      
      // Adiciona um círculo azul na localização do usuário com tamanho fixo
      const accuracy = position.coords.accuracy
      const circle = L.circleMarker([latitude, longitude], {
        radius: 15,
        color: '#3B82F6',
        fillColor: '#3B82F6',
        fillOpacity: 0.3,
        weight: 2,
      }).addTo(mapRef.current)

      userMarkerRef.current = circle

      // Adiciona um círculo menor no centro para melhor visualização
      L.circleMarker([latitude, longitude], {
        radius: 8,
        color: '#3B82F6',
        fillColor: '#3B82F6',
        fillOpacity: 0.8,
        weight: 2,
      }).addTo(mapRef.current)

      // Adiciona um círculo de precisão (este pode mudar de tamanho com o zoom)
      L.circle([latitude, longitude], {
        radius: accuracy,
        color: '#3B82F6',
        fillColor: '#3B82F6',
        fillOpacity: 0.1,
        weight: 1,
        dashArray: '5, 5',
      }).addTo(mapRef.current)

      // Adiciona um popup com informações de precisão
      circle.bindPopup(`Sua localização atual (precisão: ${Math.round(accuracy)}m)`)
    }

    // Função para carregar os marcadores
    const loadMarkers = async () => {
      if (!mapRef.current) return

      try {
        // Carrega marcadores públicos
        const publicMarkers = await getPublicSpotMarkers()
        publicMarkers.forEach(marker => {
          createPublicSpotMarker(marker).addTo(mapRef.current!)
        })

        // Carrega marcadores privados
        const privateMarkers = await getPrivateParkingMarkers()
        privateMarkers.forEach(marker => {
          createPrivateParkingMarker(marker).addTo(mapRef.current!)
        })
      } catch (error) {
        console.error('Erro ao carregar marcadores:', error)
        showToast.error('Erro ao carregar os estacionamentos')
      }
    }

    // Adiciona listener para cálculo de rota
    const handleCalculateRoute = (event: CustomEvent<MapMarker>) => {
      if (!mapRef.current || !routeManagerRef.current || !userMarkerRef.current) return

      const destination = event.detail
      const userPosition = userMarkerRef.current.getLatLng()

      routeManagerRef.current.calculateRoute(
        userPosition,
        destination,
        userMarkerRef.current
      )
    }

    window.addEventListener('calculate-route', handleCalculateRoute as EventListener)

    // Aguarda o mapa carregar completamente
    map.whenReady(() => {
      // Solicita a localização do usuário
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          addUserLocation,
          (error) => {
            showToast.error('Por favor, autorize o acesso à sua localização para uma melhor experiência')
            console.error('Erro ao obter localização:', error)
          }
        )
      } else {
        showToast.error('Seu navegador não suporta geolocalização')
      }

      // Carrega os marcadores
      loadMarkers()
    })

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
      }
      window.removeEventListener('calculate-route', handleCalculateRoute as EventListener)
      if (routeManagerRef.current) {
        routeManagerRef.current.clearRoute()
      }
    }
  }, [])

  return (
    <div className="relative w-full h-screen">
      <div 
        ref={mapContainerRef} 
        className="absolute inset-0 w-full h-full z-0"
      />
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
            GetParked - Dashboard
          </h1>
        </div>
      </div>
    </div>
  )
} 