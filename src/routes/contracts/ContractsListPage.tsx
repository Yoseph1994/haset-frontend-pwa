import {
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useContracts } from '@/hooks/useContracts'
import { useSessionStore } from '@/store/session'
import { NotificationBell } from '@/components/NotificationBell'
import { StatusBadge } from '@/components/StatusBadge'
import { EmptyState } from '@/components/EmptyState'
import { ErrorBanner } from '@/components/ErrorBanner'
import { formatDate } from '@/utils/format'
import type { ContractStatus } from '@/api/types'

type Tab = 'active' | 'completed' | 'ended'

const TAB_STATUSES: Record<Tab, ContractStatus[]> = {
  active: ['active', 'awaiting_payment'],
  completed: ['completed'],
  ended: ['terminated', 'cancelled'],
}

export function ContractsListPage() {
  const history = useHistory()
  const isHirer = useSessionStore((s) => s.user?.role === 'hirer')
  const [tab, setTab] = useState<Tab>('active')
  const { data, isLoading, isError, refetch } = useContracts()

  const filtered = data?.data.filter((c) => TAB_STATUSES[tab].includes(c.status)) ?? []

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Contracts</IonTitle>
          <IonButtons slot="end">
            <NotificationBell />
          </IonButtons>
        </IonToolbar>
        <IonToolbar>
          <IonSegment value={tab} onIonChange={(e) => setTab(e.detail.value as Tab)}>
            <IonSegmentButton value="active">
              <IonLabel>Active</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="completed">
              <IonLabel>Completed</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="ended">
              <IonLabel>Ended</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {isLoading && (
          <div className="ion-text-center ion-padding">
            <IonSpinner name="dots" />
          </div>
        )}

        {isError && <ErrorBanner message="Couldn't load contracts." onRetry={() => void refetch()} />}

        {!isLoading && !isError && filtered.length === 0 && <EmptyState message="No contracts here yet" />}

        <IonList>
          {filtered.map((c) => (
            <IonItem key={c.id} button detail onClick={() => history.push(`/app/contracts/${c.id}`)}>
              <IonLabel>
                <h2>{c.job?.title ?? 'Contract'}</h2>
                <p>{isHirer ? c.employee?.name : c.hirer?.name}</p>
                <p>
                  {Number(c.agreed_salary).toLocaleString()} {c.salary_currency}
                </p>
                <p>
                  {formatDate(c.start_date)}
                  {c.end_date ? ` → ${formatDate(c.end_date)}` : ''}
                </p>
              </IonLabel>
              <StatusBadge status={c.status} />
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  )
}
