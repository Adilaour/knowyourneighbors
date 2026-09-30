import { useMemo, useState } from 'react'
import type { Person, RelationshipCategory, RelationshipInput } from '../../api/types'
import { fullName } from '../../lib/people'
import {
  CATEGORY_LABELS,
  RELATIONSHIP_TEMPLATES,
  templateKey,
  type RelationshipTemplate,
} from '../../lib/relationshipTemplates'

interface RelationshipEditorProps {
  // Bei einem neuen Kontakt gibt es noch keine ID.
  selfId?: number
  value: RelationshipInput[]
  onChange: (next: RelationshipInput[]) => void
  people: Person[]
}

const CUSTOM = 'custom'
const CATEGORIES: RelationshipCategory[] = ['family', 'social']

export default function RelationshipEditor({ selfId, value, onChange, people }: RelationshipEditorProps) {
  const [choice, setChoice] = useState('')
  const [otherId, setOtherId] = useState('')
  const [category, setCategory] = useState<RelationshipCategory>('social')
  const [label, setLabel] = useState('')
  const [reverseLabel, setReverseLabel] = useState('')
  const [error, setError] = useState<string | null>(null)

  const candidates = useMemo(() => people.filter((p) => p.id !== selfId), [people, selfId])
  const personById = useMemo(() => new Map(people.map((p) => [p.id, p])), [people])

  // Vorlagen plus alles, was bei anderen Kontakten schon verwendet wird. Da jede
  // Beziehung bei beiden Personen erscheint, sind beide Richtungen enthalten.
  const suggestions = useMemo(() => {
    const byKey = new Map<string, RelationshipTemplate>()
    for (const t of RELATIONSHIP_TEMPLATES) byKey.set(templateKey(t), t)
    const used: RelationshipTemplate[] = []
    for (const person of people) {
      for (const rel of person.relationships) {
        const t = { category: rel.category, label: rel.label, reverse: rel.reverse_label }
        const key = templateKey(t)
        if (byKey.has(key)) continue
        byKey.set(key, t)
        used.push(t)
      }
    }
    used.sort((a, b) => a.label.localeCompare(b.label, 'de'))
    return { byKey, used }
  }, [people])

  function handleChoice(next: string) {
    setChoice(next)
    setError(null)
    if (next === CUSTOM) {
      setCategory('social')
      setLabel('')
      setReverseLabel('')
      return
    }
    const template = suggestions.byKey.get(next)
    if (template) {
      setCategory(template.category)
      setLabel(template.label)
      setReverseLabel(template.reverse)
    }
  }

  function handleAdd() {
    const item: RelationshipInput = {
      other_person_id: Number(otherId),
      category,
      label: label.trim(),
      reverse_label: reverseLabel.trim() || label.trim(),
    }
    const exists = value.some(
      (r) =>
        r.other_person_id === item.other_person_id &&
        r.category === item.category &&
        r.label === item.label &&
        r.reverse_label === item.reverse_label
    )
    if (exists) {
      setError('Diese Beziehung besteht bereits.')
      return
    }
    onChange([...value, item])
    setChoice('')
    setOtherId('')
    setLabel('')
    setReverseLabel('')
    setError(null)
  }

  function renderOptions(templates: RelationshipTemplate[]) {
    return templates.map((t) => (
      <option key={templateKey(t)} value={templateKey(t)}>
        {t.label}
      </option>
    ))
  }

  return (
    <fieldset className="field-list relationship-editor">
      <legend>Beziehungen</legend>

      {value.length === 0 && <p className="hint">Noch keine Beziehungen.</p>}
      <ul className="relationship-list">
        {value.map((rel, index) => {
          const other = personById.get(rel.other_person_id)
          return (
            <li key={index} className="relationship-item">
              <span className={`badge badge--${rel.category}`}>{CATEGORY_LABELS[rel.category]}</span>
              <span className="relationship-item__text">
                <strong>{rel.label}</strong>: {other ? fullName(other) : 'Unbekannt'}
                {rel.reverse_label !== rel.label && (
                  <span className="muted"> · für diese Person: {rel.reverse_label}</span>
                )}
              </span>
              <button
                type="button"
                className="link-button"
                onClick={() => onChange(value.filter((_, i) => i !== index))}
              >
                entfernen
              </button>
            </li>
          )
        })}
      </ul>

      <div className="relationship-editor__add">
        <div className="relationship-editor__pick">
          <select
            aria-label="Art der Beziehung"
            value={choice}
            onChange={(e) => handleChoice(e.target.value)}
          >
            <option value="">Art der Beziehung…</option>
            {CATEGORIES.map((c) => (
              <optgroup key={c} label={CATEGORY_LABELS[c]}>
                {renderOptions(RELATIONSHIP_TEMPLATES.filter((t) => t.category === c))}
              </optgroup>
            ))}
            {suggestions.used.length > 0 && (
              <optgroup label="Bereits verwendet">
                {suggestions.used.map((t) => (
                  <option key={templateKey(t)} value={templateKey(t)}>
                    {t.label} ({CATEGORY_LABELS[t.category]})
                  </option>
                ))}
              </optgroup>
            )}
            <option value={CUSTOM}>Eigene Beziehung…</option>
          </select>
          <select aria-label="Andere Person" value={otherId} onChange={(e) => setOtherId(e.target.value)}>
            <option value="">Person auswählen…</option>
            {candidates.map((p) => (
              <option key={p.id} value={p.id}>
                {fullName(p)}
              </option>
            ))}
          </select>
        </div>

        {choice && (
          <>
            <label>
              Die andere Person ist …
              <input
                placeholder="z.B. Mutter"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </label>
            <label>
              Diese Person ist für die andere …
              <input
                placeholder="z.B. Kind (leer = gleiche Bezeichnung)"
                value={reverseLabel}
                onChange={(e) => setReverseLabel(e.target.value)}
              />
            </label>
            {choice === CUSTOM && (
              <label>
                Kategorie
                <select value={category} onChange={(e) => setCategory(e.target.value as RelationshipCategory)}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_LABELS[c]}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </>
        )}

        {error && <p className="hint hint--error">{error}</p>}
        <div>
          <button
            type="button"
            className="button--secondary"
            disabled={!choice || !otherId || !label.trim()}
            onClick={handleAdd}
          >
            + Beziehung hinzufügen
          </button>
        </div>
      </div>
    </fieldset>
  )
}
