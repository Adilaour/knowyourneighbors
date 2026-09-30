import { useState } from 'react'

export interface HouseMetaValues {
  name: string
  address: string
  notes: string
}

interface HouseMetaFormProps {
  title: string
  // Gilt nur beim Start. Für andere Startwerte die Komponente über `key` neu erzeugen.
  initial?: HouseMetaValues
  submitLabel: string
  saving?: boolean
  onSubmit: (values: HouseMetaValues) => void
  onCancel: () => void
  onDelete?: () => void
}

const empty: HouseMetaValues = { name: '', address: '', notes: '' }

export default function HouseMetaForm({
  title,
  initial,
  submitLabel,
  saving,
  onSubmit,
  onCancel,
  onDelete,
}: HouseMetaFormProps) {
  const [values, setValues] = useState<HouseMetaValues>(initial ?? empty)

  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(values)
      }}
    >
      <h3>{title}</h3>
      <label>
        Name *
        <input
          required
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        />
      </label>
      <label>
        Adresse
        <input
          value={values.address}
          onChange={(e) => setValues((v) => ({ ...v, address: e.target.value }))}
        />
      </label>
      <label>
        Notizen
        <textarea
          value={values.notes}
          onChange={(e) => setValues((v) => ({ ...v, notes: e.target.value }))}
        />
      </label>
      <div className="form__actions">
        <button type="submit" disabled={saving}>
          {saving ? 'Speichert…' : submitLabel}
        </button>
        <button type="button" className="button--secondary" onClick={onCancel}>
          Abbrechen
        </button>
        {onDelete && (
          <button type="button" className="button--danger" onClick={onDelete}>
            Haus löschen
          </button>
        )}
      </div>
    </form>
  )
}
