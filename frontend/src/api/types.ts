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

export interface Person {
  id: number
  house_id: number | null
  first_name: string
  last_name: string | null
  phone: string | null
  email: string | null
  notes: string | null
  moved_in: string | null
  created_at: string
  updated_at: string
}

export interface PersonInput {
  house_id?: number | null
  first_name: string
  last_name?: string | null
  phone?: string | null
  email?: string | null
  notes?: string | null
  moved_in?: string | null
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
