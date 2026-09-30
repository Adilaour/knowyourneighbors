import { Link } from 'react-router-dom'
import type { Person, Relationship, RelationshipCategory } from '../../api/types'
import { fullName } from '../../lib/people'
import { CATEGORY_LABELS } from '../../lib/relationshipTemplates'
import Avatar from './Avatar'

interface RelationshipListProps {
  relationships: Relationship[]
  personById: Map<number, Person>
}

const CATEGORIES: RelationshipCategory[] = ['family', 'social']

export default function RelationshipList({ relationships, personById }: RelationshipListProps) {
  if (relationships.length === 0) return null
  return (
    <section className="relationship-section">
      <h3>Beziehungen</h3>
      {CATEGORIES.map((category) => {
        const items = relationships.filter((r) => r.category === category)
        if (items.length === 0) return null
        return (
          <div key={category}>
            <h4 className="relationship-section__category">{CATEGORY_LABELS[category]}</h4>
            <ul className="relationship-list">
              {items.map((rel) => {
                const other = personById.get(rel.other_person_id)
                if (!other) return null
                return (
                  <li key={rel.id} className="relationship-item">
                    <span className="relationship-item__label">{rel.label}</span>
                    <Link className="relationship-item__person" to={`/contacts?person=${other.id}`}>
                      <Avatar person={other} />
                      {fullName(other)}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </section>
  )
}
