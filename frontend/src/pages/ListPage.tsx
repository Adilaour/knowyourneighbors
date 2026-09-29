import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { usePeople } from '../api/people'
import { useHouses } from '../api/houses'

export default function ListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedPersonId = searchParams.get('person') ? Number(searchParams.get('person')) : null
  const [query, setQuery] = useState('')

  const { data: people = [], isLoading, error } = usePeople()
  const { data: houses = [] } = useHouses()

  const houseById = useMemo(() => new Map(houses.map((h) => [h.id, h])), [houses])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return people
    return people.filter((p) => {
      const house = p.house_id ? houseById.get(p.house_id) : null
      return [p.first_name, p.last_name, p.phone, p.email, house?.name]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q))
    })
  }, [people, query, houseById])

  const selectedPerson = people.find((p) => p.id === selectedPersonId) ?? null
  const selectedHouse = selectedPerson?.house_id ? houseById.get(selectedPerson.house_id) : null

  function selectPerson(id: number) {
    setSearchParams(id === selectedPersonId ? {} : { person: String(id) })
  }

  return (
    <div className="list-page">
      <div className="list-page__list">
        <input
          type="search"
          placeholder="Suche nach Name, Haus, Telefon…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
        {isLoading && <p className="hint">Kontakte laden…</p>}
        {error && <p className="overlay-message overlay-message--error">Fehler beim Laden der Kontakte.</p>}
        <ul className="contact-list">
          {filtered.map((p) => {
            const house = p.house_id ? houseById.get(p.house_id) : null
            return (
              <li key={p.id}>
                <button
                  className={`contact-list__item ${p.id === selectedPersonId ? 'is-selected' : ''}`}
                  onClick={() => selectPerson(p.id)}
                >
                  <span className="contact-list__name">
                    {p.first_name} {p.last_name}
                  </span>
                  <span className="muted">{house ? house.name : 'nicht zugeordnet'}</span>
                </button>
              </li>
            )
          })}
          {filtered.length === 0 && !isLoading && <li className="hint">Keine Kontakte gefunden.</li>}
        </ul>
      </div>
      <aside className="list-page__detail">
        {!selectedPerson && <p className="hint">Wähle einen Kontakt aus der Liste.</p>}
        {selectedPerson && (
          <div>
            <h2>
              {selectedPerson.first_name} {selectedPerson.last_name}
            </h2>
            {selectedPerson.phone && <p>📞 {selectedPerson.phone}</p>}
            {selectedPerson.email && <p>✉️ {selectedPerson.email}</p>}
            {selectedPerson.moved_in && <p className="muted">{selectedPerson.moved_in}</p>}
            {selectedPerson.notes && (
              <p className="notes">
                <strong>Notizen:</strong> {selectedPerson.notes}
              </p>
            )}
            <p className="muted">
              Haus: {selectedHouse ? selectedHouse.name : 'nicht zugeordnet'}
            </p>
            {selectedHouse && (
              <Link className="button" to={`/map?house=${selectedHouse.id}`}>
                Auf Karte zeigen
              </Link>
            )}
          </div>
        )}
      </aside>
    </div>
  )
}
