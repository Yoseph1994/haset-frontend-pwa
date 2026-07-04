import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonLabel,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { useState } from 'react'
import { RequestsSegment } from './RequestsSegment'
import { OffersSegment } from './OffersSegment'

type ActivityTab = 'requests' | 'offers'

/** Requests + Offers list. Reached from dashboard action cards (Contracts have their own tab now). */
export function ActivityListPage() {
  const [tab, setTab] = useState<ActivityTab>('requests')

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/home" />
          </IonButtons>
          <IonTitle>Requests &amp; Offers</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSegment value={tab} onIonChange={(e) => setTab(e.detail.value as ActivityTab)}>
            <IonSegmentButton value="requests">
              <IonLabel>Requests</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="offers">
              <IonLabel>Offers</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {tab === 'requests' && <RequestsSegment />}
        {tab === 'offers' && <OffersSegment />}
      </IonContent>
    </IonPage>
  )
}
