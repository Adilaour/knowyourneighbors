import { personPhotoUrl } from '../../api/types'
import type { Person } from '../../api/types'

interface AvatarProps {
  person: Pick<Person, 'id' | 'first_name' | 'last_name' | 'photo_filename' | 'updated_at'>
  size?: 'small' | 'large'
}

function initials(person: AvatarProps['person']) {
  const first = person.first_name?.[0] ?? ''
  const last = person.last_name?.[0] ?? ''
  return (first + last).toUpperCase() || '?'
}

export default function Avatar({ person, size = 'small' }: AvatarProps) {
  const url = personPhotoUrl(person)
  const className = `avatar avatar--${size}`
  if (url) {
    return <img className={className} src={url} alt="" />
  }
  return <span className={className}>{initials(person)}</span>
}
