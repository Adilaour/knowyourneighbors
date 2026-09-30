import { useId, type ReactNode } from 'react'
import type { LabeledValueInput } from '../../api/types'

interface LabeledValueListEditorProps {
  legend: string
  addLabel: string
  items: LabeledValueInput[]
  onChange: (items: LabeledValueInput[]) => void
  labelSuggestions: string[]
  valueType?: 'text' | 'tel' | 'email'
  valuePlaceholder?: string
  // Schreibgeschützter Inhalt oberhalb der Zeilen (z.B. die Adresse des Hauses)
  children?: ReactNode
}

const blankRow: LabeledValueInput = { label: '', value: '' }

export default function LabeledValueListEditor({
  legend,
  addLabel,
  items,
  onChange,
  labelSuggestions,
  valueType = 'text',
  valuePlaceholder,
  children,
}: LabeledValueListEditorProps) {
  const datalistId = useId()
  // Ohne Einträge steht eine leere Zeile bereit, damit man direkt lostippen kann.
  // Leere Zeilen werden beim Speichern vom Server verworfen.
  const rows = items.length > 0 ? items : [blankRow]

  function update(index: number, patch: Partial<LabeledValueInput>) {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  return (
    <fieldset className="field-list">
      <legend>{legend}</legend>
      {children}
      {rows.map((row, index) => (
        <div key={index} className="field-list__row">
          <input
            className="field-list__label"
            list={datalistId}
            placeholder="Bezeichnung"
            aria-label={`${legend}: Bezeichnung`}
            value={row.label ?? ''}
            onChange={(e) => update(index, { label: e.target.value })}
          />
          <input
            className="field-list__value"
            type={valueType}
            placeholder={valuePlaceholder}
            aria-label={`${legend}: Wert`}
            value={row.value}
            onChange={(e) => update(index, { value: e.target.value })}
          />
          {items.length > 0 && (
            <button
              type="button"
              className="link-button"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
            >
              entfernen
            </button>
          )}
        </div>
      ))}
      <datalist id={datalistId}>
        {labelSuggestions.map((label) => (
          <option key={label} value={label} />
        ))}
      </datalist>
      <div>
        <button
          type="button"
          className="button--secondary"
          onClick={() => onChange([...rows, { label: '', value: '' }])}
        >
          + {addLabel}
        </button>
      </div>
    </fieldset>
  )
}
