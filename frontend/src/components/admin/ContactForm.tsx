import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  usePerson,
  useCreatePerson,
  useUpdatePerson,
  useUploadPersonPhoto,
  useDeletePersonPhoto,
} from '../../api/people'
import { usePeople } from '../../api/people'
import { useHouses } from '../../api/houses'
import { personPhotoUrl } from '../../api/types'
import type { LabeledValueInput, Person, PersonInput, RelationshipInput } from '../../api/types'
import { homeAddress, personToInput } from '../../lib/people'
import Avatar from '../contacts/Avatar'
import LabeledValueListEditor from './LabeledValueListEditor'
import RelationshipEditor from './RelationshipEditor'

const emptyForm: PersonInput = {
  house_id: null,
  first_name: '',
  last_name: '',
  notes: '',
  moved_in: '',
}

const PHONE_LABELS = ['Mobil', 'Privat', 'Arbeit']
const EMAIL_LABELS = ['Privat', 'Arbeit']
const ADDRESS_LABELS = ['Arbeit', 'Ferienwohnung', 'Sonstiges']

function initialValues(person: Person | undefined) {
  const input = person ? personToInput(person) : null
  return {
    form: input
      ? {
          house_id: input.house_id,
          first_name: input.first_name,
          last_name: input.last_name ?? '',
          notes: input.notes ?? '',
          moved_in: input.moved_in ?? '',
        }
      : emptyForm,
    phones: input?.phones ?? [],
    emails: input?.emails ?? [],
    addresses: input?.addresses ?? [],
    relationships: input?.relationships ?? [],
  }
}

export default function ContactForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  // Das Formular übernimmt die Daten nur beim Start, und beim Speichern ersetzt es
  // die Beziehungen komplett. Deshalb erst nach einem frischen Laden anzeigen,
  // nicht schon mit veralteten Daten aus dem Cache.
  const { data: person, isFetchedAfterMount } = usePerson(isEdit ? Number(id) : undefined)

  if (isEdit && !isFetchedAfterMount) {
    return (
      <div className="admin-page">
        <p className="hint">Lädt…</p>
      </div>
    )
  }
  if (isEdit && !person) {
    return (
      <div className="admin-page">
        <p className="overlay-message overlay-message--error" style={{ position: 'static' }}>
          Kontakt nicht gefunden.
        </p>
      </div>
    )
  }
  return <ContactFormBody key={person?.id ?? 'new'} person={person} />
}

