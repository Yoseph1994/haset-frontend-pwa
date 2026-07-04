import { apiClient, unwrap, unwrapPaginated } from './client'
import type { Contract, ContractEvent } from './types'

export function listContracts(page = 1) {
  return unwrapPaginated<Contract>(apiClient.get('/contracts', { params: { page } }))
}

export function getContract(id: string) {
  return unwrap<Contract>(apiClient.get(`/contracts/${id}`))
}

export function getContractEvents(id: string) {
  return unwrap<ContractEvent[]>(apiClient.get(`/contracts/${id}/events`))
}

export function completeContract(id: string) {
  return unwrap<Contract>(apiClient.put(`/contracts/${id}/complete`))
}

export function terminateContract(id: string, termination_reason: string) {
  return unwrap<Contract>(apiClient.put(`/contracts/${id}/terminate`, { termination_reason }))
}
