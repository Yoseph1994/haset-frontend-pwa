import { IonButton, IonContent, IonHeader, IonList, IonPage, IonSpinner, IonText, IonTitle, IonToolbar } from '@ionic/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { FormTextField } from '@/components/form/FormTextField'
import { FormSelectField } from '@/components/form/FormSelectField'
import { FormTagsField } from '@/components/form/FormTagsField'
import { FormTextareaField } from '@/components/form/FormTextareaField'
import { useCreateEmployeeProfile } from '@/hooks/useProfile'
import { ApiError } from '@/api/client'

const schema = z
  .object({
    job_category: z.string().min(1, 'Required').max(80),
    employment_type: z.enum(['gig', 'permanent', 'both'], { message: 'Required' }),
    skills: z.array(z.string()).min(1, 'Add at least one skill'),
    languages_spoken: z.array(z.string()).min(1, 'Add at least one language'),
    years_experience: z.union([z.number(), z.literal('')]).optional(),
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

type FormValues = z.infer<typeof schema>

export function EmployeeProfileSetupPage() {
  const createProfile = useCreateEmployeeProfile()
  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      job_category: '',
      employment_type: undefined,
      skills: [],
      languages_spoken: [],
      years_experience: '',
      bio: '',
      city: '',
      sub_city: '',
      expected_salary_min: '',
      expected_salary_max: '',
    },
  })

  const onSubmit = (values: FormValues) => {
    createProfile.mutate({
      ...values,
      years_experience: values.years_experience === '' ? null : Number(values.years_experience),
      expected_salary_min: values.expected_salary_min === '' ? null : Number(values.expected_salary_min),
      expected_salary_max: values.expected_salary_max === '' ? null : Number(values.expected_salary_max),
    })
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Set up your worker profile</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonText color="medium">
          <p>Tell hirers about your skills and experience. Your profile will be reviewed before it goes live.</p>
        </IonText>

        <form onSubmit={handleSubmit(onSubmit)}>
          <IonList inset>
            <FormTextField control={control} name="job_category" label="Job category" placeholder="e.g. Housekeeping" />
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
            <FormTagsField control={control} name="skills" label="Skills" placeholder="e.g. Cooking" />
            <FormTagsField control={control} name="languages_spoken" label="Languages spoken" placeholder="e.g. Amharic" />
            <FormTextField control={control} name="years_experience" label="Years of experience" type="number" />
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

          {createProfile.isError && (
            <IonText color="danger">
              <p className="ion-padding-horizontal">
                {createProfile.error instanceof ApiError ? createProfile.error.message : 'Something went wrong.'}
              </p>
            </IonText>
          )}

          <div className="ion-padding">
            <IonButton expand="block" type="submit" disabled={createProfile.isPending}>
              {createProfile.isPending ? <IonSpinner name="dots" /> : 'Continue'}
            </IonButton>
          </div>
        </form>
      </IonContent>
    </IonPage>
  )
}
