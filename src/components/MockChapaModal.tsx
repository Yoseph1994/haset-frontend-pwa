import { IonModal, IonSpinner } from '@ionic/react'
import { useEffect, useRef, useState } from 'react'

type Phase = 'entry' | 'processing' | 'success' | 'error'

interface MockChapaModalProps {
  isOpen: boolean
  /** Fee amount to display, e.g. "2,000". */
  amount: string
  currency: string
  /** Who is being paid — shown as the merchant name. */
  payeeName: string
  /** Performs the real backend mock-complete call. Rejects on failure. */
  onConfirm: () => Promise<void>
  /** Called after the success animation finishes; parent navigates away here. */
  onSuccess: () => void
  /** User dismissed the popup without paying. */
  onDismiss: () => void
}

// Visual-only payment methods, mirroring the real Chapa checkout options.
const METHODS = [
  { key: 'cbe', label: 'CBE Birr' },
  { key: 'telebirr', label: 'telebirr' },
  { key: 'amole', label: 'Amole' },
]

const PIN_LENGTH = 6
// Keep the spinner up long enough to feel like a real gateway round-trip.
const MIN_PROCESSING_MS = 1400
const SUCCESS_DISMISS_MS = 2000

const CHAPA_GREEN = '#12B76A'
const CHAPA_GREEN_DARK = '#0E9F5B'

export function MockChapaModal({
  isOpen,
  amount,
  currency,
  payeeName,
  onConfirm,
  onSuccess,
  onDismiss,
}: MockChapaModalProps) {
  const [phase, setPhase] = useState<Phase>('entry')
  const [pin, setPin] = useState('')
  const [method, setMethod] = useState('cbe')
  const [error, setError] = useState<string | null>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  // Reset to a clean slate every time the popup opens.
  useEffect(() => {
    if (isOpen) {
      setPhase('entry')
      setPin('')
      setMethod('cbe')
      setError(null)
    }
    return () => {
      timers.current.forEach(clearTimeout)
      timers.current = []
    }
  }, [isOpen])

  const pressDigit = (d: string) => {
    if (phase !== 'entry') return
    setPin((p) => (p.length < PIN_LENGTH ? p + d : p))
  }

  const backspace = () => {
    if (phase !== 'entry') return
    setPin((p) => p.slice(0, -1))
  }

  const confirm = async () => {
    if (pin.length !== PIN_LENGTH || phase === 'processing') return
    setPhase('processing')
    setError(null)
    const started = Date.now()
    try {
      await onConfirm()
      const elapsed = Date.now() - started
      const wait = Math.max(0, MIN_PROCESSING_MS - elapsed)
      timers.current.push(
        setTimeout(() => {
          setPhase('success')
          timers.current.push(setTimeout(() => onSuccess(), SUCCESS_DISMISS_MS))
        }, wait),
      )
    } catch (e) {
      setPhase('error')
      setError(e instanceof Error ? e.message : 'Payment could not be processed. Please try again.')
    }
  }

  const retry = () => {
    setPhase('entry')
    setPin('')
    setError(null)
  }

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onDismiss}
      // Popup-style sheet, centered and compact like a payment dialog.
      style={
        {
          '--width': 'min(420px, 92vw)',
          '--height': 'auto',
          '--max-height': '90vh',
          '--border-radius': '16px',
        } as React.CSSProperties
      }
    >
      <style>{mockChapaStyles}</style>
      <div className="mc-root">
        {/* Chapa-branded header */}
        <div className="mc-header" style={{ background: `linear-gradient(135deg, ${CHAPA_GREEN}, ${CHAPA_GREEN_DARK})` }}>
          <div className="mc-brand">
            <span className="mc-brand-dot" />
            chapa
          </div>
          {phase === 'entry' && (
            <button className="mc-close" onClick={onDismiss} aria-label="Cancel payment">
              ✕
            </button>
          )}
        </div>

        <div className="mc-body">
          {phase === 'success' ? (
            <div className="mc-center">
              <div className="mc-check">
                <svg viewBox="0 0 52 52" width="72" height="72">
                  <circle className="mc-check-circle" cx="26" cy="26" r="24" fill="none" />
                  <path className="mc-check-mark" fill="none" d="M14 27l8 8 16-18" />
                </svg>
              </div>
              <h2 className="mc-success-title">Payment Successful!</h2>
              <p className="mc-muted">
                {currency} {amount} paid to {payeeName}
              </p>
            </div>
          ) : phase === 'processing' ? (
            <div className="mc-center">
              <IonSpinner name="crescent" style={{ transform: 'scale(1.6)', color: CHAPA_GREEN }} />
              <p className="mc-processing">Processing payment…</p>
              <p className="mc-muted">Please don’t close this window</p>
            </div>
          ) : (
            <>
              <div className="mc-amount-block">
                <span className="mc-amount-label">You are paying</span>
                <span className="mc-amount">
                  {currency} {amount}
                </span>
                <span className="mc-payee">to {payeeName}</span>
              </div>

              <div className="mc-methods">
                {METHODS.map((m) => (
                  <button
                    key={m.key}
                    className={`mc-method ${method === m.key ? 'is-active' : ''}`}
                    onClick={() => setMethod(m.key)}
                    type="button"
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="mc-pin-label">Enter your PIN</div>
              <div className="mc-pin-dots">
                {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                  <span key={i} className={`mc-dot ${i < pin.length ? 'is-filled' : ''}`} />
                ))}
              </div>

              {error && <p className="mc-error">{error}</p>}

              <div className="mc-keypad">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
                  <button key={d} className="mc-key" onClick={() => pressDigit(d)} type="button">
                    {d}
                  </button>
                ))}
                <span />
                <button className="mc-key" onClick={() => pressDigit('0')} type="button">
                  0
                </button>
                <button className="mc-key mc-key-back" onClick={backspace} type="button" aria-label="Delete">
                  ⌫
                </button>
              </div>

              <button
                className="mc-confirm"
                style={{ background: pin.length === PIN_LENGTH ? CHAPA_GREEN : undefined }}
                disabled={pin.length !== PIN_LENGTH}
                onClick={confirm}
                type="button"
              >
                {phase === 'error' ? 'Retry Payment' : `Confirm Payment`}
              </button>

              {phase === 'error' && (
                <button className="mc-retry-link" onClick={retry} type="button">
                  Start over
                </button>
              )}

              <p className="mc-mock-note">Test mode · no real payment is processed</p>
            </>
          )}
        </div>
      </div>
    </IonModal>
  )
}

