import { useQuery } from '@tanstack/react-query'
import * as employeesApi from '@/api/employees'
import type { EmployeeSearchFilters } from '@/api/employees'

export function useEmployeeSearch(filters: EmployeeSearchFilters) {
  return useQuery({
    queryKey: ['employees', filters],
    queryFn: () => employeesApi.searchEmployees(filters),
  })
}
