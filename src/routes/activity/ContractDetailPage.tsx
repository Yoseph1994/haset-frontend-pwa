import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  useIonAlert,
} from '@ionic/react'
import { useState } from 'react'
import { useCompleteContract, useContract, useContractEvents, useTerminateContract } from '@/hooks/useContracts'
import { usePayment } from '@/hooks/usePayment'
import { useUserRatings } from '@/hooks/useRatings'
import { useRouteParams } from '@/hooks/useRouteParams'
import { useSessionStore } from '@/store/session'
import { StatusBadge } from '@/components/StatusBadge'
import { ErrorBanner } from '@/components/ErrorBanner'
import { formatDate, formatDateTime } from '@/utils/format'
import { ApiError } from '@/api/client'
import { RatingModal } from './RatingModal'

export function ContractDetailPage() {
  const { id = '' } = useRouteParams<{ id: string }>('/app/contracts/:id')
  const [presentAlert] = useIonAlert()
  const [ratingModalOpen, setRatingModalOpen] = useState(false)
  const user = useSessionStore((s) => s.user)
  const isHirer = user?.role === 'hirer'

  const { data: contract, isLoading, isError, refetch } = useContract(id)
  const { data: events } = useContractEvents(id)
  const { data: payment } = usePayment(contract?.payment_id)
  const complete = useCompleteContract()
  const terminate = useTerminateContract()

  const otherPartyId = isHirer ? contract?.employee_id : contract?.hirer_id
  const { data: ratingsOfOtherParty } = useUserRatings(otherPartyId ?? '')
  const myRatingForThisContract = ratingsOfOtherParty?.data.find(
    (r) => r.contract_id === id && r.reviewer_id === user?.id,
  )

  const isActive = contract?.status === 'active'
  const canComplete = isHirer && isActive
  const canTerminate = isActive
  const canRate = contract?.status === 'completed' && !myRatingForThisContract
  const mutationError = complete.error ?? terminate.error

  const handleTerminate = () => {
    void presentAlert({
      header: 'Terminate contract',
      message: 'A reason is required.',
      inputs: [{ name: 'reason', type: 'text', placeholder: 'Termination reason' }],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Terminate',
          role: 'destructive',
          handler: (data: { reason?: string }) => {
            if (!data.reason?.trim()) return false
            terminate.mutate({ id, reason: data.reason.trim() })
            return true
          },
        },
      ],
    })
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/activity" />
          </IonButtons>
          <IonTitle>Contract</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {isLoading && <IonSpinner name="dots" />}
        {isError && <ErrorBanner message="Couldn't load this contract." onRetry={() => void refetch()} />}

        {contract && (
          <>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
              <StatusBadge status={contract.status} />
              <IonChip>{contract.employment_type}</IonChip>
            </div>

            {contract.job && <h2>{contract.job.title}</h2>}

            <IonList inset>
              <IonItem>
                <IonLabel>
                  <p>Hirer</p>
                  <h3>{contract.hirer?.name}</h3>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <p>Employee</p>
                  <h3>{contract.employee?.name}</h3>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <p>Agreed salary</p>
                  <h3>
                    {Number(contract.agreed_salary).toLocaleString()} {contract.salary_currency}
                  </h3>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <p>Start date</p>
                  <h3>{formatDate(contract.start_date)}</h3>
                </IonLabel>
              </IonItem>
              {contract.actual_end_date && (
                <IonItem lines="none">
                  <IonLabel>
                    <p>Ended</p>
                    <h3>{formatDate(contract.actual_end_date)}</h3>
                  </IonLabel>
                </IonItem>
              )}
            </IonList>

            {payment && (
              <IonList inset>
                <IonItem lines="none">
                  <IonLabel>
                    <p>Payment</p>
                    <h3>
                      {payment.status} — {Number(payment.amount).toLocaleString()} {payment.currency}
                    </h3>
                  </IonLabel>
                </IonItem>
              </IonList>
            )}

            {contract.terms_summary && (
              <>
                <h3>Terms</h3>
                <p>{contract.terms_summary}</p>
              </>
            )}

            {contract.status === 'terminated' && contract.termination_reason && (
              <IonText color="danger">
                <p>Termination reason: {contract.termination_reason}</p>
              </IonText>
            )}

            {events && events.length > 0 && (
              <>
                <h3>History</h3>
                <IonList inset>
                  {events.map((event) => (
                    <IonItem key={event.id} lines="inset">
                      <IonLabel className="ion-text-wrap">
                        <p>{event.description}</p>
                        <p>
                          {event.actor?.name ?? 'System'} · {formatDateTime(event.created_at)}
                        </p>
                      </IonLabel>
                    </IonItem>
                  ))}
                </IonList>
              </>
            )}

            {myRatingForThisContract && (
              <IonText color="medium">
                <p>You rated this contract {Number(myRatingForThisContract.rating)} / 5.</p>
              </IonText>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
              {canComplete && (
                <IonButton expand="block" disabled={complete.isPending} onClick={() => complete.mutate(id)}>
                  Mark complete
                </IonButton>
              )}
              {canTerminate && (
                <IonButton
                  expand="block"
                  color="danger"
                  fill="outline"
                  disabled={terminate.isPending}
                  onClick={handleTerminate}
                >
                  Terminate contract
                </IonButton>
              )}
              {canRate && (
                <IonButton expand="block" fill="outline" onClick={() => setRatingModalOpen(true)}>
                  Rate this contract
                </IonButton>
              )}
            </div>

            {mutationError && (
              <IonText color="danger">
                <p>{mutationError instanceof ApiError ? mutationError.message : 'Something went wrong.'}</p>
              </IonText>
            )}
          </>
        )}
      </IonContent>

      <IonModal isOpen={ratingModalOpen} onDidDismiss={() => setRatingModalOpen(false)}>
        <RatingModal contractId={id} onDismiss={() => setRatingModalOpen(false)} />
      </IonModal>
    </IonPage>
  )
}
