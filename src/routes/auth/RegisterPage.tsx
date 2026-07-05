import {
  IonBackButton,
  IonButton,
  IonButtons,
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
import { useLocation } from 'react-router-dom'
import { z } from 'zod'
import { FormTextField } from '@/components/form/FormTextField'
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

function useInitialRole(): 'employee' | 'hirer' | undefined {
  const { search } = useLocation()
  const role = new URLSearchParams(search).get('role')
  return role === 'employee' || role === 'hirer' ? role : undefined
}

export function RegisterPage() {
  const registerMutation = useRegister()
  const initialRole = useInitialRole()

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      phone_number: '+251',
      password: '',
      password_confirmation: '',
      role: initialRole,
    },
  })

  const role = watch('role')

  const onSubmit = (values: FormValues) => {
    registerMutation.mutate({ ...values, preferred_language: 'en' })
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Create your account</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <style>{registerStyles}</style>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Role selection — big cards, not a dropdown */}
          <p className="reg-role-label">I want to…</p>
          <div className="reg-role-cards">
            <RoleCard
              active={role === 'hirer'}
              emoji="🧑‍💼"
              title="Hire workers"
              subtitle="Post jobs, invite workers, and manage contracts."
              onClick={() => setValue('role', 'hirer', { shouldValidate: true })}
            />
            <RoleCard
              active={role === 'employee'}
              emoji="🛠️"
              title="Find work"
              subtitle="Browse jobs, apply, and get hired."
              onClick={() => setValue('role', 'employee', { shouldValidate: true })}
            />
          </div>
          {errors.role && (
            <IonText color="danger">
              <p className="reg-role-error">{errors.role.message}</p>
            </IonText>
          )}

          <IonList inset>
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

function RoleCard({
  active,
  emoji,
  title,
  subtitle,
  onClick,
}: {
  active: boolean
  emoji: string
  title: string
  subtitle: string
  onClick: () => void
}) {
  return (
    <button type="button" className={`reg-role-card ${active ? 'is-active' : ''}`} onClick={onClick}>
      <span className="reg-role-emoji">{emoji}</span>
      <span className="reg-role-title">{title}</span>
      <span className="reg-role-sub">{subtitle}</span>
      {active && <span className="reg-role-tick">✓</span>}
    </button>
  )
}

const registerStyles = `
.reg-role-label { font-size: 14px; font-weight: 600; color: var(--ion-color-medium); margin: 4px 4px 10px; }
.reg-role-cards { display: flex; gap: 12px; }
.reg-role-card {
  position: relative; flex: 1; text-align: left; background: var(--ion-color-light);
  border: 2px solid transparent; border-radius: 16px; padding: 14px; cursor: pointer;
  display: flex; flex-direction: column; gap: 4px;
}
.reg-role-card.is-active { border-color: #12B76A; background: #ecfdf3; }
.reg-role-emoji { font-size: 26px; }
.reg-role-title { font-weight: 700; font-size: 15px; }
.reg-role-sub { font-size: 12.5px; color: var(--ion-color-medium); line-height: 1.4; }
.reg-role-tick {
  position: absolute; top: 10px; right: 10px; width: 20px; height: 20px; border-radius: 50%;
  background: #12B76A; color: #fff; font-size: 12px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
}
.reg-role-error { margin: 8px 4px 0; font-size: 13px; }

@media (prefers-color-scheme: dark) {
  .reg-role-card.is-active { background: rgba(18,183,106,0.16); }
}
`
