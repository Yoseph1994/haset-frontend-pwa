import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCheckbox,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonNote,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { checkmarkCircle, hourglassOutline, shieldCheckmarkOutline } from 'ionicons/icons'
import { useRef, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useContract, useContractTerms, useAgreeContract } from '@/hooks/useContracts'
import { useInitiatePayment, useMockCompletePayment } from '@/hooks/usePayment'
import { useRouteParams } from '@/hooks/useRouteParams'
import { useSessionStore } from '@/store/session'
import { ErrorBanner } from '@/components/ErrorBanner'
import { MockChapaModal } from '@/components/MockChapaModal'
import { launchChapaCheckout } from '@/utils/payment'
import { ApiError } from '@/api/client'
import type { ContractTerms } from '@/api/types'

export function ContractReviewPage() {
  const { id = '' } = useRouteParams<{ id: string }>('/app/contracts/:id/review')
  const history = useHistory()
  const isHirer = useSessionStore((s) => s.user?.role === 'hirer')

  const { data: contract, isLoading: loadingContract, isError, refetch } = useContract(id)
  const { data: terms, isLoading: loadingTerms } = useContractTerms(id)
  const agree = useAgreeContract()
  const initiatePayment = useInitiatePayment()
  const mockComplete = useMockCompletePayment()

  const [checked, setChecked] = useState(false)
  const [mockPaymentId, setMockPaymentId] = useState<string | null>(null)
  const paidContractId = useRef<string | null>(null)

  const myAgreedAt = isHirer ? contract?.hirer_agreed_at : contract?.employee_agreed_at
  const otherAgreedAt = isHirer ? contract?.employee_agreed_at : contract?.hirer_agreed_at
  const alreadyAgreed = Boolean(myAgreedAt)
  const isActive = contract?.status === 'active'

  const mutationError = agree.error ?? initiatePayment.error ?? mockComplete.error

  // ── Employee: confirm agreement, then wait ──
  const handleConfirmAgreement = () => {
    agree.mutate(id)
  }

  // ── Hirer: agree (if needed) then start payment ──
  const handleProceedToPayment = async () => {
    if (!contract) return
    if (!alreadyAgreed) {
      await agree.mutateAsync(id)
    }
    initiatePayment.mutate(contract.offer_id, {
      onSuccess: (payment) => {
        if (payment.mock) {
          paidContractId.current = null
          setMockPaymentId(payment.id)
        } else {
          void launchChapaCheckout(payment)
        }
      },
    })
  }

  const handleMockConfirm = async () => {
    if (!mockPaymentId) return
    const paid = await mockComplete.mutateAsync(mockPaymentId)
    paidContractId.current = paid.contract_id
  }

  const handleMockSuccess = () => {
    setMockPaymentId(null)
    history.replace(`/app/contracts/${paidContractId.current ?? id}`)
  }

  const busy = agree.isPending || initiatePayment.isPending

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/activity" />
          </IonButtons>
          <IonTitle>Contract Review</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {(loadingContract || loadingTerms) && <IonSpinner name="dots" />}
        {isError && <ErrorBanner message="Couldn't load this contract." onRetry={() => void refetch()} />}

        {contract && terms && (
          <>
            {/* Reference + status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <IonIcon icon={shieldCheckmarkOutline} color="success" />
              <IonText>
                <h2 style={{ margin: 0 }}>Contract #{terms.reference}</h2>
              </IonText>
            </div>
            <IonNote>Please review the terms below. Both parties must agree before any payment.</IonNote>

            <TermsBody terms={terms} />

            {/* Agreement status */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '16px 0' }}>
              <IonChip color={alreadyAgreed ? 'success' : 'medium'}>
                {alreadyAgreed ? 'You agreed ✓' : 'Your agreement pending'}
              </IonChip>
              <IonChip color={otherAgreedAt ? 'success' : 'medium'}>
                {otherAgreedAt ? `${isHirer ? 'Employee' : 'Hirer'} agreed ✓` : `${isHirer ? 'Employee' : 'Hirer'} pending`}
              </IonChip>
            </div>

            {isActive ? (
              <div style={{ textAlign: 'center', padding: 12 }}>
                <IonIcon icon={checkmarkCircle} color="success" style={{ fontSize: 48 }} />
                <p>This contract is active.</p>
                <IonButton expand="block" onClick={() => history.replace(`/app/contracts/${id}`)}>
                  View contract
                </IonButton>
              </div>
            ) : !isHirer && alreadyAgreed ? (
              // Employee has agreed → calm waiting state
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  padding: 16,
                  textAlign: 'center',
                }}
              >
                <IonIcon icon={hourglassOutline} color="warning" style={{ fontSize: 40 }} />
                <IonText>
                  <h3 style={{ margin: 0 }}>Waiting for the hirer's payment</h3>
                </IonText>
                <IonNote>You've agreed to the terms. Nothing more to do — we'll notify you once the hirer pays and your contract goes active.</IonNote>
              </div>
            ) : (
              <>
                {/* Agreement checkbox — required to proceed (unless already agreed) */}
                {!alreadyAgreed && (
                  <IonItemCheckbox checked={checked} onToggle={setChecked} />
                )}

                {isHirer ? (
                  <IonButton
                    expand="block"
                    disabled={(!alreadyAgreed && !checked) || busy}
                    onClick={() => void handleProceedToPayment()}
                  >
                    {busy ? <IonSpinner name="dots" /> : `Proceed to Payment · ${Number(contract.platform_fee_amount).toLocaleString()} ${contract.salary_currency}`}
                  </IonButton>
                ) : (
                  <IonButton expand="block" disabled={!checked || busy} onClick={handleConfirmAgreement}>
                    {busy ? <IonSpinner name="dots" /> : 'Confirm Agreement'}
                  </IonButton>
                )}
              </>
            )}

            {mutationError && (
              <IonText color="danger">
                <p>{mutationError instanceof ApiError ? mutationError.message : 'Something went wrong.'}</p>
              </IonText>
            )}
          </>
        )}
      </IonContent>

      {contract && (
        <MockChapaModal
          isOpen={mockPaymentId !== null}
          amount={Number(contract.platform_fee_amount).toLocaleString()}
          currency={contract.salary_currency}
          payeeName="HASET Payments"
          onConfirm={handleMockConfirm}
          onSuccess={handleMockSuccess}
          onDismiss={() => setMockPaymentId(null)}
        />
      )}
    </IonPage>
  )
}

