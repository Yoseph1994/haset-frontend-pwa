import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonList,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useHistory } from 'react-router-dom'
import { z } from 'zod'
import { FormTextField } from '@/components/form/FormTextField'
import { FormSelectField } from '@/components/form/FormSelectField'
import { FormTagsField } from '@/components/form/FormTagsField'
import { FormTextareaField } from '@/components/form/FormTextareaField'
import { useMyProfile, useUpdateEmployeeProfile, useUpdateHirerProfile } from '@/hooks/useProfile'
import { useSessionStore } from '@/store/session'
import { ApiError } from '@/api/client'
import type { EmployeeProfile, HirerProfile } from '@/api/types'

const employeeSchema = z
  .object({
    job_category: z.string().min(1, 'Required').max(80),
    employment_type: z.enum(['gig', 'permanent', 'both']),
    availability_status: z.enum(['available', 'assigned', 'on_leave', 'inactive']),
    skills: z.array(z.string()).min(1, 'Add at least one skill'),
    languages_spoken: z.array(z.string()).min(1, 'Add at least one language'),
    bio: z.string().max(2000).optional(),
    city: z.string().min(1, 'Required').max(100),
    sub_city: z.string().max(100).optional(),
    expected_salary_min: z.union([z.number(), z.literal('')]).optional(),
    expected_salary_max: z.union([z.number(), z.literal('')]).optional(),
  })
  .refine(
    (data) =>
      data.expected_salary_min === '' ||
      data.expected_salary_max === '' ||
      data.expected_salary_max === undefined ||
      data.expected_salary_min === undefined ||
      Number(data.expected_salary_max) >= Number(data.expected_salary_min),
    { message: 'Maximum must be at least the minimum', path: ['expected_salary_max'] },
  )

const hirerSchema = z.object({
  description: z.string().max(2000).optional(),
  purpose_of_hire: z.string().min(1, 'Required').max(2000),
  city: z.string().min(1, 'Required').max(100),
  sub_city: z.string().max(100).optional(),
  address_detail: z.string().max(500).optional(),
})

function EmployeeEditForm({ profile }: { profile: EmployeeProfile }) {
  const history = useHistory()
  const update = useUpdateEmployeeProfile()
  const { control, handleSubmit } = useForm<z.infer<typeof employeeSchema>>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      job_category: profile.job_category,
      employment_type: profile.employment_type,
      availability_status: profile.availability_status,
      skills: profile.skills,
      languages_spoken: profile.languages_spoken,
      bio: profile.bio ?? '',
      city: profile.city,
      sub_city: profile.sub_city ?? '',
      expected_salary_min: profile.expected_salary_min ? Number(profile.expected_salary_min) : '',
      expected_salary_max: profile.expected_salary_max ? Number(profile.expected_salary_max) : '',
    },
  })

  const onSubmit = (values: z.infer<typeof employeeSchema>) => {
    update.mutate(
      {
        ...values,
        expected_salary_min: values.expected_salary_min === '' ? null : Number(values.expected_salary_min),
        expected_salary_max: values.expected_salary_max === '' ? null : Number(values.expected_salary_max),
      },
      { onSuccess: () => history.goBack() },
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <IonList inset>
        <FormTextField control={control} name="job_category" label="Job category" />
        <FormSelectField
          control={control}
          name="employment_type"
          label="Employment type"
          options={[
            { value: 'gig', label: 'Gig / short-term' },
            { value: 'permanent', label: 'Permanent' },
            { value: 'both', label: 'Both' },
          ]}
        />
        <FormSelectField
          control={control}
          name="availability_status"
          label="Availability"
          options={[
            { value: 'available', label: 'Available' },
            { value: 'on_leave', label: 'On leave' },
            { value: 'inactive', label: 'Inactive' },
          ]}
        />
        <FormTagsField control={control} name="skills" label="Skills" />
        <FormTagsField control={control} name="languages_spoken" label="Languages spoken" />
        <FormTextareaField control={control} name="bio" label="About you" />
        <FormTextField control={control} name="city" label="City" />
        <FormTextField control={control} name="sub_city" label="Sub-city" />
        <FormTextField
          control={control}
          name="expected_salary_min"
          label="Minimum expected salary (ETB)"
          type="number"
        />
        <FormTextField
          control={control}
          name="expected_salary_max"
          label="Maximum expected salary (ETB)"
          type="number"
        />
      </IonList>

      {update.isError && (
        <IonText color="danger">
          <p className="ion-padding-horizontal">
            {update.error instanceof ApiError ? update.error.message : 'Something went wrong.'}
          </p>
        </IonText>
      )}

      <div className="ion-padding">
        <IonButton expand="block" type="submit" disabled={update.isPending}>
          {update.isPending ? <IonSpinner name="dots" /> : 'Save changes'}
        </IonButton>
      </div>
    </form>
  )
}

function HirerEditForm({ profile }: { profile: HirerProfile }) {
  const history = useHistory()
  const update = useUpdateHirerProfile()
  const { control, handleSubmit } = useForm<z.infer<typeof hirerSchema>>({
    resolver: zodResolver(hirerSchema),
    defaultValues: {
      description: profile.description ?? '',
      purpose_of_hire: profile.purpose_of_hire,
      city: profile.city,
      sub_city: profile.sub_city ?? '',
      address_detail: profile.address_detail ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit((values) => update.mutate(values, { onSuccess: () => history.goBack() }))}>
      <IonList inset>
        <FormTextareaField control={control} name="purpose_of_hire" label="Purpose of hire" />
        <FormTextareaField control={control} name="description" label="Description" />
        <FormTextField control={control} name="city" label="City" />
        <FormTextField control={control} name="sub_city" label="Sub-city" />
        <FormTextField control={control} name="address_detail" label="Address detail" />
      </IonList>

      {update.isError && (
        <IonText color="danger">
          <p className="ion-padding-horizontal">
            {update.error instanceof ApiError ? update.error.message : 'Something went wrong.'}
          </p>
        </IonText>
      )}

      <div className="ion-padding">
        <IonButton expand="block" type="submit" disabled={update.isPending}>
          {update.isPending ? <IonSpinner name="dots" /> : 'Save changes'}
        </IonButton>
      </div>
    </form>
  )
}

export function ProfileEditPage() {
  const role = useSessionStore((s) => s.user?.role)
  const { data: profile, isLoading } = useMyProfile()

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/profile" />
          </IonButtons>
          <IonTitle>Edit profile</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {isLoading && <IonSpinner name="dots" />}
        {profile && role === 'employee' && <EmployeeEditForm profile={profile as EmployeeProfile} />}
        {profile && role === 'hirer' && <HirerEditForm profile={profile as HirerProfile} />}
      </IonContent>
    </IonPage>
  )
}
