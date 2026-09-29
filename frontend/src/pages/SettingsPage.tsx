import { useEffect, useMemo, useState } from 'react'
import { useSettings, useUpdateSettings } from '../api/settings'
import { usePeople } from '../api/people'
import { useHouses } from '../api/houses'
import { toCsv, downloadCsv } from '../lib/csv'

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings()
  const updateSettings = useUpdateSettings()
  const { data: people = [] } = usePeople()
  const { data: houses = [] } = useHouses()

  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [zoom, setZoom] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (settings) {
      setLat(String(settings.map_center_lat))
      setLng(String(settings.map_center_lng))
      setZoom(String(settings.map_zoom))
    }
  }, [settings])

  const houseById = useMemo(() => new Map(houses.map((h) => [h.id, h])), [houses])

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

  function handleExport() {
    const rows = people.map((p) => {
      const house = p.house_id ? houseById.get(p.house_id) : null
      return [
        p.first_name,
        p.last_name ?? '',
        p.phone ?? '',
        p.email ?? '',
        house?.name ?? '',
        house?.address ?? '',
        p.moved_in ?? '',
        p.notes ?? '',
      ]
    })
    const csv = toCsv(
      ['Vorname', 'Nachname', 'Telefon', 'E-Mail', 'Haus', 'Adresse', 'Seit wann', 'Notizen'],
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
        {isLoading && <p className="hint">Lädt…</p>}
        {!isLoading && (
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
        )}
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h3>Kontakte exportieren</h3>
        <p className="hint">Exportiert alle Kontakte inkl. zugeordnetem Haus als CSV-Datei.</p>
        <button type="button" onClick={handleExport} disabled={people.length === 0}>
          Als CSV exportieren
        </button>
      </section>
    </div>
  )
}
