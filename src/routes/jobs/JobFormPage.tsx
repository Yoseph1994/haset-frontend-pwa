import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonList,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToggle,
  IonToolbar,
} from '@ionic/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useHistory } from 'react-router-dom'
import { z } from 'zod'
import { FormTextField } from '@/components/form/FormTextField'
import { FormSelectField } from '@/components/form/FormSelectField'
import { FormTagsField } from '@/components/form/FormTagsField'
import { FormTextareaField } from '@/components/form/FormTextareaField'
import { useCreateJob, useJob, useUpdateJob } from '@/hooks/useJobs'
import { useRouteParams } from '@/hooks/useRouteParams'
import { ApiError } from '@/api/client'

const schema = z.object({
  title: z.string().min(1, 'Required').max(200),
  description: z.string().min(1, 'Required').max(5000),
  job_category: z.string().min(1, 'Required').max(80),
  required_skills: z.array(z.string()).optional(),
  employment_type: z.enum(['gig', 'permanent', 'both'], { message: 'Required' }),
  salary_min: z.union([z.number(), z.literal('')]).optional(),
  salary_max: z.union([z.number(), z.literal('')]).optional(),
  salary_currency: z.string().max(5).optional(),
  positions_needed: z.union([z.number().min(1).max(100), z.literal('')]).optional(),
  city: z.string().min(1, 'Required').max(100),
  sub_city: z.string().max(100).optional(),
  is_remote: z.boolean().optional(),
  status: z.enum(['draft', 'open']),
})

type FormValues = z.infer<typeof schema>

export function JobFormPage() {
  const { id } = useRouteParams<{ id?: string }>('/app/jobs/:id/edit')
  const isEdit = Boolean(id)
  const history = useHistory()

  const { data: existingJob } = useJob(id ?? '')
  const createJob = useCreateJob()
  const updateJob = useUpdateJob()

  const { control, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      job_category: '',
      required_skills: [],
      employment_type: undefined,
      salary_min: '',
      salary_max: '',
      salary_currency: 'ETB',
      positions_needed: 1,
      city: '',
      sub_city: '',
      is_remote: false,
      status: 'open',
    },
  })

  useEffect(() => {
    if (existingJob) {
      reset({
        title: existingJob.title,
        description: existingJob.description,
        job_category: existingJob.job_category,
        required_skills: existingJob.required_skills ?? [],
        employment_type: existingJob.employment_type,
        salary_min: existingJob.salary_min ? Number(existingJob.salary_min) : '',
        salary_max: existingJob.salary_max ? Number(existingJob.salary_max) : '',
        salary_currency: existingJob.salary_currency ?? 'ETB',
        positions_needed: existingJob.positions_needed ?? 1,
        city: existingJob.city,
        sub_city: existingJob.sub_city ?? '',
        is_remote: existingJob.is_remote,
        status: existingJob.status === 'draft' ? 'draft' : 'open',
      })
    }
  }, [existingJob, reset])

  const mutation = isEdit ? updateJob : createJob

  const onSubmit = (values: FormValues) => {
    const payload = {
      ...values,
      salary_min: values.salary_min === '' ? null : Number(values.salary_min),
      salary_max: values.salary_max === '' ? null : Number(values.salary_max),
      positions_needed: values.positions_needed === '' || values.positions_needed == null ? 1 : Number(values.positions_needed),
    }

    if (isEdit && id) {
      updateJob.mutate({ id, payload }, { onSuccess: () => history.push(`/app/jobs/${id}`) })
    } else {
      createJob.mutate(payload, { onSuccess: (job) => history.push(`/app/jobs/${job.id}`) })
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/jobs" />
          </IonButtons>
          <IonTitle>{isEdit ? 'Edit job' : 'Post a job'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <form onSubmit={handleSubmit(onSubmit)}>
          <IonList inset>
            <FormTextField control={control} name="title" label="Job title" />
            <FormTextareaField control={control} name="description" label="Description" rows={6} />
            <FormTextField control={control} name="job_category" label="Job category" />
            <FormTagsField control={control} name="required_skills" label="Required skills" />
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
            <FormTextField control={control} name="salary_min" label="Minimum salary" type="number" />
            <FormTextField control={control} name="salary_max" label="Maximum salary" type="number" />
            <FormTextField control={control} name="salary_currency" label="Currency" />
            <FormTextField
              control={control}
              name="positions_needed"
              label="Positions needed"
              type="number"
              placeholder="How many people to hire"
            />
            <FormTextField control={control} name="city" label="City" />
            <FormTextField control={control} name="sub_city" label="Sub-city" />

            <Controller
              control={control}
              name="is_remote"
              render={({ field }) => (
                <IonItem>
                  <IonToggle checked={field.value} onIonChange={(e) => field.onChange(e.detail.checked)}>
                    Remote work
                  </IonToggle>
                </IonItem>
              )}
            />

            <FormSelectField
              control={control}
              name="status"
              label="Status"
              options={[
                { value: 'draft', label: 'Save as draft' },
                { value: 'open', label: 'Publish (open for applicants)' },
              ]}
            />
          </IonList>

          {mutation.isError && (
            <IonText color="danger">
              <p className="ion-padding-horizontal">
                {mutation.error instanceof ApiError ? mutation.error.message : 'Something went wrong.'}
              </p>
            </IonText>
          )}

          <div className="ion-padding">
            <IonButton expand="block" type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <IonSpinner name="dots" /> : isEdit ? 'Save changes' : 'Post job'}
            </IonButton>
          </div>
        </form>
      </IonContent>
    </IonPage>
  )
}
