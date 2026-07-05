import { apiClient, unwrap, unwrapPaginated } from './client'
import type { HiringRequest, HiringRequestType } from './types'

export function listHiringRequests(page = 1) {
  return unwrapPaginated<HiringRequest>(apiClient.get('/hiring-requests', { params: { page } }))
}

export function getHiringRequest(id: string) {
  return unwrap<HiringRequest>(apiClient.get(`/hiring-requests/${id}`))
}

export interface CreateHiringRequestPayload {
  type: HiringRequestType
  job_id?: string
  employee_id?: string
  message?: string
  proposed_salary?: number
  expires_at?: string
}

export function createHiringRequest(payload: CreateHiringRequestPayload) {
  return unwrap<HiringRequest>(apiClient.post('/hiring-requests', payload))
}

export function acceptHiringRequest(id: string, agreed_salary?: number) {
  return unwrap<HiringRequest>(apiClient.put(`/hiring-requests/${id}/accept`, { agreed_salary }))
}

export function rejectHiringRequest(id: string, rejected_reason?: string) {
  return unwrap<HiringRequest>(apiClient.put(`/hiring-requests/${id}/reject`, { rejected_reason }))
}

export function cancelHiringRequest(id: string) {
  return unwrap<HiringRequest>(apiClient.put(`/hiring-requests/${id}/cancel`))
}
