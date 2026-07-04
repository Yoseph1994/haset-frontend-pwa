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
import { useHistory } from 'react-router-dom'
import { z } from 'zod'
import { FormTextField } from '@/components/form/FormTextField'
import { useForgotPassword } from '@/hooks/useAuth'
import { ApiError } from '@/api/client'

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
})

type FormValues = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const history = useHistory()
  const forgotPassword = useForgotPassword()
  const { control, handleSubmit, getValues } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  const onSubmit = (values: FormValues) => {
    forgotPassword.mutate(values.email, {
      onSuccess: () => {
        history.push(`/reset-password?email=${encodeURIComponent(getValues('email'))}`)
      },
    })
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/login" />
          </IonButtons>
          <IonTitle>Reset password</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonText color="medium">
          <p>Enter your email and we'll send you a code to reset your password.</p>
        </IonText>

        <form onSubmit={handleSubmit(onSubmit)}>
          <IonList inset>
            <FormTextField control={control} name="email" label="Email" type="email" autocomplete="email" />
          </IonList>

          {forgotPassword.isError && (
            <IonText color="danger">
              <p className="ion-padding-horizontal">
                {forgotPassword.error instanceof ApiError ? forgotPassword.error.message : 'Something went wrong.'}
              </p>
            </IonText>
          )}

          <div className="ion-padding">
            <IonButton expand="block" type="submit" disabled={forgotPassword.isPending}>
              {forgotPassword.isPending ? <IonSpinner name="dots" /> : 'Send reset code'}
            </IonButton>
          </div>
        </form>
      </IonContent>
    </IonPage>
  )
}
