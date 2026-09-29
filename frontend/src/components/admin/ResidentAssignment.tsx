import { useState } from 'react'
import type { Person } from '../../api/types'

interface ResidentAssignmentProps {
  residents: Person[]
  unassignedPeople: Person[]
  onAssign: (personId: number) => void
  onUnassign: (personId: number) => void
}

export default function ResidentAssignment({
  residents,
  unassignedPeople,
  onAssign,
  onUnassign,
}: ResidentAssignmentProps) {
  const [selected, setSelected] = useState('')

  return (
    <div className="resident-assignment">
      <h3>Bewohner</h3>
      {residents.length === 0 && <p className="hint">Noch niemand zugeordnet.</p>}
      <ul className="resident-list">
        {residents.map((p) => (
          <li key={p.id} className="resident-card">
            <span>
              {p.first_name} {p.last_name}
            </span>
            <button className="link-button" onClick={() => onUnassign(p.id)}>
              entfernen
            </button>
          </li>
        ))}
      </ul>
      <div className="resident-assignment__add">
        <select value={selected} onChange={(e) => setSelected(e.target.value)}>
          <option value="">Kontakt auswählen…</option>
          {unassignedPeople.map((p) => (
            <option key={p.id} value={p.id}>
              {p.first_name} {p.last_name}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={!selected}
          onClick={() => {
            onAssign(Number(selected))
            setSelected('')
          }}
        >
          Hinzufügen
        </button>
      </div>
    </div>
  )
}
