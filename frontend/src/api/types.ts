export type LatLng = [number, number]

export interface House {
  id: number
  name: string
  address: string | null
  polygon: LatLng[]
  notes: string | null
  created_at: string
  updated_at: string
}

export interface HouseInput {
  name: string
  address?: string | null
  notes?: string | null
  polygon: LatLng[]
}

export interface LabeledValue {
  id: number
  label: string | null
  value: string
}

export type RelationshipCategory = 'family' | 'social'

// Beziehung aus Sicht der jeweiligen Person: `label` ist das, was die andere
// Person für diese Person ist (z.B. "Mutter"), `reverse_label` das, was diese
// Person für die andere ist (z.B. "Kind").
export interface Relationship {
  id: number
  other_person_id: number
  category: RelationshipCategory
  label: string
  reverse_label: string
}

export interface Person {
  id: number
  house_id: number | null
  first_name: string
  last_name: string | null
  notes: string | null
  moved_in: string | null
  photo_filename: string | null
  phones: LabeledValue[]
  emails: LabeledValue[]
  // Zusätzliche Adressen (Arbeit, ...). Die Zuhause-Adresse ist die Adresse des Hauses.
  addresses: LabeledValue[]
  relationships: Relationship[]
  created_at: string
  updated_at: string
}

export function personPhotoUrl(
  person: Pick<Person, 'id' | 'updated_at' | 'photo_filename'>
): string | null {
  if (!person.photo_filename) return null
  return `/api/people/${person.id}/photo?v=${encodeURIComponent(person.updated_at)}`
}

export interface LabeledValueInput {
  label?: string | null
  value: string
}

export interface RelationshipInput {
  other_person_id: number
  category: RelationshipCategory
  label: string
  reverse_label: string
}

// Die Listen sind optional: fehlt eine Liste, bleibt sie auf dem Server
// unverändert, eine vorhandene Liste ersetzt den bisherigen Stand.
export interface PersonInput {
  house_id?: number | null
  first_name: string
  last_name?: string | null
  notes?: string | null
  moved_in?: string | null
  phones?: LabeledValueInput[]
  emails?: LabeledValueInput[]
  addresses?: LabeledValueInput[]
  relationships?: RelationshipInput[]
}

export interface Settings {
  id: number
  map_center_lat: number
  map_center_lng: number
  map_zoom: number
  updated_at: string
}

export interface SettingsInput {
  map_center_lat: number
  map_center_lng: number
  map_zoom: number
}
