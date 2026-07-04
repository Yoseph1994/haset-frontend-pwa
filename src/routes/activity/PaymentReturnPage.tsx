import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { checkmarkCircle, closeCircle } from 'ionicons/icons'
import { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { usePayment, useVerifyPayment } from '@/hooks/usePayment'
import { clearPendingPayment, readPendingPaymentId } from '@/utils/payment'

export function PaymentReturnPage() {
  const history = useHistory()
  const [paymentId, setPaymentId] = useState<string | null | undefined>(undefined)
  const verify = useVerifyPayment()

  // Resolve the payment id stashed before the redirect, then verify once.
  useEffect(() => {
    let cancelled = false
    void (async () => {
      const id = await readPendingPaymentId()
      if (cancelled) return
      setPaymentId(id)
      if (id) verify.mutate(id)
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { data: payment } = usePayment(paymentId ?? undefined, { poll: true })
  const status = payment?.status

  useEffect(() => {
    if (status === 'completed') void clearPendingPayment()
  }, [status])

  const goToContract = () => {
    void clearPendingPayment()
    if (payment?.contract_id) {
      history.replace(`/app/contracts/${payment.contract_id}`)
    } else {
      history.replace('/app/activity')
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Payment</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            textAlign: 'center',
            minHeight: '70%',
          }}
        >
          {paymentId === null && (
            <>
              <IonText color="medium">
                <p>No payment in progress.</p>
              </IonText>
              <IonButton fill="outline" onClick={() => history.replace('/app/activity')}>
                Go to Activity
              </IonButton>
            </>
          )}

          {paymentId && status !== 'completed' && status !== 'failed' && (
            <>
              <IonSpinner name="crescent" />
              <IonText>
                <p>Confirming your payment…</p>
              </IonText>
              <IonText color="medium">
                <p style={{ fontSize: 13 }}>This can take a few seconds after you finish on Chapa.</p>
              </IonText>
            </>
          )}

          {status === 'completed' && (
            <>
              <IonIcon icon={checkmarkCircle} color="success" style={{ fontSize: 64 }} />
              <IonText>
                <h2>Payment successful</h2>
              </IonText>
              <IonText color="medium">
                <p>Your contract is now active.</p>
              </IonText>
              <IonButton expand="block" onClick={goToContract}>
                View contract
              </IonButton>
            </>
          )}

          {status === 'failed' && (
            <>
              <IonIcon icon={closeCircle} color="danger" style={{ fontSize: 64 }} />
              <IonText>
                <h2>Payment not completed</h2>
              </IonText>
              {payment?.failed_reason && (
                <IonText color="medium">
                  <p>{payment.failed_reason}</p>
                </IonText>
              )}
              <IonButton
                expand="block"
                fill="outline"
                onClick={() => {
                  void clearPendingPayment()
                  history.replace(payment?.offer_id ? `/app/offers/${payment.offer_id}` : '/app/activity')
                }}
              >
                Back to offer
              </IonButton>
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  )
}
