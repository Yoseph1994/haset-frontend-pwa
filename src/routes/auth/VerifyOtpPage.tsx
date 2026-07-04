import {
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
import { z } from 'zod'
import { FormTextField } from '@/components/form/FormTextField'
import { useLogout, useSendEmailOtp, useVerifyEmailOtp } from '@/hooks/useAuth'
import { useSessionStore } from '@/store/session'
import { ApiError } from '@/api/client'

const schema = z.object({
  code: z.string().min(1, 'Enter the code sent to your email'),
})

type FormValues = z.infer<typeof schema>

export function VerifyOtpPage() {
  const user = useSessionStore((s) => s.user)
  const verifyOtp = useVerifyEmailOtp()
  const sendOtp = useSendEmailOtp()
  const logout = useLogout()

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { code: '' },
  })

  const onSubmit = (values: FormValues) => {
    verifyOtp.mutate(values.code)
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Verify your email</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => logout.mutate()}>Log out</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonText color="medium">
          <p>
            We sent a 6-digit code to <strong>{user?.email}</strong>. Enter it below to verify your account.
          </p>
        </IonText>

        <form onSubmit={handleSubmit(onSubmit)}>
          <IonList inset>
            <FormTextField control={control} name="code" label="Verification code" type="text" />
          </IonList>

          {verifyOtp.isError && (
            <IonText color="danger">
              <p className="ion-padding-horizontal">
                {verifyOtp.error instanceof ApiError ? verifyOtp.error.message : 'Verification failed.'}
              </p>
            </IonText>
          )}

          <div className="ion-padding">
            <IonButton expand="block" type="submit" disabled={verifyOtp.isPending}>
              {verifyOtp.isPending ? <IonSpinner name="dots" /> : 'Verify'}
            </IonButton>
            <IonButton
              expand="block"
              fill="clear"
              type="button"
              disabled={sendOtp.isPending}
              onClick={() => sendOtp.mutate()}
            >
              Resend code
            </IonButton>
            {sendOtp.isSuccess && (
              <IonText color="success">
                <p className="ion-text-center">A new code has been sent.</p>
              </IonText>
            )}
          </div>
        </form>
      </IonContent>
    </IonPage>
  )
}
