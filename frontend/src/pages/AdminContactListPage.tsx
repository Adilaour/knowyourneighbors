import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { usePeople, useDeletePerson } from '../api/people'
import { useHouses } from '../api/houses'

export default function AdminContactListPage() {
  const { data: people = [], isLoading } = usePeople()
  const { data: houses = [] } = useHouses()
  const deletePerson = useDeletePerson()

  const houseById = useMemo(() => new Map(houses.map((h) => [h.id, h])), [houses])

  function handleDelete(id: number, name: string) {
    if (confirm(`Kontakt "${name}" wirklich löschen?`)) {
      deletePerson.mutate(id)
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h2>Kontakte verwalten</h2>
        <Link className="button" to="/admin/contacts/new">
          + Neuer Kontakt
        </Link>
      </div>
      {isLoading && <p className="hint">Lädt…</p>}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Haus</th>
            <th>Telefon</th>
            <th>E-Mail</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {people.map((p) => (
            <tr key={p.id}>
              <td>
                {p.first_name} {p.last_name}
              </td>
              <td className="muted">{p.house_id ? houseById.get(p.house_id)?.name : '—'}</td>
              <td className="muted">{p.phone}</td>
              <td className="muted">{p.email}</td>
              <td className="admin-table__actions">
                <Link to={`/admin/contacts/${p.id}/edit`}>Bearbeiten</Link>
                <button
                  className="link-button"
                  onClick={() => handleDelete(p.id, `${p.first_name} ${p.last_name ?? ''}`.trim())}
                >
                  Löschen
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!isLoading && people.length === 0 && <p className="hint">Noch keine Kontakte angelegt.</p>}
    </div>
  )
}
