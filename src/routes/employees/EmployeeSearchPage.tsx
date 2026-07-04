import {
  IonBadge,
  IonChip,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSearchbar,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { useHistory } from 'react-router-dom'
import { useState } from 'react'
import { useEmployeeSearch } from '@/hooks/useEmployees'
import { EmptyState } from '@/components/EmptyState'
import { ErrorBanner } from '@/components/ErrorBanner'

export function EmployeeSearchPage() {
  const history = useHistory()
  const [jobCategory, setJobCategory] = useState('')
  const { data, isLoading, isError, refetch } = useEmployeeSearch(
    jobCategory ? { job_category: jobCategory, sort: 'rating_desc' } : { sort: 'rating_desc' },
  )

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Find Talent</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar
            placeholder="Search by job category"
            value={jobCategory}
            onIonInput={(e) => setJobCategory(e.detail.value ?? '')}
            debounce={400}
          />
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {isLoading && (
          <div className="ion-text-center ion-padding">
            <IonSpinner name="dots" />
          </div>
        )}

        {isError && <ErrorBanner message="Couldn't load workers." onRetry={() => void refetch()} />}

        {!isLoading && !isError && data?.data.length === 0 && <EmptyState message="No matching workers found" />}

        <IonList>
          {data?.data.map((profile) => (
            <IonItem key={profile.id} button detail onClick={() => history.push(`/app/employees/${profile.id}`)}>
              <IonLabel>
                <h2>{profile.user?.name ?? 'Worker'}</h2>
                <p>
                  {profile.job_category} · {profile.city}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                  {profile.skills.slice(0, 4).map((skill) => (
                    <IonChip key={skill} outline>
                      {skill}
                    </IonChip>
                  ))}
                </div>
              </IonLabel>
              {profile.average_rating && <IonBadge color="warning">★ {Number(profile.average_rating).toFixed(1)}</IonBadge>}
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  )
}
