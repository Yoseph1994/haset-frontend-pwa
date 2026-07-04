import axios, { AxiosError } from 'axios'
import { Preferences } from '@capacitor/preferences'

export const AUTH_TOKEN_KEY = 'mams_auth_token'

export class ApiError extends Error {
  status: number
  errors: Record<string, string[]>

  constructor(message: string, status: number, errors: Record<string, string[]> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }

  /** First validation message for a given field, if any — handy for react-hook-form setError. */
  fieldError(field: string): string | undefined {
    return this.errors[field]?.[0]
  }
}

interface ApiEnvelope<T> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
  meta?: unknown
}

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

export const apiClient = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
  },
})

let onUnauthorized: (() => void) | null = null

/** Registered once from the session store so a 401 anywhere forces logout + redirect to auth. */
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

apiClient.interceptors.request.use(async (config) => {
  const { value: token } = await Preferences.get({ key: AUTH_TOKEN_KEY })

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiEnvelope<unknown>>) => {
    const status = error.response?.status ?? 0
    const body = error.response?.data

    if (status === 401) {
      onUnauthorized?.()
    }

    throw new ApiError(
      body?.message ?? error.message ?? 'Something went wrong. Please try again.',
      status,
      body?.errors ?? {},
    )
  },
)

/** Unwraps the `{ success, data }` envelope every non-paginated endpoint returns. */
export async function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  const { data: envelope } = await promise
  return envelope.data as T
}

/** Unwraps the `{ success, data, meta }` envelope paginated list endpoints return. */
export async function unwrapPaginated<T>(
  promise: Promise<{ data: ApiEnvelope<T[]> & { meta: import('./types').PaginationMeta } }>,
): Promise<import('./types').Paginated<T>> {
  const { data: envelope } = await promise
  return { data: envelope.data ?? [], meta: envelope.meta }
}
