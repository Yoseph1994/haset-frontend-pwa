import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/react'
import { Redirect, Route } from 'react-router-dom'
import {
  briefcaseOutline,
  documentTextOutline,
  homeOutline,
  personOutline,
  searchOutline,
} from 'ionicons/icons'
import { useSessionStore } from '@/store/session'
import { DashboardPage } from './dashboard/DashboardPage'
import { JobListPage } from './jobs/JobListPage'
import { JobDetailPage } from './jobs/JobDetailPage'
import { JobFormPage } from './jobs/JobFormPage'
import { EmployeeSearchPage } from './employees/EmployeeSearchPage'
import { EmployeePublicProfilePage } from './employees/EmployeePublicProfilePage'
import { HiringRequestDetailPage } from './hiring-requests/HiringRequestDetailPage'
import { ActivityListPage } from './activity/ActivityListPage'
import { OfferDetailPage } from './activity/OfferDetailPage'
import { ContractsListPage } from './contracts/ContractsListPage'
import { ContractDetailPage } from './activity/ContractDetailPage'
import { ContractReviewPage } from './contracts/ContractReviewPage'
import { PaymentReturnPage } from './activity/PaymentReturnPage'
import { NotificationListPage } from './notifications/NotificationListPage'
import { MyProfilePage } from './profile/MyProfilePage'
import { ProfileEditPage } from './profile/ProfileEditPage'
import { SettingsPage } from './profile/SettingsPage'

export function AppShell() {
  const isHirer = useSessionStore((s) => s.user?.role === 'hirer')

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/app/home" component={DashboardPage} />

        <Route exact path="/app/jobs" component={JobListPage} />
        {/* create form lives off the /jobs/:id namespace so it doesn't collide with the detail route */}
        <Route exact path="/app/post-job" component={JobFormPage} />
        <Route exact path="/app/jobs/:id/edit" component={JobFormPage} />
        <Route exact path="/app/jobs/:id" component={JobDetailPage} />

        <Route exact path="/app/employees" component={EmployeeSearchPage} />
        <Route exact path="/app/employees/:id" component={EmployeePublicProfilePage} />

        <Route exact path="/app/contracts" component={ContractsListPage} />
        {/* Review + two-sided agreement screen (before payment) */}
        <Route exact path="/app/contracts/:id/review" component={ContractReviewPage} />
        <Route exact path="/app/contracts/:id" component={ContractDetailPage} />

        {/* Requests + Offers list, reached from dashboard action cards (not a bottom tab) */}
        <Route exact path="/app/activity" component={ActivityListPage} />
        <Route exact path="/app/requests/:id" component={HiringRequestDetailPage} />
        <Route exact path="/app/offers/:id" component={OfferDetailPage} />

        <Route exact path="/app/notifications" component={NotificationListPage} />

        {/* Chapa return lands here (FRONTEND_URL/payments/success) after checkout */}
        <Route exact path="/payments/success" component={PaymentReturnPage} />
        <Route exact path="/payments/cancel" component={PaymentReturnPage} />
        <Redirect exact from="/payments" to="/app/home" />

        <Route exact path="/app/profile" component={MyProfilePage} />
        <Route exact path="/app/profile/edit" component={ProfileEditPage} />
        <Route exact path="/app/profile/settings" component={SettingsPage} />

        <Redirect exact from="/app" to="/app/home" />
        <Redirect to="/app/home" />
      </IonRouterOutlet>

      <IonTabBar slot="bottom">
        <IonTabButton tab="home" href="/app/home">
          <IonIcon icon={homeOutline} />
          <IonLabel>Home</IonLabel>
        </IonTabButton>

        <IonTabButton tab="jobs" href="/app/jobs">
          <IonIcon icon={briefcaseOutline} />
          <IonLabel>{isHirer ? 'My Jobs' : 'Jobs'}</IonLabel>
        </IonTabButton>

        {isHirer && (
          <IonTabButton tab="employees" href="/app/employees">
            <IonIcon icon={searchOutline} />
            <IonLabel>Find Workers</IonLabel>
          </IonTabButton>
        )}

        <IonTabButton tab="contracts" href="/app/contracts">
          <IonIcon icon={documentTextOutline} />
          <IonLabel>Contracts</IonLabel>
        </IonTabButton>

        <IonTabButton tab="profile" href="/app/profile">
          <IonIcon icon={personOutline} />
          <IonLabel>{isHirer ? 'Company' : 'Profile'}</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  )
}
