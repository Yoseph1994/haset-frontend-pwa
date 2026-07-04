import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonHeader,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { usePublicEmployeeProfile } from '@/hooks/useProfile'
import { useCreateHiringRequest, useHiringRequests } from '@/hooks/useHiringRequests'
import { useRouteParams } from '@/hooks/useRouteParams'
import { useVerification } from '@/hooks/useVerification'
import { ErrorBanner } from '@/components/ErrorBanner'
import { ReviewsList } from '@/components/ReviewsList'
import { VerificationBanner } from '@/components/VerificationBanner'
import { formatSalaryRange } from '@/utils/format'
import { ApiError } from '@/api/client'

export function EmployeePublicProfilePage() {
  const { id = '' } = useRouteParams<{ id: string }>('/app/employees/:id')
  const { data: profile, isLoading, isError, refetch } = usePublicEmployeeProfile(id)
  const createRequest = useCreateHiringRequest()
  const { data: myRequests } = useHiringRequests()
  const { isApproved } = useVerification()

  const alreadyInvited = myRequests?.data.some(
    (r) => r.employee_id === profile?.user_id && r.type === 'invitation' && r.status === 'pending',
  )

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/employees" />
          </IonButtons>
          <IonTitle>Worker profile</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {isLoading && <IonSpinner name="dots" />}
        {isError && <ErrorBanner message="Couldn't load this profile." onRetry={() => void refetch()} />}

        {profile && (
          <>
            <h1>{profile.user?.name}</h1>
            <IonText color="medium">
              <p>
                {profile.job_category} · {profile.city}
                {profile.sub_city ? `, ${profile.sub_city}` : ''}
              </p>
            </IonText>

            {profile.average_rating && (
              <IonText color="warning">
                <p>★ {Number(profile.average_rating).toFixed(1)} rating</p>
              </IonText>
            )}

            {profile.bio && <p>{profile.bio}</p>}

            <h3>Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {profile.skills.map((skill) => (
                <IonChip key={skill}>{skill}</IonChip>
              ))}
            </div>

            <h3>Languages</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {profile.languages_spoken.map((lang) => (
                <IonChip key={lang} outline>
                  {lang}
                </IonChip>
              ))}
            </div>

            {(profile.expected_salary_min || profile.expected_salary_max) && (
              <p style={{ fontWeight: 600 }}>
                Expected: {formatSalaryRange(profile.expected_salary_min, profile.expected_salary_max, profile.salary_currency)}
              </p>
            )}

            {!isApproved && <VerificationBanner action="invite workers" />}

            {isApproved && (
              <IonButton
                expand="block"
                disabled={createRequest.isPending || alreadyInvited}
                onClick={() => createRequest.mutate({ type: 'invitation', employee_id: profile.user_id })}
              >
                {alreadyInvited ? 'Invitation sent' : 'Invite to a job'}
              </IonButton>
            )}

            {createRequest.isError && (
              <IonText color="danger">
                <p>{createRequest.error instanceof ApiError ? createRequest.error.message : 'Could not send invite.'}</p>
              </IonText>
            )}

            <ReviewsList userId={profile.user_id} />
          </>
        )}
      </IonContent>
    </IonPage>
  )
}
