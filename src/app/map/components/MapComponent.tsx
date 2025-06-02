'use client'

import { useEffect, useRef, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import '../map-styles.css'
import { showToast } from '@/lib/toast'
import { getPublicSpotMarkers, getPrivateParkingMarkers, createPublicSpotMarker, createPrivateParkingMarker } from '@/app/map/components/utils'
import { PublicSpotCreator } from '@/app/map/components/creators'
import { PublicSpotMarker } from '@/types/map'
import { getRoute, decodePolyline } from '@/services/graphhopper'

// Importa o leaflet-routing-machine
import 'leaflet-routing-machine'

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
  const userMarkerRef = useRef<L.CircleMarker | null>(null)
  const selectedMarkerRef = useRef<L.Marker | null>(null)
  const routeLineRef = useRef<L.Polyline | null>(null)
  const creatorRef = useRef<PublicSpotCreator | null>(null)
  const lastUserPositionRef = useRef<L.LatLng | null>(null)
  const positionUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Função para verificar se a posição mudou significativamente
  const hasPositionChangedSignificantly = (newPosition: L.LatLng): boolean => {
    if (!lastUserPositionRef.current) return true
    const distance = lastUserPositionRef.current.distanceTo(newPosition)
    return distance > 5
  }

  // Função para atualizar a posição do usuário com debounce
  const updateUserPosition = (position: L.LatLng) => {
    if (!hasPositionChangedSignificantly(position)) return

    if (positionUpdateTimeoutRef.current) {
      clearTimeout(positionUpdateTimeoutRef.current)
    }

    positionUpdateTimeoutRef.current = setTimeout(() => {
      lastUserPositionRef.current = position
      onUserPositionChange(position)
    }, 1000)
  }

  const showRoute = async (start: L.LatLng, end: L.LatLng) => {
    if (!mapRef.current) return

    try {
      // Remove rota anterior se existir
      if (routeLineRef.current) {
        mapRef.current.removeLayer(routeLineRef.current)
        routeLineRef.current = null
      }

      // Mostra um indicador de carregamento
      const loadingToast = showToast.loading('Calculando rota...')

      // Cria o controle de rota usando uma abordagem mais simples
      // @ts-ignore
      const router = L.Routing.osrmv1({
        serviceUrl: 'https://routing.openstreetmap.de/routed-car/route/v1',
        timeout: 30000,
        profile: 'driving',
        useHints: true
      })

      // Converte os pontos para o formato esperado pelo router
      const waypoints = [
        { latLng: start },
        { latLng: end }
      ]

      // @ts-ignore
      router.route(waypoints, (err: any, routes: any) => {
        if (err) {
          console.error('Erro ao calcular rota:', err)
          showToast.error('Erro ao calcular rota')
          return
        }

        if (routes && routes.length > 0) {
          const route = routes[0]
          
          // Cria uma linha poligonal para a rota
          const routeLine = L.polyline(route.coordinates, {
            color: '#3B82F6',
            weight: 6,
            opacity: 0.8
          }).addTo(mapRef.current!)

          // Ajusta o zoom para mostrar toda a rota
          const bounds = routeLine.getBounds()
          mapRef.current?.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 16
          })

          // Mostra informações da rota
          const distance = (route.summary.totalDistance / 1000).toFixed(1)
          const duration = Math.round(route.summary.totalTime / 60)
          
          // Cria um popup com as informações da rota
          if (mapRef.current) {
            const popup = L.popup()
              .setLatLng(start)
              .setContent(`
                <div class="p-2">
                  <h3 class="font-bold mb-2">Rota Calculada</h3>
                  <p>Distância: ${distance}km</p>
                  <p>Tempo estimado: ${duration}min</p>
                  <p class="text-sm text-gray-500 mt-2">Siga a linha azul no mapa</p>
                </div>
              `)
              .openOn(mapRef.current)

            showToast.info(`Distância: ${distance}km • Tempo estimado: ${duration}min`)
          }

          // Armazena a referência da linha da rota
          routeLineRef.current = routeLine
        }
      })

      // Remove o indicador de carregamento
      showToast.dismiss(loadingToast)

    } catch (error) {
      console.error('Erro ao mostrar rota:', error)
      showToast.error('Erro ao calcular rota')
    }
  }

  const createPublicSpotMarkerWithRoute = (marker: PublicSpotMarker) => {
    const markerInstance = createPublicSpotMarker(marker)
    
    markerInstance.on('click', () => {
      if (userMarkerRef.current && mapRef.current) {
        const userPosition = userMarkerRef.current.getLatLng()
        const markerPosition = markerInstance.getLatLng()
        
        // Remove seleção anterior
        if (selectedMarkerRef.current && markerInstance.options.icon) {
          selectedMarkerRef.current.setIcon(markerInstance.options.icon)
        }
        
        // Atualiza o ícone do marcador selecionado
        const selectedIcon = L.divIcon({
          className: 'custom-marker public-spot selected',
          html: `
            <div class="w-6 h-6 bg-blue-500 rounded-full border-2 border-blue-700 flex items-center justify-center text-xs font-bold text-white">
              ${marker.available_spots}
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        })
        
        markerInstance.setIcon(selectedIcon)
        selectedMarkerRef.current = markerInstance
        
        // Calcula a rota
        showRoute(userPosition, markerPosition)
      }
    })

    return markerInstance
  }

  const loadMarkers = useCallback(async () => {
    if (!mapRef.current) return

    try {
      const publicMarkers = await getPublicSpotMarkers()
      publicMarkers.forEach(marker => {
        createPublicSpotMarkerWithRoute(marker).addTo(mapRef.current!)
      })

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

    // Adiciona o tile layer do OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map)

    // Adiciona controles de zoom
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map)

    // Função para adicionar a localização do usuário
    const addUserLocation = (position: GeolocationPosition) => {
      if (!mapRef.current) return

      const { latitude, longitude } = position.coords
      const userLatLng = L.latLng(latitude, longitude)
      
      updateUserPosition(userLatLng)

      if (hasPositionChangedSignificantly(userLatLng)) {
        mapRef.current.setView(userLatLng, 16)
      }
      
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

    // Aguarda o mapa carregar completamente
    map.whenReady(() => {
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

      loadMarkers()
    })

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
      }
      if (positionUpdateTimeoutRef.current) {
        clearTimeout(positionUpdateTimeoutRef.current)
      }
    }
  }, [loadMarkers])

  // Efeito para gerenciar o modo de criação de spots
  useEffect(() => {
    if (!mapRef.current || !userMarkerRef.current) return

    if (isCreatingSpot) {
      const userPosition = userMarkerRef.current.getLatLng()
      
      mapRef.current.setView(userPosition, 18, {
        animate: true,
        duration: 0.5
      })
      
      if (!creatorRef.current) {
        creatorRef.current = new PublicSpotCreator(mapRef.current, userPosition)
      }
      
      creatorRef.current.startCreation((position) => {
        if (position) {
          onMarkerPositionChange(position)
        }
      })
    } else {
      if (creatorRef.current) {
        creatorRef.current.stopCreation()
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