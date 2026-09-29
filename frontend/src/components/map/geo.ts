import type { LatLng } from '../../api/types'

export function centroid(polygon: LatLng[]): LatLng {
  const [latSum, lngSum] = polygon.reduce(
    ([lat, lng], [pLat, pLng]) => [lat + pLat, lng + pLng],
    [0, 0]
  )
  return [latSum / polygon.length, lngSum / polygon.length]
}
