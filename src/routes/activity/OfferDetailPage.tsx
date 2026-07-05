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
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  useIonAlert,
} from '@ionic/react'
import { useHistory } from 'react-router-dom'
import { useAcceptOffer, useOffer, useRejectOffer } from '@/hooks/useOffers'
import { useContracts } from '@/hooks/useContracts'
import { useRouteParams } from '@/hooks/useRouteParams'
import { useVerification } from '@/hooks/useVerification'
import { useSessionStore } from '@/store/session'
import { StatusBadge } from '@/components/StatusBadge'
import { ErrorBanner } from '@/components/ErrorBanner'
import { VerificationBanner } from '@/components/VerificationBanner'
import { formatDate, formatDateTime } from '@/utils/format'
import { ApiError } from '@/api/client'

export function OfferDetailPage() {
  const { id = '' } = useRouteParams<{ id: string }>('/app/offers/:id')
  const history = useHistory()
  const [presentAlert] = useIonAlert()
  const isHirer = useSessionStore((s) => s.user?.role === 'hirer')
  const isEmployee = useSessionStore((s) => s.user?.role === 'employee')
  const { isApproved } = useVerification()

  const { data: offer, isLoading, isError, refetch } = useOffer(id)
  const { data: contracts } = useContracts()
  const accept = useAcceptOffer()
  const reject = useRejectOffer()

  const canAct = isEmployee && offer?.status === 'pending' && isApproved
  // The draft contract created when the offer was accepted — both parties
  // review + agree there, and the hirer pays from there.
  const contractForOffer = contracts?.data.find((c) => c.offer_id === id)
  const contractId = offer?.contract_id ?? contractForOffer?.id ?? null
  const contractActive = contractForOffer?.status === 'active'
  // Hirer must review + agree + pay on the contract screen once the offer is accepted.
  const needsPayment = isHirer && offer?.status === 'accepted' && !contractActive
  const mutationError = accept.error ?? reject.error

  const goToReview = (cid: string) => history.push(`/app/contracts/${cid}/review`)

  const handleAccept = () => {
    accept.mutate(id, {
      // Straight into the contract review + agreement screen.
      onSuccess: (updated) => {
        if (updated.contract_id) goToReview(updated.contract_id)
      },
    })
  }

  const handleReject = () => {
    void presentAlert({
      header: 'Reject offer',
      inputs: [{ name: 'reason', type: 'text', placeholder: 'Reason (optional)' }],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Reject',
          role: 'destructive',
          handler: (data: { reason?: string }) => reject.mutate({ id, reason: data.reason }),
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
          <IonTitle>Offer details</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {isLoading && <IonSpinner name="dots" />}
        {isError && <ErrorBanner message="Couldn't load this offer." onRetry={() => void refetch()} />}

        {offer && (
          <>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
              <StatusBadge status={offer.status} />
              <IonChip>{offer.employment_type}</IonChip>
            </div>

            {offer.job && <h2>{offer.job.title}</h2>}

            <IonList inset>
              <IonItem>
                <IonLabel>
                  <p>Hirer</p>
                  <h3>{offer.hirer?.name}</h3>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <p>Employee</p>
                  <h3>{offer.employee?.name}</h3>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <p>Agreed salary</p>
                  <h3>
                    {Number(offer.agreed_salary).toLocaleString()} {offer.salary_currency}
                  </h3>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <p>Platform fee</p>
                  <h3>
                    {Number(offer.platform_fee_amount).toLocaleString()} {offer.salary_currency} (
                    {Number(offer.platform_fee_pct)}%)
                  </h3>
                </IonLabel>
              </IonItem>
              {offer.proposed_start_date && (
                <IonItem>
                  <IonLabel>
                    <p>Proposed start date</p>
                    <h3>{formatDate(offer.proposed_start_date)}</h3>
                  </IonLabel>
                </IonItem>
              )}
              <IonItem lines="none">
                <IonLabel>
                  <p>Sent</p>
                  <h3>{formatDateTime(offer.created_at)}</h3>
                </IonLabel>
              </IonItem>
            </IonList>

            {offer.terms_notes && (
              <>
                <h3>Terms</h3>
                <p>{offer.terms_notes}</p>
              </>
            )}

            {offer.status === 'rejected' && offer.rejected_reason && (
              <IonText color="danger">
                <p>Reason: {offer.rejected_reason}</p>
              </IonText>
            )}

            {isEmployee && offer.status === 'pending' && !isApproved && (
              <VerificationBanner action="accept offers" />
            )}

            {canAct && (
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <IonButton expand="block" disabled={accept.isPending} onClick={handleAccept}>
                  {accept.isPending ? <IonSpinner name="dots" /> : 'Accept & Review Contract'}
                </IonButton>
                <IonButton expand="block" color="danger" fill="outline" disabled={reject.isPending} onClick={handleReject}>
                  Reject
                </IonButton>
              </div>
            )}

            {/* Employee has accepted — send them to review/agree (or the waiting state). */}
            {isEmployee && offer.status === 'accepted' && !contractActive && contractId && (
              <IonButton expand="block" onClick={() => goToReview(contractId)}>
                Review contract
              </IonButton>
            )}

            {/* Hirer: review the agreed terms and pay to activate. */}
            {needsPayment && (
              <>
                <IonText color="medium">
                  <p>
                    The worker accepted this offer. Review the contract, agree to the terms, and pay the platform fee of{' '}
                    <strong>
                      {Number(offer.platform_fee_amount).toLocaleString()} {offer.salary_currency}
                    </strong>{' '}
                    to activate it.
                  </p>
                </IonText>
                <IonButton expand="block" disabled={!contractId} onClick={() => contractId && goToReview(contractId)}>
                  Review &amp; Pay
                </IonButton>
              </>
            )}

            {contractActive && contractId && (
              <IonButton expand="block" fill="outline" onClick={() => history.replace(`/app/contracts/${contractId}`)}>
                View contract
              </IonButton>
            )}

            {mutationError && (
              <IonText color="danger">
                <p>{mutationError instanceof ApiError ? mutationError.message : 'Something went wrong.'}</p>
              </IonText>
            )}
          </>
        )}
      </IonContent>
    </IonPage>
  )
}
