import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import MapView from '../components/map/MapView'
import HousePolygon from '../components/map/HousePolygon'
import DrawControl from '../components/map/DrawControl'
import HouseMetaForm, { type HouseMetaValues } from '../components/admin/HouseMetaForm'
import ResidentAssignment from '../components/admin/ResidentAssignment'
import { useHouses, useCreateHouse, useUpdateHouse, useDeleteHouse } from '../api/houses'
import { usePeople, useUpdatePerson } from '../api/people'
import { useSettings } from '../api/settings'
import { MAP_CENTER_FALLBACK, MAP_ZOOM_FALLBACK } from '../config'
import type { House, LatLng } from '../api/types'
import { personScalarsToInput } from '../lib/people'

export default function AdminHouseEditorPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedHouseId = searchParams.get('house') ? Number(searchParams.get('house')) : null
  const [pendingPolygon, setPendingPolygon] = useState<LatLng[] | null>(null)

  const { data: houses = [] } = useHouses()
  const { data: people = [] } = usePeople()
  const { data: settings, isLoading: settingsLoading } = useSettings()
  const createHouse = useCreateHouse()
  const updateHouse = useUpdateHouse()
  const deleteHouse = useDeleteHouse()
  const updatePerson = useUpdatePerson()

  const selectedHouse = houses.find((h) => h.id === selectedHouseId) ?? null

  function selectHouse(house: House) {
    setPendingPolygon(null)
    setSearchParams({ house: String(house.id) })
  }

  function handlePolygonEdit(house: House, polygon: LatLng[]) {
    updateHouse.mutate({
      id: house.id,
      input: { name: house.name, address: house.address, notes: house.notes, polygon },
    })
  }

  function handlePolygonRemove(house: House) {
    if (confirm(`Haus "${house.name}" wirklich löschen? Bewohner bleiben als Kontakte erhalten.`)) {
      deleteHouse.mutate(house.id)
      setSearchParams({})
    }
  }

  async function handleCreateSubmit(values: HouseMetaValues) {
    if (!pendingPolygon) return
    await createHouse.mutateAsync({
      name: values.name,
      address: values.address || null,
      notes: values.notes || null,
      polygon: pendingPolygon,
    })
    setPendingPolygon(null)
  }

  async function handleEditSubmit(values: HouseMetaValues) {
    if (!selectedHouse) return
    await updateHouse.mutateAsync({
      id: selectedHouse.id,
      input: {
        name: values.name,
        address: values.address || null,
        notes: values.notes || null,
        polygon: selectedHouse.polygon,
      },
    })
  }

  function handleDeleteSelected() {
    if (!selectedHouse) return
    if (confirm(`Haus "${selectedHouse.name}" wirklich löschen? Bewohner bleiben als Kontakte erhalten.`)) {
      deleteHouse.mutate(selectedHouse.id)
      setSearchParams({})
    }
  }

  const residents = selectedHouse ? people.filter((p) => p.house_id === selectedHouse.id) : []
  const unassignedPeople = people.filter((p) => p.house_id === null || p.house_id === undefined)

  const center: [number, number] = settings
    ? [settings.map_center_lat, settings.map_center_lng]
    : MAP_CENTER_FALLBACK
  const zoom = settings?.map_zoom ?? MAP_ZOOM_FALLBACK

  return (
    <div className="map-page">
      <div className="map-page__map">
        {settingsLoading && <div className="overlay-message">Karte lädt…</div>}
        {!settingsLoading && (
          <MapView center={center} zoom={zoom}>
            <DrawControl onCreate={(polygon) => { setSearchParams({}); setPendingPolygon(polygon) }} />
            {houses.map((house) => (
              <HousePolygon
                key={house.id}
                house={house}
                selected={house.id === selectedHouseId}
                onClick={selectHouse}
                onEdit={handlePolygonEdit}
                onRemove={handlePolygonRemove}
              />
            ))}
          </MapView>
        )}
      </div>
      <aside className="map-page__sidebar">
        <p className="hint">
          Neues Haus mit dem Polygon-Werkzeug (oben links auf der Karte) einzeichnen. Bestehende Häuser: anklicken
          zum Bearbeiten, per Editier-Werkzeug Eckpunkte verschieben, per Lösch-Werkzeug entfernen.
        </p>
        {pendingPolygon && (
          <HouseMetaForm
            title="Neues Haus"
            submitLabel="Haus anlegen"
            saving={createHouse.isPending}
            onSubmit={handleCreateSubmit}
            onCancel={() => setPendingPolygon(null)}
          />
        )}
        {!pendingPolygon && selectedHouse && (
          <>
            <HouseMetaForm
              key={`${selectedHouse.id}:${selectedHouse.updated_at}`}
              title={selectedHouse.name}
              initial={{
                name: selectedHouse.name,
                address: selectedHouse.address ?? '',
                notes: selectedHouse.notes ?? '',
              }}
              submitLabel="Speichern"
              saving={updateHouse.isPending}
              onSubmit={handleEditSubmit}
              onCancel={() => setSearchParams({})}
              onDelete={handleDeleteSelected}
            />
            <ResidentAssignment
              residents={residents}
              unassignedPeople={unassignedPeople}
              onAssign={(personId) => {
                const person = people.find((p) => p.id === personId)
                if (!person) return
                updatePerson.mutate({ id: personId, input: { ...personScalarsToInput(person), house_id: selectedHouse.id } })
              }}
              onUnassign={(personId) => {
                const person = people.find((p) => p.id === personId)
                if (!person) return
                updatePerson.mutate({ id: personId, input: { ...personScalarsToInput(person), house_id: null } })
              }}
            />
          </>
        )}
        {!pendingPolygon && !selectedHouse && (
          <p className="hint">Kein Haus ausgewählt.</p>
        )}
      </aside>
    </div>
  )
}
