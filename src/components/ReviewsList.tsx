import { IonItem, IonLabel, IonList, IonListHeader, IonSpinner } from '@ionic/react'
import { useUserRatings } from '@/hooks/useRatings'
import { RatingStars } from './RatingStars'
import { EmptyState } from './EmptyState'
import { formatDate } from '@/utils/format'

export function ReviewsList({ userId }: { userId: string }) {
  const { data, isLoading } = useUserRatings(userId)

  return (
    <IonList inset>
      <IonListHeader>
        <IonLabel>Reviews</IonLabel>
      </IonListHeader>

      {isLoading && <IonSpinner name="dots" className="ion-margin" />}

      {!isLoading && data?.data.length === 0 && <EmptyState message="No reviews yet" />}

      {data?.data.map((rating) => (
        <IonItem key={rating.id} lines="inset">
          <IonLabel className="ion-text-wrap">
            <h3>{rating.reviewer?.name ?? 'Anonymous'}</h3>
            <RatingStars value={Number(rating.rating)} />
            {rating.comment && <p>{rating.comment}</p>}
            <p>{formatDate(rating.created_at)}</p>
          </IonLabel>
        </IonItem>
      ))}
    </IonList>
  )
}
