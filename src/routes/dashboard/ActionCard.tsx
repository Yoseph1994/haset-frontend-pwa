import { IonIcon, IonRippleEffect } from '@ionic/react'
import { chevronForward, close } from 'ionicons/icons'

type ActionTone = 'warning' | 'danger' | 'success' | 'primary'

interface ActionCardProps {
  tone: ActionTone
  title: string
  subtitle?: string
  onClick?: () => void
  onDismiss?: () => void
}

const TONE_RGB: Record<ActionTone, string> = {
  warning: 'var(--ion-color-warning-rgb)',
  danger: 'var(--ion-color-danger-rgb)',
  success: 'var(--ion-color-success-rgb)',
  primary: 'var(--ion-color-primary-rgb)',
}

/** A dashboard "what needs action" card — colored dot + text, deep-links on tap. */
export function ActionCard({ tone, title, subtitle, onClick, onDismiss }: ActionCardProps) {
  const rgb = TONE_RGB[tone]

  return (
    <button
      type="button"
      onClick={onClick}
      className="ion-activatable"
      style={{
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        textAlign: 'start',
        padding: '14px 16px',
        marginBottom: 10,
        borderRadius: 14,
        border: `1px solid rgba(${rgb}, 0.35)`,
        background: `rgba(${rgb}, 0.1)`,
        color: 'var(--ion-text-color)',
        cursor: onClick ? 'pointer' : 'default',
        font: 'inherit',
      }}
    >
      <span
        style={{
          flex: '0 0 auto',
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: `rgb(${rgb})`,
        }}
      />
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontWeight: 600, fontSize: 15 }}>{title}</span>
        {subtitle && (
          <span style={{ display: 'block', fontSize: 13, color: 'var(--ion-color-medium)' }}>{subtitle}</span>
        )}
      </span>
      {onDismiss ? (
        <IonIcon
          icon={close}
          color="medium"
          onClick={(e) => {
            e.stopPropagation()
            onDismiss()
          }}
          style={{ padding: 4 }}
        />
      ) : (
        onClick && <IonIcon icon={chevronForward} color="medium" />
      )}
      <IonRippleEffect />
    </button>
  )
}