function ContactFormBody({ person }: { person: Person | undefined }) {
  const isEdit = person !== undefined
  const navigate = useNavigate()

  const { data: houses = [] } = useHouses()
  const { data: people = [] } = usePeople()
  const createPerson = useCreatePerson()
  const updatePerson = useUpdatePerson()
  const uploadPhoto = useUploadPersonPhoto()
  const deletePhoto = useDeletePersonPhoto()

  const [initial] = useState(() => initialValues(person))
  const [form, setForm] = useState<PersonInput>(initial.form)
  const [phones, setPhones] = useState<LabeledValueInput[]>(initial.phones)
  const [emails, setEmails] = useState<LabeledValueInput[]>(initial.emails)
  const [addresses, setAddresses] = useState<LabeledValueInput[]>(initial.addresses)
  const [relationships, setRelationships] = useState<RelationshipInput[]>(initial.relationships)
  const [error, setError] = useState<string | null>(null)
  const [photo, setPhoto] = useState<{ file: File; previewUrl: string } | null>(null)

  // Gibt die Vorschau-URL frei, sobald sie ersetzt wird oder das Formular verschwindet.
  useEffect(() => {
    if (!photo) return
    return () => URL.revokeObjectURL(photo.previewUrl)
  }, [photo])

  function handlePhotoChange(file: File | null) {
    setPhoto(file ? { file, previewUrl: URL.createObjectURL(file) } : null)
  }

  function handleChange<K extends keyof PersonInput>(key: K, value: PersonInput[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const input: PersonInput = { ...form, phones, emails, addresses, relationships }
    try {
      let personId: number
      if (person) {
        personId = person.id
        await updatePerson.mutateAsync({ id: personId, input })
      } else {
        const created = await createPerson.mutateAsync(input)
        personId = created.id
      }
      if (photo) {
        await uploadPhoto.mutateAsync({ id: personId, file: photo.file })
      }
      navigate('/admin/contacts')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function handleRemovePhoto() {
    if (!person) return
    if (confirm('Foto wirklich entfernen?')) {
      await deletePhoto.mutateAsync(person.id)
    }
  }

  const saving = createPerson.isPending || updatePerson.isPending || uploadPhoto.isPending
  const existingPhotoUrl = person ? personPhotoUrl(person) : null
  const selectedHouse = houses.find((h) => h.id === form.house_id) ?? null
  const houseAddress = homeAddress(selectedHouse)

  return (
    <div className="admin-page">
      <h2>{isEdit ? 'Kontakt bearbeiten' : 'Neuer Kontakt'}</h2>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Foto
          <div className="photo-picker">
            {photo ? (
              <img className="avatar avatar--large" src={photo.previewUrl} alt="" />
            ) : person ? (
              <Avatar person={person} size="large" />
            ) : (
              <span className="avatar avatar--large">?</span>
            )}
            <div className="photo-picker__actions">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handlePhotoChange(e.target.files?.[0] ?? null)}
              />
              {(existingPhotoUrl || photo) && isEdit && (
                <button type="button" className="link-button" onClick={handleRemovePhoto}>
                  Foto entfernen
                </button>
              )}
            </div>
          </div>
        </label>
        <label>
          Vorname *
          <input
            required
            value={form.first_name}
            onChange={(e) => handleChange('first_name', e.target.value)}
          />
        </label>
        <label>
          Nachname
          <input value={form.last_name ?? ''} onChange={(e) => handleChange('last_name', e.target.value)} />
        </label>
        <LabeledValueListEditor
          legend="Telefon"
          addLabel="Telefonnummer"
          items={phones}
          onChange={setPhones}
          labelSuggestions={PHONE_LABELS}
          valueType="tel"
        />
        <LabeledValueListEditor
          legend="E-Mail"
          addLabel="E-Mail-Adresse"
          items={emails}
          onChange={setEmails}
          labelSuggestions={EMAIL_LABELS}
          valueType="email"
        />
        <label>
          Haus
          <select
            value={form.house_id ?? ''}
            onChange={(e) => handleChange('house_id', e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">— nicht zugeordnet —</option>
            {houses.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </label>
        <LabeledValueListEditor
          legend="Adressen"
          addLabel="Adresse"
          items={addresses}
          onChange={setAddresses}
          labelSuggestions={selectedHouse ? ADDRESS_LABELS : ['Zuhause', ...ADDRESS_LABELS]}
          valuePlaceholder="Straße, PLZ Ort"
        >
          <p className="hint field-list__note">
            {selectedHouse
              ? houseAddress
                ? `🏠 Zuhause: ${houseAddress} (Adresse des Hauses „${selectedHouse.name}“)`
                : `🏠 Das Haus „${selectedHouse.name}“ hat noch keine Adresse. Sie wird als Zuhause-Adresse übernommen, sobald sie im Haus-Editor eingetragen ist.`
              : 'Ohne Haus gibt es keine Zuhause-Adresse. Bei Bedarf hier eine Adresse mit der Bezeichnung „Zuhause“ eintragen.'}
          </p>
        </LabeledValueListEditor>
        <RelationshipEditor
          selfId={person?.id}
          value={relationships}
          onChange={setRelationships}
          people={people}
        />
        <label>
          Seit wann
          <input
            placeholder="z.B. seit 2019"
            value={form.moved_in ?? ''}
            onChange={(e) => handleChange('moved_in', e.target.value)}
          />
        </label>
        <label>
          Notizen
          <textarea value={form.notes ?? ''} onChange={(e) => handleChange('notes', e.target.value)} />
        </label>
        {error && (
          <p className="overlay-message overlay-message--error" style={{ position: 'static' }}>
            {error}
          </p>
        )}
        <div className="form__actions">
          <button type="submit" disabled={saving}>
            {saving ? 'Speichert…' : 'Speichern'}
          </button>
          <button type="button" className="button--secondary" onClick={() => navigate('/admin/contacts')}>
            Abbrechen
          </button>
        </div>
      </form>
    </div>
  )
}
