import { IonContent, IonPage, IonRouterLink } from '@ionic/react'
import { useHistory } from 'react-router-dom'

/**
 * Public pre-login landing page. Two clear paths — hire or find work — plus a
 * short how-it-works and trust signals. Brand green matches the contract PDF
 * and mock Chapa popup.
 */
export function LandingPage() {
  const history = useHistory()

  return (
    <IonPage>
      <IonContent fullscreen>
        <style>{landingStyles}</style>
        <div className="lp-root">
          {/* Top bar */}
          <div className="lp-topbar">
            <span className="lp-brand">
              haset<span className="lp-dot">.</span>
            </span>
            <IonRouterLink routerLink="/login" className="lp-login-link">
              Log in
            </IonRouterLink>
          </div>

          {/* Hero */}
          <div className="lp-hero">
            <h1 className="lp-title">
              Find reliable workers.
              <br />
              Find your next job.
            </h1>
            <p className="lp-subtitle">
              HASET connects hirers and workers with agreed terms, signed digital contracts, and secure payment — all in
              one place.
            </p>

            <div className="lp-cta-row">
              <button className="lp-cta lp-cta-primary" onClick={() => history.push('/register?role=hirer')}>
                Hire Workers
              </button>
              <button className="lp-cta lp-cta-secondary" onClick={() => history.push('/register?role=employee')}>
                Find Work
              </button>
            </div>
          </div>

          {/* How it works */}
          <div className="lp-section">
            <h2 className="lp-section-title">How it works</h2>
            <div className="lp-steps">
              <Step n={1} title="Create your profile" text="Sign up, tell us your skills or your hiring needs, and get verified." />
              <Step n={2} title="Connect & agree" text="Apply, invite, and send offers. Both sides review and agree to the terms." />
              <Step n={3} title="Sign & get to work" text="Pay the platform fee, get a signed contract PDF, and the job is on." />
            </div>
          </div>

          {/* Trust signals */}
          <div className="lp-trust">
            <TrustBadge label="Verified profiles" />
            <TrustBadge label="Signed digital contracts" />
            <TrustBadge label="Secure payments" />
          </div>

          <div className="lp-footer">
            <span>Already have an account? </span>
            <IonRouterLink routerLink="/login">Log in</IonRouterLink>
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}

function Step({ n, title, text }: { n: number; title: string; text: string }) {
  return (
    <div className="lp-step">
      <div className="lp-step-num">{n}</div>
      <div>
        <div className="lp-step-title">{title}</div>
        <div className="lp-step-text">{text}</div>
      </div>
    </div>
  )
}

function TrustBadge({ label }: { label: string }) {
  return (
    <div className="lp-badge">
      <span className="lp-badge-check">✓</span>
      {label}
    </div>
  )
}

const landingStyles = `
.lp-root { min-height: 100%; padding: 0 20px 32px; max-width: 560px; margin: 0 auto; }
.lp-topbar { display: flex; align-items: center; justify-content: space-between; padding: 18px 0; }
.lp-brand { font-size: 24px; font-weight: 800; color: #0E9F5B; letter-spacing: -0.5px; }
.lp-dot { color: #12B76A; }
.lp-login-link { font-weight: 600; font-size: 15px; }

.lp-hero { padding: 24px 0 8px; }
.lp-title { font-size: 30px; line-height: 1.2; font-weight: 800; margin: 0 0 12px; letter-spacing: -0.5px; }
.lp-subtitle { font-size: 15px; line-height: 1.55; color: var(--ion-color-medium); margin: 0 0 24px; }

.lp-cta-row { display: flex; flex-direction: column; gap: 12px; }
.lp-cta { height: 54px; border-radius: 14px; font-size: 16px; font-weight: 700; border: none; cursor: pointer; }
.lp-cta-primary { background: #12B76A; color: #fff; }
.lp-cta-primary:active { background: #0E9F5B; }
.lp-cta-secondary { background: transparent; color: #0E9F5B; border: 2px solid #12B76A; }

.lp-section { margin-top: 40px; }
.lp-section-title { font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--ion-color-medium); margin: 0 0 16px; }
.lp-steps { display: flex; flex-direction: column; gap: 18px; }
.lp-step { display: flex; gap: 14px; align-items: flex-start; }
.lp-step-num { flex: 0 0 auto; width: 32px; height: 32px; border-radius: 50%; background: #ecfdf3; color: #0E9F5B; font-weight: 800; display: flex; align-items: center; justify-content: center; }
.lp-step-title { font-weight: 700; font-size: 15px; margin-bottom: 2px; }
.lp-step-text { font-size: 14px; color: var(--ion-color-medium); line-height: 1.5; }

.lp-trust { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 36px; justify-content: center; }
.lp-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 600; color: #0E9F5B; background: #ecfdf3; padding: 8px 12px; border-radius: 999px; }
.lp-badge-check { font-weight: 800; }

.lp-footer { text-align: center; margin-top: 36px; font-size: 14px; color: var(--ion-color-medium); }

@media (prefers-color-scheme: dark) {
  .lp-step-num, .lp-badge { background: rgba(18,183,106,0.16); }
  .lp-badge { color: #4ade9a; }
}
`