const mockChapaStyles = `
.mc-root { display: flex; flex-direction: column; background: #fff; color: #1a2b23; }
.mc-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 20px; color: #fff;
}
.mc-brand {
  display: flex; align-items: center; gap: 8px;
  font-size: 22px; font-weight: 800; letter-spacing: -0.5px;
}
.mc-brand-dot {
  width: 12px; height: 12px; border-radius: 50%;
  background: #fff; box-shadow: 0 0 0 3px rgba(255,255,255,0.35);
}
.mc-close {
  background: rgba(255,255,255,0.2); border: none; color: #fff;
  width: 28px; height: 28px; border-radius: 50%; font-size: 14px; cursor: pointer;
}
.mc-body { padding: 22px 20px 24px; }
.mc-center { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 24px 0; }
.mc-amount-block { display: flex; flex-direction: column; align-items: center; gap: 2px; margin-bottom: 18px; }
.mc-amount-label { font-size: 13px; color: #6b7c74; }
.mc-amount { font-size: 30px; font-weight: 800; color: #0E9F5B; }
.mc-payee { font-size: 13px; color: #6b7c74; }
.mc-methods { display: flex; gap: 8px; justify-content: center; margin-bottom: 20px; flex-wrap: wrap; }
.mc-method {
  border: 1.5px solid #dfe6e2; background: #fff; color: #46564e;
  padding: 8px 14px; border-radius: 999px; font-size: 13px; font-weight: 600; cursor: pointer;
}
.mc-method.is-active { border-color: #12B76A; color: #0E9F5B; background: #ecfdf3; }
.mc-pin-label { text-align: center; font-size: 13px; color: #6b7c74; margin-bottom: 12px; }
.mc-pin-dots { display: flex; gap: 14px; justify-content: center; margin-bottom: 16px; }
.mc-dot { width: 14px; height: 14px; border-radius: 50%; background: #e2e8e5; transition: background 0.15s; }
.mc-dot.is-filled { background: #12B76A; }
.mc-error { color: #d92d20; text-align: center; font-size: 13px; margin: 4px 0 10px; }
.mc-keypad { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
.mc-key {
  height: 52px; border: none; border-radius: 12px; background: #f2f5f4;
  font-size: 22px; font-weight: 600; color: #1a2b23; cursor: pointer;
}
.mc-key:active { background: #e2e8e5; }
.mc-key-back { font-size: 20px; }
.mc-confirm {
  width: 100%; height: 52px; border: none; border-radius: 12px;
  background: #b7c4bd; color: #fff; font-size: 16px; font-weight: 700; cursor: pointer;
}
.mc-confirm:disabled { cursor: not-allowed; }
.mc-processing { font-size: 16px; font-weight: 600; margin-top: 4px; }
.mc-muted { font-size: 13px; color: #6b7c74; text-align: center; }
.mc-success-title { font-size: 20px; font-weight: 800; color: #0E9F5B; margin: 4px 0 0; }
.mc-mock-note { text-align: center; font-size: 11px; color: #9aa8a1; margin-top: 14px; }
.mc-retry-link { display: block; margin: 10px auto 0; background: none; border: none; color: #6b7c74; font-size: 13px; text-decoration: underline; cursor: pointer; }

.mc-check-circle { stroke: #12B76A; stroke-width: 2.5; stroke-dasharray: 151; stroke-dashoffset: 151; animation: mc-circle 0.5s ease-out forwards; }
.mc-check-mark { stroke: #12B76A; stroke-width: 3.5; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 48; stroke-dashoffset: 48; animation: mc-mark 0.3s 0.45s ease-out forwards; }
@keyframes mc-circle { to { stroke-dashoffset: 0; } }
@keyframes mc-mark { to { stroke-dashoffset: 0; } }

@media (prefers-color-scheme: dark) {
  .mc-root { background: #1a1f1d; color: #e8efeb; }
  .mc-body { background: #1a1f1d; }
  .mc-amount-label, .mc-payee, .mc-pin-label, .mc-muted { color: #9aa8a1; }
  .mc-method { background: #232a27; border-color: #34403b; color: #c4d0ca; }
  .mc-method.is-active { background: #123024; border-color: #12B76A; color: #4ade9a; }
  .mc-key { background: #232a27; color: #e8efeb; }
  .mc-key:active { background: #2c352f; }
  .mc-dot { background: #34403b; }
}
`
