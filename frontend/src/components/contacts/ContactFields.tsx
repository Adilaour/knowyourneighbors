import type { House, LabeledValue, Person } from '../../api/types'
import { homeAddress } from '../../lib/people'

interface ContactFieldsProps {
  person: Person
  house?: House | null
  // Auf der Karte steht die Hausadresse schon in der Überschrift.
  showHomeAddress?: boolean
}

function FieldLabel({ label }: { label: string | null }) {
  return label ? (
    <>
      <span className="contact-fields__label">{label}:</span>{' '}
    </>
  ) : null
}

function telHref(value: string): string | null {
  const digits = value.replace(/[^\d+]/g, '')
  return digits ? `tel:${digits}` : null
}

function PhoneItem({ phone }: { phone: LabeledValue }) {
  const href = telHref(phone.value)
  return (
    <li>
      📞 <FieldLabel label={phone.label} />
      {href ? <a href={href}>{phone.value}</a> : phone.value}
    </li>
  )
}

export default function ContactFields({ person, house, showHomeAddress = true }: ContactFieldsProps) {
  const home = showHomeAddress ? homeAddress(house) : null
  return (
    <ul className="contact-fields">
      {person.phones.map((phone) => (
        <PhoneItem key={phone.id} phone={phone} />
      ))}
      {person.emails.map((email) => (
        <li key={email.id}>
          ✉️ <FieldLabel label={email.label} />
          <a href={`mailto:${email.value}`}>{email.value}</a>
        </li>
      ))}
      {home && (
        <li>
          🏠 <FieldLabel label="Zuhause" />
          {home}
        </li>
      )}
      {person.addresses.map((address) => (
        <li key={address.id}>
          📍 <FieldLabel label={address.label} />
          {address.value}
        </li>
      ))}
    </ul>
  )
}
