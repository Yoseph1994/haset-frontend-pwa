import { apiClient, unwrap, unwrapPaginated } from './client'
import type { AppNotification } from './types'

export function listNotifications(page = 1) {
  return unwrapPaginated<AppNotification>(apiClient.get('/notifications', { params: { page } }))
}

export function markNotificationAsRead(id: string) {
  return unwrap<null>(apiClient.put(`/notifications/${id}/read`))
}

export function markAllNotificationsAsRead() {
  return unwrap<null>(apiClient.put('/notifications/read-all'))
}
