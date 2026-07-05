import {
  IonBadge,
  IonChip,
  IonContent,
  IonHeader,
  IonInput,
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
import type { EmployeeSearchFilters } from '@/api/employees'

export function EmployeeSearchPage() {
  const history = useHistory()
  const [jobCategory, setJobCategory] = useState('')
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')

  const filters: EmployeeSearchFilters = { sort: 'rating_desc' }
  if (jobCategory) filters.job_category = jobCategory
  if (salaryMin) filters.salary_min = Number(salaryMin)
  if (salaryMax) filters.salary_max = Number(salaryMax)

  const { data, isLoading, isError, refetch } = useEmployeeSearch(filters)

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
        <IonToolbar>
          <div style={{ display: 'flex', gap: 8, padding: '0 12px 8px' }}>
            <IonInput
              fill="outline"
              type="number"
              placeholder="Min salary (ETB)"
              value={salaryMin}
              onIonInput={(e) => setSalaryMin(e.detail.value ?? '')}
              style={{ flex: 1 }}
            />
            <IonInput
              fill="outline"
              type="number"
              placeholder="Max salary (ETB)"
              value={salaryMax}
              onIonInput={(e) => setSalaryMax(e.detail.value ?? '')}
              style={{ flex: 1 }}
            />
          </div>
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
                {(profile.expected_salary_min || profile.expected_salary_max) && (
                  <p>
                    Expects: {profile.expected_salary_min ? Number(profile.expected_salary_min).toLocaleString() : '—'}
                    {' - '}
                    {profile.expected_salary_max ? Number(profile.expected_salary_max).toLocaleString() : '—'}{' '}
                    {profile.salary_currency ?? 'ETB'}
                  </p>
                )}
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
