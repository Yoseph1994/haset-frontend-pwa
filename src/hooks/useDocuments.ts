import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as documentsApi from '@/api/documents'

export function useMyDocuments() {
  return useQuery({
    queryKey: ['documents'],
    queryFn: () => documentsApi.getMyDocuments(),
  })
}

export function useUploadDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: documentsApi.uploadDocument,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: documentsApi.deleteDocument,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  })
}
