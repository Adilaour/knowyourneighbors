import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  usePerson,
  useCreatePerson,
  useUpdatePerson,
  useUploadPersonPhoto,
  useDeletePersonPhoto,
} from '../../api/people'
import { useHouses } from '../../api/houses'
import { personPhotoUrl } from '../../api/types'
import type { PersonInput } from '../../api/types'
import Avatar from '../contacts/Avatar'

const emptyForm: PersonInput = {
  house_id: null,
  first_name: '',
  last_name: '',
  phone: '',
  email: '',
  notes: '',
  moved_in: '',
}

export default function ContactForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const { data: person } = usePerson(isEdit ? Number(id) : undefined)
  const { data: houses = [] } = useHouses()
  const createPerson = useCreatePerson()
  const updatePerson = useUpdatePerson()
  const uploadPhoto = useUploadPersonPhoto()
  const deletePhoto = useDeletePersonPhoto()

  const [form, setForm] = useState<PersonInput>(emptyForm)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  useEffect(() => {
    if (person) {
      setForm({
        house_id: person.house_id,
        first_name: person.first_name,
        last_name: person.last_name ?? '',
        phone: person.phone ?? '',
        email: person.email ?? '',
        notes: person.notes ?? '',
        moved_in: person.moved_in ?? '',
      })
    }
  }, [person])

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview(null)
      return
    }
    const url = URL.createObjectURL(photoFile)
    setPhotoPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [photoFile])

  function handleChange<K extends keyof PersonInput>(key: K, value: PersonInput[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    let personId: number
    if (isEdit) {
      personId = Number(id)
      await updatePerson.mutateAsync({ id: personId, input: form })
    } else {
      const created = await createPerson.mutateAsync(form)
      personId = created.id
    }
    if (photoFile) {
      await uploadPhoto.mutateAsync({ id: personId, file: photoFile })
    }
    navigate('/admin/contacts')
  }

  async function handleRemovePhoto() {
    if (!isEdit) return
    if (confirm('Foto wirklich entfernen?')) {
      await deletePhoto.mutateAsync(Number(id))
    }
  }

  const saving = createPerson.isPending || updatePerson.isPending || uploadPhoto.isPending
  const existingPhotoUrl = person ? personPhotoUrl(person) : null

  return (
    <div className="admin-page">
      <h2>{isEdit ? 'Kontakt bearbeiten' : 'Neuer Kontakt'}</h2>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Foto
          <div className="photo-picker">
            {photoPreview ? (
              <img className="avatar avatar--large" src={photoPreview} alt="" />
            ) : person ? (
              <Avatar person={person} size="large" />
            ) : (
              <span className="avatar avatar--large">?</span>
            )}
            <div className="photo-picker__actions">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
              />
              {(existingPhotoUrl || photoFile) && isEdit && (
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
        <label>
          Telefon
          <input value={form.phone ?? ''} onChange={(e) => handleChange('phone', e.target.value)} />
        </label>
        <label>
          E-Mail
          <input
            type="email"
            value={form.email ?? ''}
            onChange={(e) => handleChange('email', e.target.value)}
          />
        </label>
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
