import { apiClient, unwrap } from './client'
import { uploadToCloudinary } from './cloudinary'
import type { EmployeeProfile, EmploymentType, ExperienceEntry } from './types'

export interface EmployeeProfilePayload {
  job_category: string
  employment_type: EmploymentType
  availability_status?: 'available' | 'assigned' | 'on_leave' | 'inactive'
  skills: string[]
  languages_spoken: string[]
  years_experience?: number | null
  bio?: string | null
  experience_history?: ExperienceEntry[] | null
  city: string
  sub_city?: string | null
  expected_salary_min?: number | null
  expected_salary_max?: number | null
  salary_currency?: string | null
}

export function getMyEmployeeProfile() {
  return unwrap<EmployeeProfile>(apiClient.get('/employee/profile'))
}

export function createEmployeeProfile(payload: EmployeeProfilePayload) {
  return unwrap<EmployeeProfile>(apiClient.post('/employee/profile', payload))
}

export function updateEmployeeProfile(payload: Partial<EmployeeProfilePayload>) {
  return unwrap<EmployeeProfile>(apiClient.put('/employee/profile', payload))
}

export function getPublicEmployeeProfile(id: string) {
  return unwrap<EmployeeProfile>(apiClient.get(`/employee/profile/${id}`))
}

export async function updateEmployeePhoto(file: File | Blob) {
  const uploaded = await uploadToCloudinary(file, { folder: 'mams/photos' })
  return unwrap<{ profile_photo_url: string }>(
    apiClient.post('/employee/profile/photo', { photo_url: uploaded.secure_url }),
  )
}
