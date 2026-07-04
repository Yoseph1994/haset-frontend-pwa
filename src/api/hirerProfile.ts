import { apiClient, unwrap } from './client'
import { uploadToCloudinary } from './cloudinary'
import type { HirerProfile } from './types'

export interface HirerProfilePayload {
  hirer_type: 'individual' | 'company'
  company_name?: string | null
  company_tin?: string | null
  description?: string | null
  purpose_of_hire: string
  city: string
  sub_city?: string | null
  address_detail?: string | null
  alternate_phone?: string | null
}

export function getMyHirerProfile() {
  return unwrap<HirerProfile>(apiClient.get('/hirer/profile'))
}

export function createHirerProfile(payload: HirerProfilePayload) {
  return unwrap<HirerProfile>(apiClient.post('/hirer/profile', payload))
}

export function updateHirerProfile(payload: Partial<HirerProfilePayload>) {
  return unwrap<HirerProfile>(apiClient.put('/hirer/profile', payload))
}

export async function updateHirerPhoto(file: File | Blob) {
  const uploaded = await uploadToCloudinary(file, { folder: 'mams/photos' })
  return unwrap<{ profile_photo_url: string }>(
    apiClient.post('/hirer/profile/photo', { photo_url: uploaded.secure_url }),
  )
}
