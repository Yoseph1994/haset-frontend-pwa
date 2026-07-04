import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import type { RefresherCustomEvent } from '@ionic/react'
import { addOutline } from 'ionicons/icons'
import { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useSessionStore } from '@/store/session'
import { useVerification } from '@/hooks/useVerification'
import { useMyProfile } from '@/hooks/useProfile'
import { useContracts } from '@/hooks/useContracts'
import { useOffers } from '@/hooks/useOffers'
import { useHiringRequests } from '@/hooks/useHiringRequests'
import { useJobs } from '@/hooks/useJobs'
import { useUserRatings } from '@/hooks/useRatings'
import { NotificationBell } from '@/components/NotificationBell'
import { StatusBadge } from '@/components/StatusBadge'
import { EmptyState } from '@/components/EmptyState'
import { RatingModal } from '../activity/RatingModal'
import { ActionCard } from './ActionCard'
import { StatTile } from './StatTile'
import { formatDate } from '@/utils/format'
import type { HiringRequest } from '@/api/types'

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function daysUntil(date: string): number {
  const diff = new Date(date).getTime() - Date.now()
  return Math.ceil(diff / 86_400_000)
}

export function DashboardPage() {
  const history = useHistory()
  const user = useSessionStore((s) => s.user)
  const isHirer = user?.role === 'hirer'

  const { isApproved, status: verStatus } = useVerification()
  const { data: profile } = useMyProfile()
  const { data: contractsPage } = useContracts()
  const { data: offersPage } = useOffers()
  const { data: requestsPage } = useHiringRequests()
  const { data: jobsPage, refetch: refetchJobs } = useJobs()

  const [dismissedRating, setDismissedRating] = useState(false)
  const [ratingOpen, setRatingOpen] = useState(false)

  const contracts = contractsPage?.data ?? []
  const offers = offersPage?.data ?? []
  const requests = requestsPage?.data ?? []

  const activeContracts = contracts.filter((c) => c.status === 'active')
  const completedContracts = contracts.filter((c) => c.status === 'completed')
  const latestCompleted = completedContracts[0]

  const otherPartyId = latestCompleted ? (isHirer ? latestCompleted.employee_id : latestCompleted.hirer_id) : ''
  const { data: otherRatings } = useUserRatings(otherPartyId)
  const alreadyRated = otherRatings?.data.some(
    (r) => r.contract_id === latestCompleted?.id && r.reviewer_id === user?.id,
  )
  const showRatingPrompt = Boolean(latestCompleted) && !alreadyRated && !dismissedRating

  const sentByMe = (r: HiringRequest) =>
    (r.type === 'application' && !isHirer) || (r.type === 'invitation' && isHirer)
  const receivedPending = requests.filter((r) => r.status === 'pending' && !sentByMe(r))

  const pendingOffers = offers.filter((o) => o.status === 'pending')
  const acceptedUnpaidOffers = offers.filter(
    (o) => o.status === 'accepted' && !contracts.some((c) => c.offer_id === o.id),
  )
  const endingSoon = activeContracts.filter((c) => {
    if (!c.end_date) return false
    const d = daysUntil(c.end_date)
    return d >= 0 && d <= 3
  })

  const openJobs = isHirer ? (jobsPage?.data.filter((j) => j.status === 'open').length ?? 0) : 0

  const handleRefresh = async (e: RefresherCustomEvent) => {
    await refetchJobs()
    e.detail.complete()
  }

  const goOffer = (list: typeof offers) =>
    list.length === 1 ? history.push(`/app/offers/${list[0].id}`) : history.push('/app/activity')

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Home</IonTitle>
          <IonButtons slot="end">
            <NotificationBell />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <h1 style={{ margin: '4px 0 16px' }}>
          {greeting()}, {user?.name?.split(' ')[0] ?? 'there'}
        </h1>

        {/* ── Action cards ── */}
        {!isApproved && (
          <ActionCard
            tone={verStatus === 'rejected' ? 'danger' : 'warning'}
            title={verStatus === 'rejected' ? 'Your documents were rejected' : 'Verification pending'}
            subtitle={
              verStatus === 'rejected'
                ? 'Re-upload your documents to get verified.'
                : 'Upload your documents so you can start.'
            }
            onClick={() => history.push('/app/profile')}
          />
        )}

        {receivedPending.length > 0 && (
          <ActionCard
            tone="danger"
            title={
              isHirer
                ? `${receivedPending.length} new application${receivedPending.length > 1 ? 's' : ''}`
                : `${receivedPending.length} new invitation${receivedPending.length > 1 ? 's' : ''}`
            }
            subtitle="Tap to review and respond."
            onClick={() => history.push('/app/activity')}
          />
        )}

        {!isHirer && pendingOffers.length > 0 && (
          <ActionCard
            tone="danger"
            title={`${pendingOffers.length} pending offer${pendingOffers.length > 1 ? 's' : ''}`}
            subtitle="Review the terms and accept or decline."
            onClick={() => goOffer(pendingOffers)}
          />
        )}

        {isHirer && acceptedUnpaidOffers.length > 0 && (
          <ActionCard
            tone="danger"
            title={`${acceptedUnpaidOffers.length} offer${acceptedUnpaidOffers.length > 1 ? 's' : ''} accepted — pay now`}
            subtitle="Pay the platform fee to activate the contract."
            onClick={() => goOffer(acceptedUnpaidOffers)}
          />
        )}

        {isHirer &&
          endingSoon.map((c) => (
            <ActionCard
              key={c.id}
              tone="warning"
              title={`Contract with ${c.employee?.name ?? 'a worker'} ending soon`}
              subtitle={`Ends ${formatDate(c.end_date)} — take action if needed.`}
              onClick={() => history.push(`/app/contracts/${c.id}`)}
            />
          ))}

        {showRatingPrompt && latestCompleted && (
          <ActionCard
            tone="success"
            title={`How was working with ${
              (isHirer ? latestCompleted.employee?.name : latestCompleted.hirer?.name) ?? 'them'
            }?`}
            subtitle="Leave a rating to help the community."
            onClick={() => setRatingOpen(true)}
            onDismiss={() => setDismissedRating(true)}
          />
        )}

        {/* ── Quick stats ── */}
        <div style={{ display: 'flex', gap: 8, margin: '16px 0' }}>
          <StatTile value={String(activeContracts.length)} label="Active" />
          {isHirer && <StatTile value={String(openJobs)} label="Open jobs" />}
          <StatTile
            value={profile?.average_rating ? `★ ${Number(profile.average_rating).toFixed(1)}` : '—'}
            label="Rating"
          />
          <StatTile
            value={String(
              (isHirer
                ? (profile as { total_hires?: number } | undefined)?.total_hires
                : (profile as { total_assignments?: number } | undefined)?.total_assignments) ?? 0,
            )}
            label={isHirer ? 'Hires' : 'Completed'}
          />
        </div>

        {isHirer && (
          <IonButton expand="block" onClick={() => history.push('/app/post-job')}>
            <IonIcon icon={addOutline} slot="start" />
            Post a new job
          </IonButton>
        )}

        {/* ── Active contracts ── */}
        <h2 style={{ fontSize: 18, margin: '20px 0 8px' }}>Active contracts</h2>
        {activeContracts.length === 0 ? (
          <EmptyState message="No active contracts yet" />
        ) : (
          <IonList inset>
            {activeContracts.map((c) => (
              <IonItem key={c.id} button detail onClick={() => history.push(`/app/contracts/${c.id}`)}>
                <IonLabel>
                  <h3>{c.job?.title ?? 'Contract'}</h3>
                  <p>{isHirer ? c.employee?.name : c.hirer?.name}</p>
                  <p>
                    {formatDate(c.start_date)}
                    {c.end_date ? ` → ${formatDate(c.end_date)}` : ''}
                  </p>
                </IonLabel>
                <StatusBadge status={c.status} />
              </IonItem>
            ))}
          </IonList>
        )}
      </IonContent>

      {latestCompleted && (
        <IonModal isOpen={ratingOpen} onDidDismiss={() => setRatingOpen(false)}>
          <RatingModal contractId={latestCompleted.id} onDismiss={() => setRatingOpen(false)} />
        </IonModal>
      )}
    </IonPage>
  )
}
