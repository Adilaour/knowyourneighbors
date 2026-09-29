import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import '@geoman-io/leaflet-geoman-free'
import type * as L from 'leaflet'
import type { LatLng } from '../../api/types'

interface DrawControlProps {
  onCreate: (polygon: LatLng[]) => void
}

export default function DrawControl({ onCreate }: DrawControlProps) {
  const map = useMap()

  useEffect(() => {
    map.pm.addControls({
      position: 'topleft',
      drawMarker: false,
      drawCircleMarker: false,
      drawPolyline: false,
      drawRectangle: false,
      drawCircle: false,
      drawText: false,
      drawPolygon: true,
      editMode: true,
      dragMode: false,
      cutPolygon: false,
      removalMode: true,
      rotateMode: false,
    })

    function handleCreate(e: { shape: string; layer: L.Layer }) {
      if (e.shape !== 'Polygon') return
      const polygonLayer = e.layer as L.Polygon
      const latlngs = (polygonLayer.getLatLngs()[0] as L.LatLng[]).map((ll): LatLng => [ll.lat, ll.lng])
      polygonLayer.remove()
      onCreate(latlngs)
    }

    map.on('pm:create', handleCreate)

    return () => {
      map.off('pm:create', handleCreate)
      map.pm.removeControls()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])

  return null
}
