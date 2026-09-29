import { Polygon, Tooltip } from 'react-leaflet'
import type { LeafletEventHandlerFnMap } from 'leaflet'
import type * as L from 'leaflet'
import type { House, LatLng } from '../../api/types'

interface HousePolygonProps {
  house: House
  selected?: boolean
  onClick?: (house: House) => void
  onEdit?: (house: House, polygon: LatLng[]) => void
  onRemove?: (house: House) => void
}

export default function HousePolygon({ house, selected, onClick, onEdit, onRemove }: HousePolygonProps) {
  const eventHandlers: LeafletEventHandlerFnMap = {
    click: () => onClick?.(house),
  }
  if (onEdit) {
    eventHandlers['pm:edit'] = (e) => {
      const layer = e.target as L.Polygon
      const latlngs = (layer.getLatLngs()[0] as L.LatLng[]).map((ll): LatLng => [ll.lat, ll.lng])
      onEdit(house, latlngs)
    }
  }
  if (onRemove) {
    eventHandlers['pm:remove'] = () => onRemove(house)
  }

  return (
    <Polygon
      positions={house.polygon}
      pathOptions={
        selected
          ? { color: '#e2542a', weight: 3, fillColor: '#e2542a', fillOpacity: 0.35 }
          : { color: '#2a6be2', weight: 2, fillColor: '#2a6be2', fillOpacity: 0.15 }
      }
      eventHandlers={eventHandlers}
    >
      <Tooltip sticky>{house.name}</Tooltip>
    </Polygon>
  )
}
