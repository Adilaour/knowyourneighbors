import { useMemo, useState } from 'react'
import { useSettings, useUpdateSettings } from '../api/settings'
import type { Settings } from '../api/types'
import { usePeople } from '../api/people'
import { useHouses } from '../api/houses'
import { toCsv, downloadCsv } from '../lib/csv'
import { formatLabeledValue, fullName } from '../lib/people'

// Übernimmt die Einstellungen nur beim Start. Zum Neuladen mit anderen Werten
// die Komponente über `key` neu erzeugen.
function MapCenterForm({ settings }: { settings: Settings }) {
  const updateSettings = useUpdateSettings()
  const [lat, setLat] = useState(String(settings.map_center_lat))
  const [lng, setLng] = useState(String(settings.map_center_lng))
  const [zoom, setZoom] = useState(String(settings.map_zoom))
  const [saved, setSaved] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await updateSettings.mutateAsync({
      map_center_lat: Number(lat),
      map_center_lng: Number(lng),
      map_zoom: Number(zoom),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label>
        Breitengrad (Latitude)
        <input
          type="number"
          step="any"
          required
          value={lat}
          onChange={(e) => setLat(e.target.value)}
        />
      </label>
      <label>
        Längengrad (Longitude)
        <input
          type="number"
          step="any"
          required
          value={lng}
          onChange={(e) => setLng(e.target.value)}
        />
      </label>
      <label>
        Zoomstufe (1–19)
        <input
          type="number"
          step="1"
          min="1"
          max="19"
          required
          value={zoom}
          onChange={(e) => setZoom(e.target.value)}
        />
      </label>
      <div className="form__actions">
        <button type="submit" disabled={updateSettings.isPending}>
          {updateSettings.isPending ? 'Speichert…' : 'Speichern'}
        </button>
        {saved && <span className="hint">Gespeichert.</span>}
      </div>
      {updateSettings.isError && (
        <p className="overlay-message overlay-message--error" style={{ position: 'static' }}>
          {(updateSettings.error as Error).message}
        </p>
      )}
    </form>
  )
}

export default function SettingsPage() {
  // Das Formular überschreibt beim Speichern alle drei Werte, deshalb erst nach
  // einem frischen Laden anzeigen, nicht mit veralteten Daten aus dem Cache.
  const { data: settings, isFetchedAfterMount, isError } = useSettings()
  const ready = settings !== undefined && isFetchedAfterMount
  const { data: people = [] } = usePeople()
  const { data: houses = [] } = useHouses()

  const houseById = useMemo(() => new Map(houses.map((h) => [h.id, h])), [houses])
  const personById = useMemo(() => new Map(people.map((p) => [p.id, p])), [people])

  function handleExport() {
    const rows = people.map((p) => {
      const house = p.house_id ? houseById.get(p.house_id) : null
      return [
        p.first_name,
        p.last_name ?? '',
        p.phones.map(formatLabeledValue).join('; '),
        p.emails.map(formatLabeledValue).join('; '),
        house?.name ?? '',
        house?.address ?? '',
        p.moved_in ?? '',
        p.notes ?? '',
        p.addresses.map(formatLabeledValue).join('; '),
        p.relationships
          .map((r) => {
            const other = personById.get(r.other_person_id)
            return other ? `${r.label}: ${fullName(other)}` : ''
          })
          .filter(Boolean)
          .join('; '),
      ]
    })
    const csv = toCsv(
      [
        'Vorname',
        'Nachname',
        'Telefon',
        'E-Mail',
        'Haus',
        'Adresse',
        'Seit wann',
        'Notizen',
        'Weitere Adressen',
        'Beziehungen',
      ],
      rows
    )
    const date = new Date().toISOString().slice(0, 10)
    downloadCsv(`kontakte-${date}.csv`, csv)
  }

  return (
    <div className="admin-page">
      <h2>Einstellungen</h2>

      <section>
        <h3>Kartenzentrum</h3>
        <p className="hint">
          Bestimmt, wo die Karte beim Öffnen zentriert ist. Koordinaten findest du z.B. bei{' '}
          <a href="https://www.openstreetmap.org" target="_blank" rel="noreferrer">
            openstreetmap.org
          </a>{' '}
          per Rechtsklick auf den gewünschten Ort ("Adresse anzeigen").
        </p>
        {!ready && !isError && <p className="hint">Lädt…</p>}
        {isError && !settings && (
          <p className="overlay-message overlay-message--error" style={{ position: 'static' }}>
            Einstellungen konnten nicht geladen werden.
          </p>
        )}
        {ready && <MapCenterForm settings={settings} />}
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h3>Kontakte exportieren</h3>
        <p className="hint">Exportiert alle Kontakte inkl. zugeordnetem Haus, mehreren Telefonnummern, E-Mail-Adressen, weiteren Adressen und Beziehungen als CSV-Datei. "Adresse" ist die Adresse des Hauses.</p>
        <button type="button" onClick={handleExport} disabled={people.length === 0}>
          Als CSV exportieren
        </button>
      </section>
    </div>
  )
}
