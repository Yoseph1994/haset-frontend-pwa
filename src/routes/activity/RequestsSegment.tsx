import { IonChip, IonItem, IonLabel, IonList, IonSegment, IonSegmentButton, IonSpinner } from '@ionic/react'
import { useHistory } from 'react-router-dom'
import { useState } from 'react'
import { useHiringRequests } from '@/hooks/useHiringRequests'
import { useSessionStore } from '@/store/session'
import { StatusBadge } from '@/components/StatusBadge'
import { EmptyState } from '@/components/EmptyState'
import { ErrorBanner } from '@/components/ErrorBanner'
import { formatDate } from '@/utils/format'
import type { HiringRequest } from '@/api/types'

function isSentByMe(request: HiringRequest, role: string | undefined) {
  return (request.type === 'application' && role === 'employee') || (request.type === 'invitation' && role === 'hirer')
}

export function RequestsSegment() {
  const history = useHistory()
  const role = useSessionStore((s) => s.user?.role)
  const [segment, setSegment] = useState<'sent' | 'received'>('sent')
  const { data, isLoading, isError, refetch } = useHiringRequests()

  const filtered = data?.data.filter((r) => (segment === 'sent' ? isSentByMe(r, role) : !isSentByMe(r, role))) ?? []

  return (
    <>
      <IonSegment value={segment} onIonChange={(e) => setSegment(e.detail.value as 'sent' | 'received')}>
        <IonSegmentButton value="sent">
          <IonLabel>Sent</IonLabel>
        </IonSegmentButton>
        <IonSegmentButton value="received">
          <IonLabel>Received</IonLabel>
        </IonSegmentButton>
      </IonSegment>

      {isLoading && (
        <div className="ion-text-center ion-padding">
          <IonSpinner name="dots" />
        </div>
      )}

      {isError && <ErrorBanner message="Couldn't load requests." onRetry={() => void refetch()} />}

      {!isLoading && !isError && filtered.length === 0 && <EmptyState message="Nothing here yet" />}

      <IonList>
        {filtered.map((request) => (
          <IonItem key={request.id} button detail onClick={() => history.push(`/app/requests/${request.id}`)}>
            <IonLabel>
              <h2>{request.job?.title ?? (role === 'employee' ? request.hirer?.name : request.employee?.name)}</h2>
              <p>
                {segment === 'sent'
                  ? `To ${request.type === 'application' ? request.hirer?.name : request.employee?.name}`
                  : `From ${request.type === 'application' ? request.employee?.name : request.hirer?.name}`}
              </p>
              <p>{formatDate(request.created_at)}</p>
            </IonLabel>
            <IonChip>{request.type}</IonChip>
            <StatusBadge status={request.status} />
          </IonItem>
        ))}
      </IonList>
    </>
  )
}
