'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import '../map-styles.css'
import { showToast } from '@/lib/toast'
import { getPublicSpotMarkers, getPrivateParkingMarkers, createPublicSpotMarker, createPrivateParkingMarker } from '@/app/map/components/utils'
import { PublicSpotCreator } from '@/app/map/components/creators'
import { PublicSpotMarker, PrivateParkingMarker } from '@/types/map'
import { getRoute, decodePolyline } from '@/services/graphhopper'
import RouteInfoModal from './modals/RouteInfoModal'
import { createPublicSpotPopupContent, createPrivateParkingPopupContent } from './modals/popup-content'

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
  const initialLoadDoneRef = useRef<boolean>(false)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const [routeInfo, setRouteInfo] = useState<{
    isOpen: boolean
    distance: number
    duration: number
    destinationName: string
    destinationPosition: L.LatLng | null
    isNavigating: boolean
    spotDetails?: {
      type: 'public' | 'private'
      availableSpots?: number
      totalSpots?: number
      pricePerHour?: number
      status?: string
      expiresAt?: string
      openingTime?: string
      closingTime?: string
      phone?: string
    }
  }>({
    isOpen: false,
    distance: 0,
    duration: 0,
    destinationName: '',
    destinationPosition: null,
    isNavigating: false
  })
  const [routeInstructions, setRouteInstructions] = useState<any[]>([])
  const [completedInstructions, setCompletedInstructions] = useState<number[]>([])
  const [currentInstructionIndex, setCurrentInstructionIndex] = useState<number>(0)
  const [showRouteModal, setShowRouteModal] = useState(false)
  const routeControlRef = useRef<L.Routing.Control | null>(null)

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

  const createPrivateParkingMarkerWithRoute = (marker: PrivateParkingMarker) => {
    try {
      const markerInstance = createPrivateParkingMarker(marker)
      
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
            className: 'custom-marker private-parking selected',
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
          
          // Calcula a rota com os detalhes da vaga
          showRoute(userPosition, markerPosition, marker.parking_name, {
            type: 'private',
            availableSpots: marker.available_spots,
            openingTime: marker.opening_time,
            closingTime: marker.closing_time,
            phone: marker.phone
          })
        }
      })

      return markerInstance
    } catch (error) {
      console.error('Erro ao criar marcador:', error)
      throw error
    }
  }

  const loadMarkers = useCallback(async () => {
    if (!mapRef.current) {
      console.log('Mapa ainda não inicializado')
      return
    }

    try {
      // Carrega marcadores públicos
      const publicMarkers = await getPublicSpotMarkers()
      console.log('Carregando marcadores públicos:', publicMarkers)
      
      // Carrega marcadores privados
      const privateMarkers = await getPrivateParkingMarkers()
      console.log('Carregando marcadores privados:', privateMarkers)
      
      if (mapRef.current) {
        // Aguarda o próximo ciclo do event loop para garantir que o DOM esteja pronto
        await new Promise(resolve => setTimeout(resolve, 0))
        
        // Remove todos os marcadores existentes
        markersRef.current.forEach(marker => {
          marker.remove()
        })
        markersRef.current.clear()
        
        // Adiciona os marcadores públicos
        for (const marker of publicMarkers) {
          try {
            const markerInstance = createPublicSpotMarkerWithRoute(marker)
            if (mapRef.current) {
              markerInstance.addTo(mapRef.current)
              markersRef.current.set(`${marker.latitude}-${marker.longitude}`, markerInstance)
            }
          } catch (error) {
            console.error('Erro ao adicionar marcador público:', error)
          }
        }

        // Adiciona os marcadores privados
        for (const marker of privateMarkers) {
          try {
            const markerInstance = createPrivateParkingMarkerWithRoute(marker)
            if (mapRef.current) {
              markerInstance.addTo(mapRef.current)
              markersRef.current.set(`private-${marker.latitude}-${marker.longitude}`, markerInstance)
            }
          } catch (error) {
            console.error('Erro ao adicionar marcador privado:', error)
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar marcadores:', error)
      showToast.error('Erro ao carregar os estacionamentos')
    }
  }, [])

  // Efeito para recarregar os marcadores após a criação de uma nova vaga
  useEffect(() => {
    if (!initialLoadDoneRef.current) return

    const timer = setTimeout(() => {
      loadMarkers()
      
      // Recarrega o mapa após criar uma vaga
      if (mapRef.current) {
        const currentCenter = mapRef.current.getCenter()
        const currentZoom = mapRef.current.getZoom()
        
        // Força um redraw do mapa
        mapRef.current.invalidateSize()
        
        // Recarrega os tiles
        mapRef.current.eachLayer((layer) => {
          if (layer instanceof L.TileLayer) {
            layer.redraw()
          }
        })
        
        // Restaura a posição e zoom
        mapRef.current.setView(currentCenter, currentZoom, {
          animate: false
        })
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [onMarkerCreated, loadMarkers])

  const showRoute = async (start: L.LatLng, end: L.LatLng, destinationName: string, spotDetails?: any) => {
    if (!mapRef.current) return

    try {
      // Remove rota anterior se existir
      if (routeLineRef.current) {
        mapRef.current.removeLayer(routeLineRef.current)
        routeLineRef.current = null
      }

      if (routeControlRef.current) {
        mapRef.current.removeControl(routeControlRef.current)
        routeControlRef.current = null
      }

      // Mostra um indicador de carregamento
      const loadingToast = showToast.loading('Calculando rota...')

      // Primeiro, ajusta o zoom suavemente para a área da rota
      const bounds = L.latLngBounds([start, end])
      mapRef.current.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 16,
        animate: true,
        duration: 1
      })

      // Aguarda o zoom terminar
      await new Promise(resolve => setTimeout(resolve, 500))

      // Cria o controle de rota com instruções
      routeControlRef.current = L.Routing.control({
        waypoints: [start, end],
        routeWhileDragging: false,
        showAlternatives: false,
        fitSelectedRoutes: false, // Desativa o ajuste automático
        lineOptions: {
          styles: [{ color: '#3B82F6', weight: 6, opacity: 0.8 }],
          extendToWaypoints: true,
          missingRouteTolerance: 0
        },
        createMarker: () => null,
        addWaypoints: false,
        draggableWaypoints: false,
        routeDragInterval: 200,
        useZoomParameter: true,
        show: false,
        router: L.Routing.osrmv1({
          serviceUrl: 'https://routing.openstreetmap.de/routed-car/route/v1',
          timeout: 30000,
          profile: 'driving',
          useHints: true
        })
      }).addTo(mapRef.current)

      // Adiciona evento para quando a rota for calculada
      routeControlRef.current.on('routesfound', (e: any) => {
        const routes = e.routes
        if (routes && routes.length > 0) {
          const route = routes[0]
          
          // Extrai as instruções da rota
          const instructions = route.instructions.map((instruction: any) => {
            let coordinates: [number, number] | null = null;
            
            // Tenta obter as coordenadas de diferentes formatos possíveis
            if (Array.isArray(instruction.coords) && instruction.coords.length >= 2) {
              coordinates = [instruction.coords[0], instruction.coords[1]];
            } else if (Array.isArray(instruction.coordinates) && instruction.coordinates.length >= 2) {
              coordinates = [instruction.coordinates[0], instruction.coordinates[1]];
            } else if (typeof instruction.lat === 'number' && typeof instruction.lng === 'number') {
              coordinates = [instruction.lat, instruction.lng];
            }

            return {
              distance: Math.round(instruction.distance),
              time: Math.round(instruction.time / 60),
              text: instruction.text,
              type: instruction.type,
              coordinates: coordinates
            };
          }).filter(instruction => instruction.coordinates !== null);
          
          setRouteInstructions(instructions);
          setCompletedInstructions([]);
          setCurrentInstructionIndex(0);
          
          // Ajusta o zoom novamente com a rota completa
          const routeBounds = L.latLngBounds(route.coordinates)
          mapRef.current?.fitBounds(routeBounds, {
            padding: [50, 50],
            maxZoom: 16,
            animate: true,
            duration: 1
          })

          // Mostra informações da rota
          const distance = route.summary.totalDistance / 1000
          const duration = Math.round(route.summary.totalTime / 60)
          
          // Atualiza o estado do modal de rota
          setRouteInfo({
            isOpen: true,
            distance,
            duration,
            destinationName,
            destinationPosition: end,
            isNavigating: false,
            spotDetails
          })

          // Remove o indicador de carregamento
          showToast.dismiss(loadingToast)
        }
      })

    } catch (error) {
      console.error('Erro ao mostrar rota:', error)
      showToast.error('Erro ao calcular rota')
    }
  }

  const startDestinationMonitoring = (destination: L.LatLng) => {
    const checkDistance = () => {
      if (!userMarkerRef.current || !destination) return;

      try {
        const userPosition = userMarkerRef.current.getLatLng();
        if (!userPosition) return;

        const distance = userPosition.distanceTo(destination);

        // Verifica se o usuário está próximo de algum ponto de instrução
        if (Array.isArray(routeInstructions)) {
          routeInstructions.forEach((instruction, index) => {
            if (!instruction?.coordinates) return;
            
            if (!completedInstructions.includes(index)) {
              try {
                const [lat, lng] = instruction.coordinates;
                if (typeof lat !== 'number' || typeof lng !== 'number') return;

                const instructionPoint = L.latLng(lat, lng);
                const distanceToInstruction = userPosition.distanceTo(instructionPoint);
                
                if (distanceToInstruction <= 50) { // 50 metros de tolerância
                  setCompletedInstructions(prev => [...prev, index]);
                  setCurrentInstructionIndex(index + 1);
                }
              } catch (error) {
                console.error('Erro ao processar instrução:', error);
              }
            }
          });
        }

        // Se estiver a menos de 100 metros do destino
        if (distance <= 100) {
          setShowRouteModal(true);
        } else {
          setShowRouteModal(false);
        }
      } catch (error) {
        console.error('Erro ao verificar distância:', error);
      }
    };

    // Verifica a distância a cada segundo
    const interval = setInterval(checkDistance, 1000);
    checkDistance(); // Verifica imediatamente

    // Limpa o intervalo quando o componente for desmontado
    return () => clearInterval(interval);
  };

  const createPublicSpotMarkerWithRoute = (marker: PublicSpotMarker) => {
    try {
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
          
          // Calcula a rota com os detalhes da vaga
          showRoute(userPosition, markerPosition, marker.name, {
            type: 'public',
            availableSpots: marker.available_spots,
            totalSpots: marker.total_spots,
            expiresAt: marker.expires_at
          })
        }
      })

      return markerInstance
    } catch (error) {
      console.error('Erro ao criar marcador:', error)
      throw error
    }
  }

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Inicializa o mapa
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      minZoom: 15,
      maxZoom: 20,
      zoomSnap: 0.5,
      zoomDelta: 0.5,
      wheelDebounceTime: 40,
      preferCanvas: true,
      updateWhenIdle: true,
      updateWhenZooming: false,
      keepBuffer: 2,
      maxBoundsViscosity: 1.0
    }).setView([0, 0], 16)
    mapRef.current = map

    // Adiciona o tile layer do OpenStreetMap com configurações otimizadas
    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 20,
      tileSize: 256,
      zoomOffset: 0,
      detectRetina: true,
      updateWhenIdle: true,
      updateWhenZooming: false,
      keepBuffer: 2,
      crossOrigin: true,
      errorTileUrl: 'https://tile.openstreetmap.org/0/0/0.png'
    }).addTo(map)

    // Adiciona tratamento de erros para o tile layer
    tileLayer.on('tileerror', (e) => {
      console.error('Erro ao carregar tile:', e);
      // Tenta recarregar o tile
      const tile = e.tile;
      if (tile) {
        tile.src = tile.src;
      }
    });

    // Adiciona evento para recarregar tiles quando necessário
    map.on('zoomend', () => {
      if (map.getZoom() >= 19) {
        tileLayer.redraw();
      }
    });

    // Adiciona controles de zoom
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map)

    // Adiciona listener para o evento de navegação
    const handleNavigation = (event: CustomEvent) => {
      const { lat, lng, name } = event.detail
      if (userMarkerRef.current && mapRef.current) {
        const userPosition = userMarkerRef.current.getLatLng()
        const destinationPosition = L.latLng(lat, lng)
        showRoute(userPosition, destinationPosition, name)
      }
    }

    window.addEventListener('startNavigation', handleNavigation as EventListener)

    // Aguarda o mapa carregar completamente
    map.whenReady(() => {
      console.log('Mapa inicializado e pronto')
      if (!initialLoadDoneRef.current) {
        loadMarkers()
        initialLoadDoneRef.current = true
      }
    })

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

      // Carrega os marcadores apenas uma vez na inicialização
      if (!initialLoadDoneRef.current) {
        loadMarkers()
        initialLoadDoneRef.current = true
      }

      // Efeito para recarregar os marcadores periodicamente
      const intervalId = setInterval(() => {
        console.log('Recarregando marcadores...')
        loadMarkers()
      }, 30000) // Recarrega a cada 30 segundos

      // Cleanup
      return () => {
        clearInterval(intervalId)
      }
    })

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
      }
      if (positionUpdateTimeoutRef.current) {
        clearTimeout(positionUpdateTimeoutRef.current)
      }
      window.removeEventListener('startNavigation', handleNavigation as EventListener)
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
      }, isCreatingSpot)
    } else {
      if (creatorRef.current) {
        creatorRef.current.stopCreation()
      }
      onMarkerPositionChange(null)
    }
  }, [isCreatingSpot, onMarkerPositionChange])

  const handleSpotConfirmed = () => {
    if (selectedMarkerRef.current) {
      const confirmedIcon = L.divIcon({
        className: 'w-6 h-6 bg-green-500 rounded-full border-2 border-green-700 flex items-center justify-center text-xs font-bold text-white shadow-lg transform scale-110',
        html: `
          <div class="w-full h-full flex items-center justify-center">
            ✓
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })
      selectedMarkerRef.current.setIcon(confirmedIcon)
    }
  }

  const handleSpotNotFound = () => {
    if (selectedMarkerRef.current) {
      const notFoundIcon = L.divIcon({
        className: 'w-6 h-6 bg-red-500 rounded-full border-2 border-red-700 flex items-center justify-center text-xs font-bold text-white shadow-lg transform scale-110',
        html: `
          <div class="w-full h-full flex items-center justify-center">
            ✕
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })
      selectedMarkerRef.current.setIcon(notFoundIcon)
    }
  }

  const startNavigation = () => {
    if (!routeInfo.destinationPosition || !userMarkerRef.current) return;

    setRouteInfo(prev => ({ ...prev, isNavigating: true }));
    setShowRouteModal(true); // Garante que o modal de direções seja exibido
    startDestinationMonitoring(routeInfo.destinationPosition);
  };

  const handleRouteModalClose = () => {
    setRouteInfo(prev => ({ ...prev, isOpen: false, isNavigating: false }));
    setShowRouteModal(false);
    clearRoute();
  };

  const clearRoute = () => {
    if (routeLineRef.current && mapRef.current) {
      mapRef.current.removeLayer(routeLineRef.current)
      routeLineRef.current = null
    }
    if (routeControlRef.current && mapRef.current) {
      mapRef.current.removeControl(routeControlRef.current)
      routeControlRef.current = null
    }
    setRouteInstructions([])
    if (selectedMarkerRef.current && selectedMarkerRef.current.options.icon) {
      const originalIcon = L.divIcon({
        className: 'w-6 h-6 bg-yellow-400 rounded-full border-2 border-yellow-600 flex items-center justify-center text-xs font-bold shadow-lg',
        html: `
          <div class="w-full h-full flex items-center justify-center">
            P
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })
      selectedMarkerRef.current.setIcon(originalIcon)
      selectedMarkerRef.current = null
    }
  }

  return (
    <>
      <div 
        ref={mapContainerRef} 
        className="absolute inset-0 w-full h-full z-0"
      />
      {routeInstructions.length > 0 && routeInfo.isNavigating && showRouteModal && (
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm w-full z-10">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Instruções de Navegação</h3>
            <button
              onClick={handleRouteModalClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded-full"
              aria-label="Fechar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {routeInstructions.map((instruction, index) => (
              <div 
                key={index} 
                className={`flex items-start space-x-2 p-2 rounded transition-colors duration-200 ${
                  completedInstructions.includes(index) 
                    ? 'bg-green-50' 
                    : index === currentInstructionIndex 
                      ? 'bg-blue-50' 
                      : 'hover:bg-gray-50'
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  completedInstructions.includes(index)
                    ? 'bg-green-100 text-green-600'
                    : index === currentInstructionIndex
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                }`}>
                  {completedInstructions.includes(index) ? '✓' : index + 1}
                </div>
                <div>
                  <p className={`text-sm ${
                    completedInstructions.includes(index)
                      ? 'text-green-700'
                      : index === currentInstructionIndex
                        ? 'text-blue-700'
                        : 'text-gray-900'
                  }`}>
                    {instruction.text}
                  </p>
                  <p className={`text-xs ${
                    completedInstructions.includes(index)
                      ? 'text-green-500'
                      : index === currentInstructionIndex
                        ? 'text-blue-500'
                        : 'text-gray-500'
                  }`}>
                    {instruction.distance}m • {instruction.time}min
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <RouteInfoModal
        isOpen={routeInfo.isOpen}
        onClose={handleRouteModalClose}
        distance={routeInfo.distance}
        duration={routeInfo.duration}
        destinationName={routeInfo.destinationName}
        userPosition={userMarkerRef.current?.getLatLng() || null}
        destinationPosition={routeInfo.destinationPosition || L.latLng(0, 0)}
        onSpotConfirmed={handleSpotConfirmed}
        onSpotNotFound={handleSpotNotFound}
        onStartNavigation={startNavigation}
        isNavigating={routeInfo.isNavigating}
        spotDetails={routeInfo.spotDetails}
      />
    </>
  )
} 