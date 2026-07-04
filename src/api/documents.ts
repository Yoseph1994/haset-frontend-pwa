import { apiClient, unwrap, unwrapPaginated } from './client'
import { uploadToCloudinary } from './cloudinary'
import type { AppDocument, DocumentType, Paginated } from './types'

export function getMyDocuments(page = 1) {
  return unwrapPaginated<AppDocument>(apiClient.get('/documents', { params: { page } })) as Promise<
    Paginated<AppDocument>
  >
}

export interface UploadDocumentPayload {
  document_type: DocumentType
  file: File | Blob
  notes?: string
  expiry_date?: string
}

export async function uploadDocument(payload: UploadDocumentPayload) {
  // 1. Upload the raw file straight to Cloudinary (never touches our backend).
  const uploaded = await uploadToCloudinary(payload.file, { folder: 'mams/documents' })

  const fileFromInput = payload.file as File
  const fileName =
    fileFromInput.name ??
    `${uploaded.original_filename || 'document'}${uploaded.format ? `.${uploaded.format}` : ''}`

  // 2. Register the resulting URL + metadata with our backend.
  return unwrap<AppDocument>(
    apiClient.post('/documents', {
      document_type: payload.document_type,
      file_url: uploaded.secure_url,
      file_name: fileName,
      mime_type: fileFromInput.type || undefined,
      file_size_bytes: uploaded.bytes || fileFromInput.size || undefined,
      notes: payload.notes,
      expiry_date: payload.expiry_date,
    }),
  )
}

export function deleteDocument(id: string) {
  return unwrap<null>(apiClient.delete(`/documents/${id}`))
}
