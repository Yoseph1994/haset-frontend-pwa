import { apiClient, unwrap, unwrapPaginated } from './client'
import type { EmploymentType, JobPosting, JobStatus } from './types'

export interface JobListFilters {
  job_category?: string
  employment_type?: EmploymentType
  city?: string
  sub_city?: string
  is_remote?: boolean
  per_page?: number
  page?: number
}

export function listJobs(filters: JobListFilters = {}) {
  return unwrapPaginated<JobPosting>(apiClient.get('/jobs', { params: filters }))
}

export function getJob(id: string) {
  return unwrap<JobPosting>(apiClient.get(`/jobs/${id}`))
}

export interface JobPayload {
  title: string
  description: string
  job_category: string
  required_skills?: string[]
  employment_type: EmploymentType
  salary_min?: number | null
  salary_max?: number | null
  salary_currency?: string
  duration_days?: number | null
  positions_needed?: number
  city: string
  sub_city?: string | null
  is_remote?: boolean
  status?: Extract<JobStatus, 'draft' | 'open'>
  expires_at?: string | null
}

export function createJob(payload: JobPayload) {
  return unwrap<JobPosting>(apiClient.post('/jobs', payload))
}

export function updateJob(id: string, payload: Partial<JobPayload>) {
  return unwrap<JobPosting>(apiClient.put(`/jobs/${id}`, payload))
}

export function deleteJob(id: string) {
  return unwrap<null>(apiClient.delete(`/jobs/${id}`))
}
