import { IonItem, IonLabel, IonList, IonSpinner } from '@ionic/react'
import { useHistory } from 'react-router-dom'
import { useOffers } from '@/hooks/useOffers'
import { useSessionStore } from '@/store/session'
import { StatusBadge } from '@/components/StatusBadge'
import { EmptyState } from '@/components/EmptyState'
import { ErrorBanner } from '@/components/ErrorBanner'
import { formatDate } from '@/utils/format'

export function OffersSegment() {
  const history = useHistory()
  const role = useSessionStore((s) => s.user?.role)
  const { data, isLoading, isError, refetch } = useOffers()

  return (
    <>
      {isLoading && (
        <div className="ion-text-center ion-padding">
          <IonSpinner name="dots" />
        </div>
      )}

      {isError && <ErrorBanner message="Couldn't load offers." onRetry={() => void refetch()} />}

      {!isLoading && !isError && data?.data.length === 0 && <EmptyState message="No offers yet" />}

      <IonList>
        {data?.data.map((offer) => (
          <IonItem key={offer.id} button detail onClick={() => history.push(`/app/offers/${offer.id}`)}>
            <IonLabel>
              <h2>{offer.job?.title ?? 'Offer'}</h2>
              <p>{role === 'employee' ? offer.hirer?.name : offer.employee?.name}</p>
              <p>
                {Number(offer.agreed_salary).toLocaleString()} {offer.salary_currency}
              </p>
              <p>{formatDate(offer.created_at)}</p>
            </IonLabel>
            <StatusBadge status={offer.status} />
          </IonItem>
        ))}
      </IonList>
    </>
  )
}
