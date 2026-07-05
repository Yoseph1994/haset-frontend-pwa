import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonHeader,
  IonList,
  IonItem,
  IonLabel,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  useIonAlert,
} from '@ionic/react'
import { useHistory } from 'react-router-dom'
import {
  useAcceptHiringRequest,
  useCancelHiringRequest,
  useHiringRequest,
  useRejectHiringRequest,
} from '@/hooks/useHiringRequests'
import { useRouteParams } from '@/hooks/useRouteParams'
import { useVerification } from '@/hooks/useVerification'
import { useSessionStore } from '@/store/session'
import { StatusBadge } from '@/components/StatusBadge'
import { ErrorBanner } from '@/components/ErrorBanner'
import { VerificationBanner } from '@/components/VerificationBanner'
import { formatDateTime } from '@/utils/format'
import { ApiError } from '@/api/client'

export function HiringRequestDetailPage() {
  const { id = '' } = useRouteParams<{ id: string }>('/app/requests/:id')
  const history = useHistory()
  const [presentAlert] = useIonAlert()
  const role = useSessionStore((s) => s.user?.role)
  const { isApproved } = useVerification()

  const { data: request, isLoading, isError, refetch } = useHiringRequest(id)
  const accept = useAcceptHiringRequest()
  const reject = useRejectHiringRequest()
  const cancel = useCancelHiringRequest()

  if (!request) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/app/activity" />
            </IonButtons>
            <IonTitle>Request details</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          {isLoading && <IonSpinner name="dots" />}
          {isError && <ErrorBanner message="Couldn't load this request." onRetry={() => void refetch()} />}
        </IonContent>
      </IonPage>
    )
  }

  const sentByMe =
    (request.type === 'application' && role === 'employee') || (request.type === 'invitation' && role === 'hirer')
  const isPending = request.status === 'pending'
  const mutationError = accept.error ?? reject.error ?? cancel.error

  const handleReject = () => {
    void presentAlert({
      header: 'Reject request',
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

  const handleAccept = () => {
    // Applications: the hirer is accepting, and must set the salary right here —
    // nothing upstream has one. Invitations already carry a proposed_salary set
    // by the hirer when the invite was sent, so the employee accepting doesn't
    // need to input anything.
    if (request.type !== 'application') {
      accept.mutate({ id })
      return
    }

    void presentAlert({
      header: 'Accept application',
      message: 'Enter the salary you\'re offering for this job.',
      inputs: [
        {
          name: 'salary',
          type: 'number',
          placeholder: 'Agreed salary (ETB)',
          value: request.job?.salary_min ?? undefined,
        },
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Accept',
          handler: (data: { salary?: string }) => {
            const salary = Number(data.salary)
            if (!data.salary || !(salary > 0)) return false
            accept.mutate({ id, agreedSalary: salary })
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
          <IonTitle>Request details</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <StatusBadge status={request.status} />
          <IonChip>{request.type}</IonChip>
        </div>

        {request.job && <h2>{request.job.title}</h2>}

        <IonList inset>
          <IonItem>
            <IonLabel>
              <p>Hirer</p>
              <h3>{request.hirer?.name}</h3>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              <p>Employee</p>
              <h3>{request.employee?.name}</h3>
            </IonLabel>
          </IonItem>
          {request.proposed_salary && (
            <IonItem>
              <IonLabel>
                <p>Proposed salary</p>
                <h3>{Number(request.proposed_salary).toLocaleString()}</h3>
              </IonLabel>
            </IonItem>
          )}
          <IonItem lines="none">
            <IonLabel>
              <p>Sent</p>
              <h3>{formatDateTime(request.created_at)}</h3>
            </IonLabel>
          </IonItem>
        </IonList>

        {request.message && (
          <>
            <h3>Message</h3>
            <p>{request.message}</p>
          </>
        )}

        {request.status === 'rejected' && request.rejected_reason && (
          <IonText color="danger">
            <p>Reason: {request.rejected_reason}</p>
          </IonText>
        )}

        {isPending && !sentByMe && !isApproved && <VerificationBanner action="respond to requests" />}

        {isPending && !sentByMe && isApproved && (
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <IonButton expand="block" disabled={accept.isPending} onClick={handleAccept}>
              Accept
            </IonButton>
            <IonButton expand="block" color="danger" fill="outline" disabled={reject.isPending} onClick={handleReject}>
              Reject
            </IonButton>
          </div>
        )}

        {isPending && sentByMe && (
          <IonButton
            expand="block"
            color="medium"
            fill="outline"
            disabled={cancel.isPending}
            onClick={() => cancel.mutate(id, { onSuccess: () => history.replace('/app/activity') })}
          >
            Cancel request
          </IonButton>
        )}

        {mutationError && (
          <IonText color="danger">
            <p>{mutationError instanceof ApiError ? mutationError.message : 'Something went wrong.'}</p>
          </IonText>
        )}
      </IonContent>
    </IonPage>
  )
}
