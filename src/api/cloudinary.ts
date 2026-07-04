// Direct, unsigned client-side upload to Cloudinary. The file never passes
// through our Laravel backend — we only send the resulting URL + metadata to it.

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined

export interface CloudinaryUploadResult {
  secure_url: string
  public_id: string
  original_filename: string
  bytes: number
  format: string
  resource_type: string
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(CLOUD_NAME && UPLOAD_PRESET)
}

/**
 * Upload a file/blob to Cloudinary via an unsigned preset. Uses the `auto`
 * endpoint so it accepts both images (jpg/png/webp) and PDFs.
 */
export async function uploadToCloudinary(
  file: File | Blob,
  options?: { folder?: string },
): Promise<CloudinaryUploadResult> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      'Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in the frontend .env.',
    )
  }

  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', UPLOAD_PRESET)
  if (options?.folder) form.append('folder', options.folder)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
    method: 'POST',
    body: form,
  })

  if (!response.ok) {
    let detail = ''
    try {
      const body = await response.json()
      detail = body?.error?.message ?? ''
    } catch {
      // ignore parse failure
    }
    throw new Error(detail || `Upload failed (${response.status}). Check your Cloudinary preset.`)
  }

  return (await response.json()) as CloudinaryUploadResult
}
