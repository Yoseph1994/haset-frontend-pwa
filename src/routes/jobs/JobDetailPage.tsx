import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonHeader,
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
import { useJob, useDeleteJob } from '@/hooks/useJobs'
import { useCreateHiringRequest, useHiringRequests } from '@/hooks/useHiringRequests'
import { useRouteParams } from '@/hooks/useRouteParams'
import { useVerification } from '@/hooks/useVerification'
import { useSessionStore } from '@/store/session'
import { StatusBadge } from '@/components/StatusBadge'
import { ErrorBanner } from '@/components/ErrorBanner'
import { VerificationBanner } from '@/components/VerificationBanner'
import { formatSalaryRange } from '@/utils/format'
import { ApiError } from '@/api/client'

export function JobDetailPage() {
  const { id = '' } = useRouteParams<{ id: string }>('/app/jobs/:id')
  const history = useHistory()
  const [presentAlert] = useIonAlert()
  const user = useSessionStore((s) => s.user)
  const isHirer = user?.role === 'hirer'
  const { isApproved } = useVerification()

  const { data: job, isLoading, isError, refetch } = useJob(id)
  const deleteJob = useDeleteJob()
  const createRequest = useCreateHiringRequest()
  const { data: myRequests } = useHiringRequests()

  const isOwner = isHirer && job?.hirer_id === user?.id
  const alreadyApplied = myRequests?.data.some((r) => r.job_id === id && r.type === 'application')

  const handleDelete = () => {
    void presentAlert({
      header: 'Delete job posting?',
      message: 'This cannot be undone.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => deleteJob.mutate(id, { onSuccess: () => history.replace('/app/jobs') }),
        },
      ],
    })
  }

  const handleApply = () => {
    createRequest.mutate({ type: 'application', job_id: id })
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/jobs" />
          </IonButtons>
          <IonTitle>Job details</IonTitle>
          {isOwner && (
            <IonButtons slot="end">
              <IonButton onClick={() => history.push(`/app/jobs/${id}/edit`)}>Edit</IonButton>
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {isLoading && <IonSpinner name="dots" />}
        {isError && <ErrorBanner message="Couldn't load this job." onRetry={() => void refetch()} />}

        {job && (
          <>
            <h1>{job.title}</h1>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
              <StatusBadge status={job.status} />
              <IonChip>{job.employment_type}</IonChip>
              {job.is_remote && <IonChip color="primary">Remote</IonChip>}
            </div>

            <IonText color="medium">
              <p>
                {job.city}
                {job.sub_city ? `, ${job.sub_city}` : ''}
              </p>
            </IonText>

            <IonText>
              <p style={{ fontWeight: 600 }}>{formatSalaryRange(job.salary_min, job.salary_max, job.salary_currency)}</p>
            </IonText>

            {(job.positions_needed ?? 1) > 1 && (
              <IonText color="medium">
                <p>
                  {job.positions_filled ?? 0} of {job.positions_needed} positions filled
                  {(job.positions_remaining ?? 0) > 0 ? ` · ${job.positions_remaining} open` : ''}
                </p>
              </IonText>
            )}

            <p>{job.description}</p>

            {job.required_skills && job.required_skills.length > 0 && (
              <>
                <h3>Required skills</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {job.required_skills.map((skill) => (
                    <IonChip key={skill}>{skill}</IonChip>
                  ))}
                </div>
              </>
            )}

            <IonList inset>
              <IonLabel className="ion-padding">
                <p>Posted by {job.hirer?.name ?? 'a hirer'}</p>
              </IonLabel>
            </IonList>

            {isOwner && (
              <IonButton expand="block" color="danger" fill="outline" onClick={handleDelete}>
                Delete job
              </IonButton>
            )}

            {!isHirer && !isApproved && <VerificationBanner action="apply for jobs" />}

            {!isHirer && isApproved && (
              <IonButton
                expand="block"
                disabled={createRequest.isPending || alreadyApplied || job.status !== 'open'}
                onClick={handleApply}
              >
                {alreadyApplied ? 'Already applied' : job.status !== 'open' ? 'Job closed' : 'Apply'}
              </IonButton>
            )}

            {createRequest.isError && (
              <IonText color="danger">
                <p>{createRequest.error instanceof ApiError ? createRequest.error.message : 'Could not apply.'}</p>
              </IonText>
            )}
          </>
        )}
      </IonContent>
    </IonPage>
  )
}
