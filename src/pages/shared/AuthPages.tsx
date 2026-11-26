import { useState, type ReactNode } from 'react'
import { Button, Checkbox, Icon, Input } from '@/components/atoms'
import { FormField } from '@/components/molecules'
import { Dialog } from '@/components/organisms'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function AuthCard({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-svh place-items-center bg-background px-4">
      <div className="flex w-full max-w-90 flex-col items-center gap-4">
        <div className="flex w-full flex-col gap-4 rounded-xl border bg-card p-6">
          <span className="grid size-8 place-items-center rounded-md bg-primary text-body-strong text-primary-foreground">
            T
          </span>
          {children}
        </div>
        <p className="text-small text-muted-foreground">TBT Support · MDI Solutions</p>
      </div>
    </main>
  )
}

/** Figma H3 · Sign in. Any password of 8+ characters works in the demo. */
export function SignInPage({
  onSignIn,
  onForgot,
}: {
  onSignIn: (email: string) => void
  onForgot: (email: string) => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [keep, setKeep] = useState(true)
  const [tried, setTried] = useState(false)
  const [busy, setBusy] = useState(false)
  const emailError = tried && !EMAIL.test(email) ? 'Enter your work email' : undefined
  const pwError = tried && password.length < 8 ? 'That password is too short' : undefined
  const submit = () => {
    setTried(true)
    if (!EMAIL.test(email) || password.length < 8) return
    setBusy(true)
    setTimeout(() => onSignIn(email), 600)
  }
  return (
    <AuthCard>
      <div className="flex flex-col gap-1">
        <h1 className="text-heading-2 text-foreground">Sign in to TBT Support</h1>
        <p className="text-body text-muted-foreground">Use your work email.</p>
      </div>
      <form
        className="flex flex-col gap-3"
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <FormField label="Email" error={emailError}>
          <Input
            type="email"
            leadingIcon="mail"
            autoFocus
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormField>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label htmlFor="signin-password" className="text-label text-foreground">
              Password
            </label>
            <button
              type="button"
              className="text-small text-muted-foreground hover:text-foreground"
              onClick={() => onForgot(email)}
            >
              Forgot password?
            </button>
          </div>
          <Input
            id="signin-password"
            type="password"
            autoComplete="current-password"
            invalid={!!pwError}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {pwError && <p className="text-small text-destructive">{pwError}</p>}
        </div>
        <Checkbox
          checked={keep}
          onCheckedChange={(v) => setKeep(v === true)}
          label="Keep me signed in"
        />
        <Button type="submit" loading={busy}>
          Sign in
        </Button>
      </form>
      <div className="flex items-center gap-3 text-small text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>
      <Button variant="secondary" onClick={() => onSignIn('lead@tbt.lk')}>
        Continue with Google
      </Button>
    </AuthCard>
  )
}

/** Figma H4 · Forgot password. */
export function ForgotPasswordPage({
  initialEmail = '',
  onBack,
}: {
  initialEmail?: string
  onBack: () => void
}) {
  const [email, setEmail] = useState(initialEmail)
  const [sent, setSent] = useState(false)
  const [tried, setTried] = useState(false)
  return (
    <AuthCard>
      <div className="flex flex-col gap-1">
        <h1 className="text-heading-2 text-foreground">Reset your password</h1>
        <p className="text-body text-muted-foreground">
          Enter your work email and we’ll send a link to choose a new password.
        </p>
      </div>
      <form
        className="flex flex-col gap-3"
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          setTried(true)
          if (EMAIL.test(email)) setSent(true)
        }}
      >
        <FormField
          label="Email"
          error={tried && !EMAIL.test(email) ? 'Enter your work email' : undefined}
        >
          <Input
            type="email"
            leadingIcon="mail"
            autoFocus
            value={email}
            onChange={(e) => (setEmail(e.target.value), setSent(false))}
          />
        </FormField>
        <Button type="submit">{sent ? 'Send again' : 'Send reset link'}</Button>
      </form>
      {sent && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-small text-muted-foreground"
        >
          <Icon name="check" size={14} />
          Link sent — it expires in 30 minutes.
        </p>
      )}
      <Button
        variant="ghost"
        size="sm"
        leadingIcon="arrow-left"
        className="self-start"
        onClick={onBack}
      >
        Back to sign in
      </Button>
    </AuthCard>
  )
}

/** Figma X23 · Session expired — sign in again without losing the page. */
export function SessionExpiredDialog({
  open,
  email,
  draftNote,
  onSignIn,
  onOtherAccount,
}: {
  open: boolean
  email: string
  /** "your draft reply on T-221 was saved". */
  draftNote?: string
  onSignIn: () => void
  onOtherAccount: () => void
}) {
  const [pw, setPw] = useState('')
  const [tried, setTried] = useState(false)
  return (
    <Dialog
      open={open}
      onOpenChange={() => {}}
      size="sm"
      hideClose
      title="You’ve been signed out"
      description={`For security, sessions end after 12 hours. Sign in again to carry on${draftNote ? ` — ${draftNote}` : ''}.`}
      footer={
        <>
          <Button variant="ghost" className="me-auto" onClick={onOtherAccount}>
            Use another account
          </Button>
          <Button type="submit" form="session-expired">
            Sign in
          </Button>
        </>
      }
    >
      <form
        id="session-expired"
        onSubmit={(e) => {
          e.preventDefault()
          setTried(true)
          if (pw.length >= 8) {
            setPw('')
            setTried(false)
            onSignIn()
          }
        }}
      >
        <FormField
          label={`Password for ${email}`}
          error={tried && pw.length < 8 ? 'That password is too short' : undefined}
        >
          <Input type="password" autoFocus value={pw} onChange={(e) => setPw(e.target.value)} />
        </FormField>
      </form>
    </Dialog>
  )
}
