import { IonIcon } from '@ionic/react'
import { star, starHalf, starOutline } from 'ionicons/icons'

interface RatingStarsProps {
  value: number
  onChange?: (value: number) => void
  size?: number
}

/** Read-only when `onChange` is omitted; otherwise a tappable 1-5 picker. */
export function RatingStars({ value, onChange, size = 20 }: RatingStarsProps) {
  const isInteractive = Boolean(onChange)

  return (
    <div style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star_) => {
        let icon = starOutline
        if (isInteractive) {
          icon = star_ <= value ? star : starOutline
        } else if (star_ <= Math.floor(value)) {
          icon = star
        } else if (star_ - value < 1) {
          icon = starHalf
        }

        return (
          <IonIcon
            key={star_}
            icon={icon}
            color="warning"
            style={{
              fontSize: size,
              cursor: isInteractive ? 'pointer' : undefined,
            }}
            onClick={isInteractive ? () => onChange?.(star_) : undefined}
          />
        )
      })}
    </div>
  )
}
