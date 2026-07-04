import {
  IonAvatar,
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { personCircleOutline, settingsOutline } from 'ionicons/icons'
import { useRef } from 'react'
import { useHistory } from 'react-router-dom'
import { useMyProfile, useUpdateProfilePhoto } from '@/hooks/useProfile'
import { useSessionStore } from '@/store/session'
import { StatusBadge } from '@/components/StatusBadge'
import { ErrorBanner } from '@/components/ErrorBanner'
import { ReviewsList } from '@/components/ReviewsList'
import { DocumentsPanel } from '../onboarding/DocumentsPanel'
import type { EmployeeProfile } from '@/api/types'

function isEmployeeProfile(profile: unknown): profile is EmployeeProfile {
  return Boolean(profile && typeof profile === 'object' && 'skills' in profile)
}

export function MyProfilePage() {
  const history = useHistory()
  const user = useSessionStore((s) => s.user)
  const { data: profile, isLoading, isError, refetch } = useMyProfile()
  const updatePhoto = useUpdateProfilePhoto()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) updatePhoto.mutate(file)
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>My Profile</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => history.push('/app/profile/settings')}>
              <IonIcon icon={settingsOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="ion-text-center">
          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handlePhotoSelected} />
          <IonAvatar
            style={{ width: 96, height: 96, margin: '0 auto 8px', cursor: 'pointer' }}
            onClick={() => fileInputRef.current?.click()}
          >
            {user?.profile_photo_url ? (
              <img src={user.profile_photo_url} alt={user.name} />
            ) : (
              <IonIcon icon={personCircleOutline} style={{ width: '100%', height: '100%' }} />
            )}
          </IonAvatar>
          {updatePhoto.isPending && <IonSpinner name="dots" />}
          <h2 style={{ margin: 0 }}>{user?.name}</h2>
          <IonText color="medium">
            <p>{user?.email}</p>
          </IonText>
        </div>

        {isLoading && <IonSpinner name="dots" />}
        {isError && <ErrorBanner message="Couldn't load your profile." onRetry={() => void refetch()} />}

        {profile && (
          <>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '12px 0' }}>
              <IonText>Verification:</IonText>
              <StatusBadge status={profile.verification_status} />
            </div>

            <IonList inset>
              <IonItem>
                <IonLabel>
                  <p>City</p>
                  <h3>
                    {profile.city}
                    {profile.sub_city ? `, ${profile.sub_city}` : ''}
                  </h3>
                </IonLabel>
              </IonItem>

              {isEmployeeProfile(profile) && (
                <>
                  <IonItem>
                    <IonLabel>
                      <p>Job category</p>
                      <h3>{profile.job_category}</h3>
                    </IonLabel>
                  </IonItem>
                  <IonItem lines="none">
                    <IonLabel>
                      <p>Skills</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                        {profile.skills.map((skill) => (
                          <IonChip key={skill}>{skill}</IonChip>
                        ))}
                      </div>
                    </IonLabel>
                  </IonItem>
                </>
              )}
            </IonList>

            <IonButton expand="block" fill="outline" onClick={() => history.push('/app/profile/edit')}>
              Edit profile
            </IonButton>
          </>
        )}

        <DocumentsPanel />

        {user && <ReviewsList userId={user.id} />}
      </IonContent>
    </IonPage>
  )
}
