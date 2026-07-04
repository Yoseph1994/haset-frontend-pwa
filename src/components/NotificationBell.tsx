import { IonBadge, IonButton, IonIcon } from '@ionic/react'
import { notificationsOutline } from 'ionicons/icons'
import { useHistory } from 'react-router-dom'
import { useNotifications } from '@/hooks/useNotifications'

/** Top-bar notification bell with an unread badge. Place in a toolbar `slot="end"`. */
export function NotificationBell() {
  const history = useHistory()
  const { data } = useNotifications()
  const unread = data?.data.filter((n) => !n.read_at).length ?? 0

  return (
    <IonButton onClick={() => history.push('/app/notifications')} style={{ position: 'relative' }}>
      <IonIcon icon={notificationsOutline} slot="icon-only" />
      {unread > 0 && (
        <IonBadge
          color="danger"
          style={{
            position: 'absolute',
            top: 2,
            insetInlineEnd: 0,
            fontSize: 10,
            minWidth: 16,
            borderRadius: 8,
          }}
        >
          {unread > 9 ? '9+' : unread}
        </IonBadge>
      )}
    </IonButton>
  )
}
