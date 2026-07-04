import { apiClient, unwrapPaginated } from './client'
import type { EmployeeProfile } from './types'

export interface EmployeeSearchFilters {
  job_category?: string
  employment_type?: 'gig' | 'permanent' | 'both'
  city?: string
  sub_city?: string
  availability_status?: 'available' | 'on_leave'
  skills?: string[]
  salary_min?: number
  salary_max?: number
  min_rating?: number
  sort?: 'rating_desc' | 'experience_desc' | 'newest'
  per_page?: number
  page?: number
}

export function searchEmployees(filters: EmployeeSearchFilters = {}) {
  return unwrapPaginated<EmployeeProfile>(apiClient.get('/employees', { params: filters }))
}
