import type { RelationshipCategory } from '../api/types'

export const CATEGORY_LABELS: Record<RelationshipCategory, string> = {
  family: 'Familie',
  social: 'Sozial / emotional',
}

// `label` ist das, was die andere Person für diese Person ist, `reverse` das,
// was diese Person für die andere ist. Die Gegenbezeichnung ist im Formular
// änderbar (z.B. "Kind" -> "Tochter").
export interface RelationshipTemplate {
  category: RelationshipCategory
  label: string
  reverse: string
}

export const RELATIONSHIP_TEMPLATES: RelationshipTemplate[] = [
  { category: 'family', label: 'Mutter', reverse: 'Kind' },
  { category: 'family', label: 'Vater', reverse: 'Kind' },
  { category: 'family', label: 'Tochter', reverse: 'Elternteil' },
  { category: 'family', label: 'Sohn', reverse: 'Elternteil' },
  { category: 'family', label: 'Schwester', reverse: 'Geschwister' },
  { category: 'family', label: 'Bruder', reverse: 'Geschwister' },
  { category: 'family', label: 'Ehepartner', reverse: 'Ehepartner' },
  { category: 'family', label: 'Partner', reverse: 'Partner' },
  { category: 'family', label: 'Großmutter', reverse: 'Enkelkind' },
  { category: 'family', label: 'Großvater', reverse: 'Enkelkind' },
  { category: 'family', label: 'Enkelin', reverse: 'Großelternteil' },
  { category: 'family', label: 'Enkel', reverse: 'Großelternteil' },
  { category: 'family', label: 'Tante', reverse: 'Nichte/Neffe' },
  { category: 'family', label: 'Onkel', reverse: 'Nichte/Neffe' },
  { category: 'family', label: 'Nichte', reverse: 'Onkel/Tante' },
  { category: 'family', label: 'Neffe', reverse: 'Onkel/Tante' },
  { category: 'family', label: 'Cousin/Cousine', reverse: 'Cousin/Cousine' },
  { category: 'social', label: 'Freund', reverse: 'Freund' },
  { category: 'social', label: 'Bester Freund', reverse: 'Bester Freund' },
  { category: 'social', label: 'Bekannter', reverse: 'Bekannter' },
  { category: 'social', label: 'Kollege', reverse: 'Kollege' },
  { category: 'social', label: 'Verbündeter', reverse: 'Verbündeter' },
  { category: 'social', label: 'Gegner', reverse: 'Gegner' },
  { category: 'social', label: 'Rivale', reverse: 'Rivale' },
  { category: 'social', label: 'Ex-Partner', reverse: 'Ex-Partner' },
]

export function templateKey(t: RelationshipTemplate): string {
  return `${t.category}|${t.label}|${t.reverse}`
}
