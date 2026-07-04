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
import { useLogin } from '@/hooks/useAuth'
import { ApiError } from '@/api/client'

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const login = useLogin()
  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = (values: FormValues) => {
    login.mutate(values)
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Welcome back</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <form onSubmit={handleSubmit(onSubmit)}>
          <IonList inset>
            <FormTextField control={control} name="email" label="Email" type="email" autocomplete="email" />
            <FormTextField
              control={control}
              name="password"
              label="Password"
              type="password"
              autocomplete="current-password"
            />
          </IonList>

          {login.isError && (
            <IonText color="danger">
              <p className="ion-padding-horizontal">
                {login.error instanceof ApiError ? login.error.message : 'Login failed.'}
              </p>
            </IonText>
          )}

          <div className="ion-padding">
            <IonButton expand="block" type="submit" disabled={login.isPending}>
              {login.isPending ? <IonSpinner name="dots" /> : 'Log in'}
            </IonButton>
          </div>
        </form>

        <div className="ion-text-center ion-padding">
          <IonRouterLink routerLink="/forgot-password">Forgot password?</IonRouterLink>
        </div>
        <div className="ion-text-center">
          <IonText color="medium">Don't have an account? </IonText>
          <IonRouterLink routerLink="/register">Create one</IonRouterLink>
        </div>
      </IonContent>
    </IonPage>
  )
}
