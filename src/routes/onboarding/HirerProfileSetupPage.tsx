import { IonButton, IonContent, IonHeader, IonList, IonPage, IonSpinner, IonText, IonTitle, IonToolbar } from '@ionic/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { FormTextField } from '@/components/form/FormTextField'
import { FormSelectField } from '@/components/form/FormSelectField'
import { FormTextareaField } from '@/components/form/FormTextareaField'
import { useCreateHirerProfile } from '@/hooks/useProfile'
import { ApiError } from '@/api/client'

const schema = z
  .object({
    hirer_type: z.enum(['individual', 'company'], { message: 'Required' }),
    company_name: z.string().max(200).optional(),
    company_tin: z.string().max(50).optional(),
    description: z.string().max(2000).optional(),
    purpose_of_hire: z.string().min(1, 'Required').max(2000),
    city: z.string().min(1, 'Required').max(100),
    sub_city: z.string().max(100).optional(),
    address_detail: z.string().max(500).optional(),
    alternate_phone: z
      .union([z.string().regex(/^\+251\d{9}$/, 'Format: +2519XXXXXXXX'), z.literal('')])
      .optional(),
  })
  .refine((data) => data.hirer_type !== 'company' || Boolean(data.company_name?.trim()), {
    message: 'Company name is required',
    path: ['company_name'],
  })

type FormValues = z.infer<typeof schema>

export function HirerProfileSetupPage() {
  const createProfile = useCreateHirerProfile()
  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      hirer_type: undefined,
      company_name: '',
      company_tin: '',
      description: '',
      purpose_of_hire: '',
      city: '',
      sub_city: '',
      address_detail: '',
      alternate_phone: '',
    },
  })

  const onSubmit = (values: FormValues) => {
    createProfile.mutate(values)
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Set up your hirer profile</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonText color="medium">
          <p>Tell us about your hiring needs. Your profile will be reviewed before you can post jobs.</p>
        </IonText>

        <form onSubmit={handleSubmit(onSubmit)}>
          <IonList inset>
            <FormSelectField
              control={control}
              name="hirer_type"
              label="Hirer type"
              options={[
                { value: 'individual', label: 'Individual' },
                { value: 'company', label: 'Company' },
              ]}
            />
            <FormTextField control={control} name="company_name" label="Company name" />
            <FormTextField control={control} name="company_tin" label="Company TIN" />
            <FormTextareaField control={control} name="purpose_of_hire" label="Purpose of hire" />
            <FormTextareaField control={control} name="description" label="Description" />
            <FormTextField control={control} name="city" label="City" />
            <FormTextField control={control} name="sub_city" label="Sub-city" />
            <FormTextField control={control} name="address_detail" label="Address detail" />
            <FormTextField control={control} name="alternate_phone" label="Alternate phone" type="tel" />
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
