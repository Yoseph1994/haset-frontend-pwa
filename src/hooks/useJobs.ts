import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as jobsApi from '@/api/jobs'
import type { JobListFilters, JobPayload } from '@/api/jobs'

export function useJobs(filters: JobListFilters = {}) {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => jobsApi.listJobs(filters),
  })
}

export function useJob(id: string) {
  return useQuery({
    queryKey: ['jobs', id],
    queryFn: () => jobsApi.getJob(id),
    enabled: Boolean(id),
  })
}

export function useCreateJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: jobsApi.createJob,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
  })
}

export function useUpdateJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<JobPayload> }) => jobsApi.updateJob(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
  })
}

export function useDeleteJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: jobsApi.deleteJob,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
  })
}