/** The "I have read and agree" checkbox row. */
function IonItemCheckbox({ checked, onToggle }: { checked: boolean; onToggle: (v: boolean) => void }) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 4px',
        cursor: 'pointer',
      }}
    >
      <IonCheckbox checked={checked} onIonChange={(e) => onToggle(e.detail.checked)} />
      <span style={{ fontSize: 14 }}>I have read and agree to the terms of this contract.</span>
    </label>
  )
}

/** Renders the readable contract term sections. */
function TermsBody({ terms }: { terms: ContractTerms }) {
  return (
    <div style={{ marginTop: 14 }}>
      <Section title="Parties">
        <KV k="Hirer" v={terms.parties.hirer.name ?? '—'} />
        {terms.parties.hirer.company && <KV k="Company" v={terms.parties.hirer.company} />}
        <KV k="Employee" v={terms.parties.employee.name ?? '—'} />
      </Section>

      <Section title="Engagement">
        <KV k="Position" v={terms.job.title} />
        <KV k="Type" v={terms.job.employment_type} />
        {terms.dates.start && <KV k="Start date" v={terms.dates.start} />}
        {terms.dates.end && <KV k="End date" v={terms.dates.end} />}
        {terms.job.description && <KV k="Description" v={terms.job.description} />}
      </Section>

      <Section title="Compensation">
        <KV
          k="Agreed salary"
          v={`${terms.compensation.agreed_salary.toLocaleString()} ${terms.compensation.currency}`}
        />
        <KV
          k="Platform fee"
          v={`${terms.compensation.platform_fee_amount.toLocaleString()} ${terms.compensation.currency} (${terms.compensation.platform_fee_pct}%)`}
        />
        <p style={{ fontSize: 13, color: 'var(--ion-color-medium)', marginTop: 6 }}>{terms.compensation.breakdown}</p>
      </Section>

      <Section title="Hirer's Responsibilities">
        <Bullets items={terms.hirer_responsibilities} />
      </Section>
      <Section title="Employee's Responsibilities">
        <Bullets items={terms.employee_responsibilities} />
      </Section>

      <Section title="Termination & Notice">
        <Clause text={terms.termination} />
      </Section>
      <Section title="Dispute Resolution">
        <Clause text={terms.dispute_resolution} />
      </Section>
      <Section title="Platform Role & Liability">
        <Clause text={terms.platform_liability} />
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <h3
        style={{
          fontSize: 12,
          textTransform: 'uppercase',
          letterSpacing: 1,
          color: 'var(--ion-color-success)',
          borderBottom: '1px solid var(--ion-color-light-shade)',
          paddingBottom: 4,
          marginBottom: 8,
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  )
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '3px 0', fontSize: 14 }}>
      <span style={{ color: 'var(--ion-color-medium)' }}>{k}</span>
      <span style={{ fontWeight: 600, textAlign: 'right' }}>{v}</span>
    </div>
  )
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14 }}>
      {items.map((item, i) => (
        <li key={i} style={{ marginBottom: 4 }}>
          {item}
        </li>
      ))}
    </ul>
  )
}

function Clause({ text }: { text: string }) {
  return <p style={{ fontSize: 14, color: 'var(--ion-color-dark)', margin: 0 }}>{text}</p>
}
