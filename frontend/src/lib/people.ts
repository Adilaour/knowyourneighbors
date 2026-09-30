import type { House, LabeledValueInput, Person, PersonInput } from '../api/types'

export function fullName(person: Pick<Person, 'first_name' | 'last_name'>): string {
  return [person.first_name, person.last_name].filter(Boolean).join(' ')
}

// Die Zuhause-Adresse einer Person ist die Adresse des Hauses, in dem sie wohnt.
export function homeAddress(house: House | null | undefined): string | null {
  return house?.address?.trim() || null
}

// Nur die Stammdaten, ohne Listen. Für Änderungen, die Telefon, Adressen und
// Beziehungen unberührt lassen sollen (z.B. Haus zuweisen).
export function personScalarsToInput(person: Person): PersonInput {
  return {
    house_id: person.house_id,
    first_name: person.first_name,
    last_name: person.last_name,
    notes: person.notes,
    moved_in: person.moved_in,
  }
}

export function personToInput(person: Person): PersonInput {
  return {
    ...personScalarsToInput(person),
    phones: person.phones.map(({ label, value }) => ({ label, value })),
    emails: person.emails.map(({ label, value }) => ({ label, value })),
    addresses: person.addresses.map(({ label, value }) => ({ label, value })),
    relationships: person.relationships.map(
      ({ other_person_id, category, label, reverse_label }) => ({
        other_person_id,
        category,
        label,
        reverse_label,
      })
    ),
  }
}

export function formatLabeledValue(item: Pick<LabeledValueInput, 'label' | 'value'>): string {
  return item.label ? `${item.label}: ${item.value}` : item.value
}
