import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonList,
  IonListHeader,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { FormTextField } from '@/components/form/FormTextField'
import { useChangePassword, useLogout } from '@/hooks/useAuth'
import { ApiError } from '@/api/client'

const schema = z
  .object({
    current_password: z.string().min(1, 'Required'),
    password: z.string().min(8, 'At least 8 characters'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })

type FormValues = z.infer<typeof schema>

export function SettingsPage() {
  const changePassword = useChangePassword()
  const logout = useLogout()
  const { control, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { current_password: '', password: '', password_confirmation: '' },
  })

  const onSubmit = (values: FormValues) => {
    changePassword.mutate(values, { onSuccess: () => reset() })
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/profile" />
          </IonButtons>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <form onSubmit={handleSubmit(onSubmit)}>
          <IonList inset>
            <IonListHeader>Change password</IonListHeader>
            <FormTextField
              control={control}
              name="current_password"
              label="Current password"
              type="password"
              autocomplete="current-password"
            />
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

          {changePassword.isError && (
            <IonText color="danger">
              <p className="ion-padding-horizontal">
                {changePassword.error instanceof ApiError ? changePassword.error.message : 'Something went wrong.'}
              </p>
            </IonText>
          )}

          {changePassword.isSuccess && (
            <IonText color="success">
              <p className="ion-padding-horizontal">Password changed successfully.</p>
            </IonText>
          )}

          <div className="ion-padding">
            <IonButton expand="block" type="submit" disabled={changePassword.isPending}>
              {changePassword.isPending ? <IonSpinner name="dots" /> : 'Update password'}
            </IonButton>
          </div>
        </form>

        <div className="ion-padding">
          <IonButton expand="block" color="danger" fill="outline" onClick={() => logout.mutate()}>
            Log out
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  )
}
