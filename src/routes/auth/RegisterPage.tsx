import {
  IonButton,
  IonContent,
  IonHeader,
  IonList,
  IonPage,
  IonRouterLink,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { FormTextField } from '@/components/form/FormTextField'
import { FormSelectField } from '@/components/form/FormSelectField'
import { useRegister } from '@/hooks/useAuth'
import { ApiError } from '@/api/client'

const schema = z
  .object({
    name: z.string().min(1, 'Name is required').max(150),
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
    phone_number: z
      .string()
      .regex(/^\+251\d{9}$/, 'Format: +2519XXXXXXXX'),
    password: z.string().min(8, 'At least 8 characters'),
    password_confirmation: z.string(),
    role: z.enum(['employee', 'hirer'], { message: 'Choose whether you are hiring or looking for work' }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })

type FormValues = z.infer<typeof schema>

export function RegisterPage() {
  const registerMutation = useRegister()
  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      phone_number: '+251',
      password: '',
      password_confirmation: '',
      role: undefined,
    },
  })

  const onSubmit = (values: FormValues) => {
    registerMutation.mutate({ ...values, preferred_language: 'en' })
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Create your account</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <form onSubmit={handleSubmit(onSubmit)}>
          <IonList inset>
            <FormSelectField
              control={control}
              name="role"
              label="I am a..."
              placeholder="Choose one"
              options={[
                { value: 'employee', label: 'Job seeker (Employee)' },
                { value: 'hirer', label: 'Hirer / Employer' },
              ]}
            />
            <FormTextField control={control} name="name" label="Full name" autocomplete="name" />
            <FormTextField control={control} name="email" label="Email" type="email" autocomplete="email" />
            <FormTextField control={control} name="phone_number" label="Phone number" type="tel" />
            <FormTextField
              control={control}
              name="password"
              label="Password"
              type="password"
              autocomplete="new-password"
            />
            <FormTextField
              control={control}
              name="password_confirmation"
              label="Confirm password"
              type="password"
              autocomplete="new-password"
            />
          </IonList>

          {registerMutation.isError && (
            <IonText color="danger">
              <p className="ion-padding-horizontal">
                {registerMutation.error instanceof ApiError
                  ? registerMutation.error.message
                  : 'Registration failed.'}
              </p>
            </IonText>
          )}

          <div className="ion-padding">
            <IonButton expand="block" type="submit" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? <IonSpinner name="dots" /> : 'Create account'}
            </IonButton>
          </div>
        </form>

        <div className="ion-text-center ion-padding">
          <IonText color="medium">Already have an account? </IonText>
          <IonRouterLink routerLink="/login">Log in</IonRouterLink>
        </div>
      </IonContent>
    </IonPage>
  )
}
