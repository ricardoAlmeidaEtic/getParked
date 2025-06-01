'use client'

import { useEffect, useRef, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import '../map-styles.css'
import { showToast } from '@/lib/toast'
import { getPublicSpotMarkers, getPrivateParkingMarkers, createPublicSpotMarker, createPrivateParkingMarker } from '@/app/map/components/utils'
import { RouteManager } from '@/lib/route-utils'
import { PublicSpotCreator } from '@/app/map/components/creators'
import { MapMarker } from '@/types/map'

interface MapComponentProps {
  isCreatingSpot: boolean
  onMarkerPositionChange: (position: L.LatLng | null) => void
  onMarkerCreated: () => void
  onUserPositionChange: (position: L.LatLng) => void
}

export default function MapComponent({
  isCreatingSpot,
  onMarkerPositionChange,
  onMarkerCreated,
  onUserPositionChange
}: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const routeManagerRef = useRef<RouteManager | null>(null)
  const userMarkerRef = useRef<L.CircleMarker | null>(null)
  const publicSpotCreatorRef = useRef<PublicSpotCreator | null>(null)
  const lastUserPositionRef = useRef<L.LatLng | null>(null)
  const positionUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Função para verificar se a posição mudou significativamente
  const hasPositionChangedSignificantly = (newPosition: L.LatLng): boolean => {
    if (!lastUserPositionRef.current) return true

    // Calcula a distância entre a posição atual e a última posição registrada
    const distance = lastUserPositionRef.current.distanceTo(newPosition)
    
    // Se a distância for maior que 5 metros, considera que a posição mudou significativamente
    return distance > 5
  }

  // Função para atualizar a posição do usuário com debounce
  const updateUserPosition = (position: L.LatLng) => {
    if (!hasPositionChangedSignificantly(position)) return

    // Limpa o timeout anterior se existir
    if (positionUpdateTimeoutRef.current) {
      clearTimeout(positionUpdateTimeoutRef.current)
    }

    // Define um novo timeout para atualizar a posição
    positionUpdateTimeoutRef.current = setTimeout(() => {
      lastUserPositionRef.current = position
      onUserPositionChange(position)
    }, 1000) // Espera 1 segundo antes de atualizar
  }

  // Função para carregar os marcadores
  const loadMarkers = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Inicializa o mapa
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      minZoom: 15,
      maxZoom: 19
    }).setView([0, 0], 16)
    mapRef.current = map

    // Inicializa o gerenciador de rotas
    routeManagerRef.current = new RouteManager(map)

    // Adiciona o tile layer do OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map)

    // Adiciona controle de zoom personalizado no canto inferior direito
    L.control.zoom({
      position: 'bottomright',
      zoomInText: '+',
      zoomOutText: '-'
    }).addTo(map)

    // Função para adicionar a localização do usuário
    const addUserLocation = (position: GeolocationPosition) => {
      if (!mapRef.current) return

      const { latitude, longitude } = position.coords
      const userLatLng = L.latLng(latitude, longitude)
      
      // Atualiza a posição do usuário com debounce
      updateUserPosition(userLatLng)

      // Atualiza a visualização do mapa apenas se a posição mudou significativamente
      if (hasPositionChangedSignificantly(userLatLng)) {
        mapRef.current.setView(userLatLng, 16)
      }
      
      // Adiciona um círculo azul na localização do usuário com tamanho fixo
      const accuracy = position.coords.accuracy
      const circle = L.circleMarker(userLatLng, {
        radius: 15,
        color: '#3B82F6',
        fillColor: '#3B82F6',
        fillOpacity: 0.3,
        weight: 2,
      }).addTo(mapRef.current)

      userMarkerRef.current = circle

      // Adiciona um círculo menor no centro para melhor visualização
      L.circleMarker(userLatLng, {
        radius: 8,
        color: '#3B82F6',
        fillColor: '#3B82F6',
        fillOpacity: 0.8,
        weight: 2,
      }).addTo(mapRef.current)

      // Adiciona um círculo de precisão (este pode mudar de tamanho com o zoom)
      L.circle(userLatLng, {
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
      if (publicSpotCreatorRef.current) {
        publicSpotCreatorRef.current.stopCreation()
      }
      if (positionUpdateTimeoutRef.current) {
        clearTimeout(positionUpdateTimeoutRef.current)
      }
    }
  }, [loadMarkers])

  // Efeito para gerenciar o modo de criação de spots
  useEffect(() => {
    if (!mapRef.current || !userMarkerRef.current) return

    console.log('MapComponent - Modo de criação:', isCreatingSpot)

    if (isCreatingSpot) {
      const userPosition = userMarkerRef.current.getLatLng()
      console.log('MapComponent - Iniciando criação de marcador na posição do usuário:', userPosition)
      
      // Força o zoom in na posição do usuário
      mapRef.current.setView(userPosition, 18, {
        animate: true,
        duration: 0.5
      })
      
      if (!publicSpotCreatorRef.current) {
        publicSpotCreatorRef.current = new PublicSpotCreator(mapRef.current, userPosition)
      }
      
      publicSpotCreatorRef.current.startCreation((position) => {
        console.log('MapComponent - Recebendo nova posição do marcador:', position)
        if (position) {
          onMarkerPositionChange(position)
        }
      })
    } else {
      console.log('MapComponent - Parando criação de marcador')
      if (publicSpotCreatorRef.current) {
        publicSpotCreatorRef.current.stopCreation()
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