import { IonRouterOutlet } from '@ionic/react'
import { Redirect, Route, Switch } from 'react-router-dom'
import { LoginPage } from './LoginPage'
import { RegisterPage } from './RegisterPage'
import { ForgotPasswordPage } from './ForgotPasswordPage'
import { ResetPasswordPage } from './ResetPasswordPage'

export function AuthRoutes() {
  return (
    <IonRouterOutlet>
      <Switch>
        <Route exact path="/login" component={LoginPage} />
        <Route exact path="/register" component={RegisterPage} />
        <Route exact path="/forgot-password" component={ForgotPasswordPage} />
        <Route exact path="/reset-password" component={ResetPasswordPage} />
        <Redirect to="/login" />
      </Switch>
    </IonRouterOutlet>
  )
}
