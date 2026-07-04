import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import type { RefresherCustomEvent } from '@ionic/react'
import { ellipse } from 'ionicons/icons'
import { useHistory } from 'react-router-dom'
import { useMarkAllNotificationsAsRead, useMarkNotificationAsRead, useNotifications } from '@/hooks/useNotifications'
import { EmptyState } from '@/components/EmptyState'
import { ErrorBanner } from '@/components/ErrorBanner'
import { formatDateTime } from '@/utils/format'
import type { AppNotification } from '@/api/types'

function messageFor(notification: AppNotification): string {
  return typeof notification.data.message === 'string' ? notification.data.message : 'You have a new notification.'
}

export function NotificationListPage() {
  const history = useHistory()
  const { data, isLoading, isError, refetch } = useNotifications()
  const markAsRead = useMarkNotificationAsRead()
  const markAllAsRead = useMarkAllNotificationsAsRead()

  const handleRefresh = async (e: RefresherCustomEvent) => {
    await refetch()
    e.detail.complete()
  }

  const handleClick = (notification: AppNotification) => {
    if (!notification.read_at) markAsRead.mutate(notification.id)

    const hiringRequestId = notification.data.hiring_request_id
    if (typeof hiringRequestId === 'string') {
      history.push(`/app/requests/${hiringRequestId}`)
    }
  }

  const unreadCount = data?.data.filter((n) => !n.read_at).length ?? 0

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Notifications</IonTitle>
          {unreadCount > 0 && (
            <IonButtons slot="end">
              <IonButton onClick={() => markAllAsRead.mutate()}>Mark all read</IonButton>
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {isLoading && (
          <div className="ion-text-center ion-padding">
            <IonSpinner name="dots" />
          </div>
        )}

        {isError && <ErrorBanner message="Couldn't load notifications." onRetry={() => void refetch()} />}

        {!isLoading && !isError && data?.data.length === 0 && <EmptyState message="You're all caught up" />}

        <IonList>
          {data?.data.map((notification) => (
            <IonItem key={notification.id} button onClick={() => handleClick(notification)}>
              {!notification.read_at && <IonIcon icon={ellipse} color="primary" style={{ fontSize: 8 }} slot="start" />}
              <IonLabel className="ion-text-wrap">
                <p>{messageFor(notification)}</p>
                <p>{formatDateTime(notification.created_at)}</p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  )
}
