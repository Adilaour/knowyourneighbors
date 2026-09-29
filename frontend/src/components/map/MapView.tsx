import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { MAP_HIGHLIGHT_ZOOM } from '../../config'
import type { LatLng } from '../../api/types'
import { centroid } from './geo'

function FlyToCentroid({ target }: { target: LatLng | null }) {
  const map = useMap()
  useEffect(() => {
    if (target) {
      map.flyTo(target, MAP_HIGHLIGHT_ZOOM)
    }
  }, [target, map])
  return null
}

interface MapViewProps {
  center: LatLng
  zoom: number
  children?: ReactNode
  flyToPolygon?: LatLng[] | null
}

export default function MapView({ center, zoom, children, flyToPolygon }: MapViewProps) {
  const target = flyToPolygon ? centroid(flyToPolygon) : null
  return (
    <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyToCentroid target={target} />
      {children}
    </MapContainer>
  )
}
