import {
  IonBadge,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { addOutline, locationOutline } from 'ionicons/icons'
import { useState } from 'react'
import { useHistory } from 'react-router-dom'
import type { RefresherCustomEvent } from '@ionic/react'
import { useJobs } from '@/hooks/useJobs'
import { useVerification } from '@/hooks/useVerification'
import { useSessionStore } from '@/store/session'
import { StatusBadge } from '@/components/StatusBadge'
import { EmptyState } from '@/components/EmptyState'
import { ErrorBanner } from '@/components/ErrorBanner'
import { VerificationBanner } from '@/components/VerificationBanner'
import { formatSalaryRange } from '@/utils/format'

export function JobListPage() {
  const history = useHistory()
  const isHirer = useSessionStore((s) => s.user?.role === 'hirer')
  const { isApproved } = useVerification()
  const [jobCategory, setJobCategory] = useState('')
  const { data, isLoading, isError, refetch } = useJobs(jobCategory ? { job_category: jobCategory } : {})

  const handleRefresh = async (e: RefresherCustomEvent) => {
    await refetch()
    e.detail.complete()
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{isHirer ? 'My Jobs' : 'Browse Jobs'}</IonTitle>
        </IonToolbar>
        {!isHirer && (
          <IonToolbar>
            <IonSearchbar
              placeholder="Search by category"
              value={jobCategory}
              onIonInput={(e) => setJobCategory(e.detail.value ?? '')}
              debounce={400}
            />
          </IonToolbar>
        )}
      </IonHeader>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {isHirer && !isApproved && (
          <div className="ion-padding-horizontal">
            <VerificationBanner action="post jobs" />
          </div>
        )}

        {isLoading && (
          <div className="ion-text-center ion-padding">
            <IonSpinner name="dots" />
          </div>
        )}

        {isError && <ErrorBanner message="Couldn't load jobs." onRetry={() => void refetch()} />}

        {!isLoading && !isError && data?.data.length === 0 && (
          <EmptyState message={isHirer ? "You haven't posted any jobs yet" : 'No jobs found'} />
        )}

        <IonList>
          {data?.data.map((job) => (
            <IonItem key={job.id} button detail onClick={() => history.push(`/app/jobs/${job.id}`)}>
              <IonLabel>
                <h2>{job.title}</h2>
                <p>
                  <IonIcon icon={locationOutline} style={{ verticalAlign: 'middle' }} /> {job.city}
                  {job.sub_city ? `, ${job.sub_city}` : ''}
                </p>
                <p>{formatSalaryRange(job.salary_min, job.salary_max, job.salary_currency)}</p>
                {(job.positions_needed ?? 1) > 1 && (
                  <p>
                    {job.positions_filled ?? 0}/{job.positions_needed} positions filled
                  </p>
                )}
                <IonBadge color="light" style={{ marginTop: 4 }}>
                  {job.job_category}
                </IonBadge>
              </IonLabel>
              <StatusBadge status={job.status} />
            </IonItem>
          ))}
        </IonList>

        {isHirer && isApproved && (
          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton onClick={() => history.push('/app/post-job')}>
              <IonIcon icon={addOutline} />
            </IonFabButton>
          </IonFab>
        )}
      </IonContent>
    </IonPage>
  )
}
