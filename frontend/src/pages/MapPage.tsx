import { useSearchParams } from 'react-router-dom'
import MapView from '../components/map/MapView'
import HousePolygon from '../components/map/HousePolygon'
import { useHouses } from '../api/houses'
import { usePeople } from '../api/people'
import { useSettings } from '../api/settings'
import { MAP_CENTER_FALLBACK, MAP_ZOOM_FALLBACK } from '../config'
import Avatar from '../components/contacts/Avatar'

export default function MapPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedHouseId = searchParams.get('house') ? Number(searchParams.get('house')) : null

  const { data: houses = [], isLoading: housesLoading, error: housesError } = useHouses()
  const { data: people = [] } = usePeople()
  const { data: settings, isLoading: settingsLoading } = useSettings()

  const selectedHouse = houses.find((h) => h.id === selectedHouseId) ?? null
  const residents = selectedHouseId ? people.filter((p) => p.house_id === selectedHouseId) : []

  function selectHouse(id: number) {
    setSearchParams(id === selectedHouseId ? {} : { house: String(id) })
  }

  const center: [number, number] = settings
    ? [settings.map_center_lat, settings.map_center_lng]
    : MAP_CENTER_FALLBACK
  const zoom = settings?.map_zoom ?? MAP_ZOOM_FALLBACK

  return (
    <div className="map-page">
      <div className="map-page__map">
        {(housesLoading || settingsLoading) && <div className="overlay-message">Karte lädt…</div>}
        {housesError && <div className="overlay-message overlay-message--error">Fehler beim Laden der Häuser.</div>}
        {!settingsLoading && (
          <MapView center={center} zoom={zoom} flyToPolygon={selectedHouse?.polygon ?? null}>
            {houses.map((house) => (
              <HousePolygon
                key={house.id}
                house={house}
                selected={house.id === selectedHouseId}
                onClick={(h) => selectHouse(h.id)}
              />
            ))}
          </MapView>
        )}
      </div>
      <aside className="map-page__sidebar">
        {!selectedHouse && <p className="hint">Klicke auf ein Haus, um die Bewohner zu sehen.</p>}
        {selectedHouse && (
          <div>
            <h2>{selectedHouse.name}</h2>
            {selectedHouse.address && <p className="muted">{selectedHouse.address}</p>}
            {selectedHouse.notes && (
              <p className="notes">
                <strong>Notizen:</strong> {selectedHouse.notes}
              </p>
            )}
            <h3>Bewohner</h3>
            {residents.length === 0 && <p className="hint">Noch niemand zugeordnet.</p>}
            <ul className="resident-list">
              {residents.map((p) => (
                <li key={p.id} className="resident-card">
                  <div className="resident-card__header">
                    <Avatar person={p} />
                    <div className="resident-card__name">
                      {p.first_name} {p.last_name}
                    </div>
                  </div>
                  {p.phone && <div>📞 {p.phone}</div>}
                  {p.email && <div>✉️ {p.email}</div>}
                  {p.moved_in && <div className="muted">{p.moved_in}</div>}
                  {p.notes && <div className="notes">{p.notes}</div>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </div>
  )
}
