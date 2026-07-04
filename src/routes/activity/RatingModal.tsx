import { IonButton, IonButtons, IonContent, IonHeader, IonSpinner, IonText, IonTextarea, IonTitle, IonToolbar } from '@ionic/react'
import { useState } from 'react'
import { RatingStars } from '@/components/RatingStars'
import { useCreateRating } from '@/hooks/useRatings'
import { ApiError } from '@/api/client'

interface RatingModalProps {
  contractId: string
  onDismiss: () => void
}

export function RatingModal({ contractId, onDismiss }: RatingModalProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const createRating = useCreateRating()

  const handleSubmit = () => {
    createRating.mutate(
      { contract_id: contractId, rating, comment: comment.trim() || undefined },
      { onSuccess: onDismiss },
    )
  }

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Rate your experience</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onDismiss}>Close</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="ion-text-center ion-padding">
          <RatingStars value={rating} onChange={setRating} size={36} />
        </div>

        <IonTextarea
          label="Comment (optional)"
          labelPlacement="stacked"
          rows={4}
          value={comment}
          onIonInput={(e) => setComment(e.detail.value ?? '')}
        />

        {createRating.isError && (
          <IonText color="danger">
            <p>{createRating.error instanceof ApiError ? createRating.error.message : 'Could not submit rating.'}</p>
          </IonText>
        )}

        <div className="ion-padding-top">
          <IonButton expand="block" disabled={rating === 0 || createRating.isPending} onClick={handleSubmit}>
            {createRating.isPending ? <IonSpinner name="dots" /> : 'Submit rating'}
          </IonButton>
        </div>
      </IonContent>
    </>
  )
}
