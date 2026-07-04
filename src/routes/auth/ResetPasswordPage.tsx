import {
  IonBackButton,
  IonButtons,
  IonButton,
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
import { useLocation } from 'react-router-dom'
import { z } from 'zod'
import { FormTextField } from '@/components/form/FormTextField'
import { useResetPassword } from '@/hooks/useAuth'
import { ApiError } from '@/api/client'

const schema = z
  .object({
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
    code: z.string().min(1, 'Enter the code sent to your email'),
    password: z.string().min(8, 'At least 8 characters'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })

type FormValues = z.infer<typeof schema>

export function ResetPasswordPage() {
  const location = useLocation()
  const prefillEmail = new URLSearchParams(location.search).get('email') ?? ''
  const resetPassword = useResetPassword()

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: prefillEmail, code: '', password: '', password_confirmation: '' },
  })

  const onSubmit = (values: FormValues) => {
    resetPassword.mutate(values)
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/forgot-password" />
          </IonButtons>
          <IonTitle>Enter reset code</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <form onSubmit={handleSubmit(onSubmit)}>
          <IonList inset>
            <FormTextField control={control} name="email" label="Email" type="email" autocomplete="email" />
            <FormTextField control={control} name="code" label="Reset code" type="text" />
            <FormTextField
              control={control}
              name="password"
              label="New password"
              type="password"
              autocomplete="new-password"
            />
            <FormTextField
              control={control}
              name="password_confirmation"
              label="Confirm new password"
              type="password"
              autocomplete="new-password"
            />
          </IonList>

          {resetPassword.isError && (
            <IonText color="danger">
              <p className="ion-padding-horizontal">
                {resetPassword.error instanceof ApiError ? resetPassword.error.message : 'Reset failed.'}
              </p>
            </IonText>
          )}

          <div className="ion-padding">
            <IonButton expand="block" type="submit" disabled={resetPassword.isPending}>
              {resetPassword.isPending ? <IonSpinner name="dots" /> : 'Reset password'}
            </IonButton>
          </div>
        </form>
      </IonContent>
    </IonPage>
  )
}
