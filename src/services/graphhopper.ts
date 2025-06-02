import { showToast } from '@/lib/toast'

interface RouteResponse {
  paths: Array<{
    distance: number
    time: number
    points: string
  }>
}

export async function getRoute(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): Promise<RouteResponse | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GRAPHHOPPER_API_KEY
    if (!apiKey) {
      throw new Error('Chave API do GraphHopper não configurada')
    }

    const url = `https://graphhopper.com/api/1/route?point=${startLat},${startLng}&point=${endLat},${endLng}&vehicle=car&key=${apiKey}`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Erro ao obter rota')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Erro ao obter rota:', error)
    showToast.error('Erro ao calcular rota')
    return null
  }
}

export function decodePolyline(polyline: string): [number, number][] {
  const points: [number, number][] = []
  let index = 0
  let lat = 0
  let lng = 0

  while (index < polyline.length) {
    let shift = 0
    let result = 0

    do {
      let b = polyline.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (result >= 0x20)

    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1))
    lat += dlat

    shift = 0
    result = 0

    do {
      let b = polyline.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (result >= 0x20)

    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1))
    lng += dlng

    points.push([lat * 1e-5, lng * 1e-5])
  }

  return points
} 