import { apiClient, unwrap, unwrapPaginated } from './client'
import type { Contract, ContractEvent, ContractTerms } from './types'

export function listContracts(page = 1) {
  return unwrapPaginated<Contract>(apiClient.get('/contracts', { params: { page } }))
}

export function getContract(id: string) {
  return unwrap<Contract>(apiClient.get(`/contracts/${id}`))
}

export function getContractEvents(id: string) {
  return unwrap<ContractEvent[]>(apiClient.get(`/contracts/${id}/events`))
}

/** Full human-readable terms for the Contract Review screen. */
export function getContractTerms(id: string) {
  return unwrap<ContractTerms>(apiClient.get(`/contracts/${id}/terms`))
}

/** Record the current user's agreement to the draft contract terms. */
export function agreeContract(id: string) {
  return unwrap<Contract>(apiClient.put(`/contracts/${id}/agree`))
}

/** Fetch the signed contract PDF as a binary blob. */
export async function fetchContractPdf(id: string): Promise<Blob> {
  const res = await apiClient.get(`/contracts/${id}/pdf`, { responseType: 'blob' })
  return res.data as Blob
}

export function completeContract(id: string) {
  return unwrap<Contract>(apiClient.put(`/contracts/${id}/complete`))
}

export function terminateContract(id: string, termination_reason: string) {
  return unwrap<Contract>(apiClient.put(`/contracts/${id}/terminate`, { termination_reason }))
}
