import { useState, type ReactNode } from 'react'
import { Avatar, Button, Input, Switch, Textarea } from '@/components/atoms'
import { FormField, Select, toast } from '@/components/molecules'
import { ConfirmationModal, SettingsSection } from '@/components/organisms'
import {
  LANGUAGES,
  TIME_ZONES,
  type NotificationEvent,
  type NotifyChannel,
  type ProfileSettings,
  type SignedInDevice,
} from '@/mocks'
import { SettingsPage, SettingsTable, ToggleRow } from './SettingsKit'
import { useDraft } from './use-draft'

const opts = (xs: string[]) => xs.map((x) => ({ value: x, label: x }))

/** S1 Profile. */
export function ProfilePage({
  sidebar,
  value,
  onSave,
}: {
  sidebar: ReactNode
  value: ProfileSettings
  onSave: (v: ProfileSettings) => void
}) {
  const { draft, patch, dirty, commit, reset } = useDraft(value, onSave)
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)
  const nameOk = draft.firstName.trim() !== ''
  const save = () => {
    if (!emailOk || !nameOk) return toast.error('Fix the highlighted fields first')
    commit()
    toast.success('Profile saved')
  }
  return (
    <SettingsPage
      sidebar={sidebar}
      title="Profile"
      description="How you appear to customers and teammates."
      form={{ dirty, onSave: save, onDiscard: reset, changed: 'your profile' }}
    >
      <SettingsSection title="Photo & name">
        <div className="col-span-full flex items-center gap-2">
          <Avatar name={`${draft.firstName} ${draft.lastName}`} size="lg" />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => toast('Photo upload needs a backend — kept the initials')}
          >
            Upload photo
          </Button>
          <Button variant="ghost" size="sm">
            Remove
          </Button>
        </div>
        <FormField label="First name" required error={nameOk ? undefined : 'Enter your first name'}>
          <Input value={draft.firstName} onChange={(e) => patch({ firstName: e.target.value })} />
        </FormField>
        <FormField label="Last name">
          <Input value={draft.lastName} onChange={(e) => patch({ lastName: e.target.value })} />
        </FormField>
        <FormField label="Display name" helper="Shown in replies to customers">
          <Input
            value={draft.displayName}
            onChange={(e) => patch({ displayName: e.target.value })}
          />
        </FormField>
        <FormField label="Email" error={emailOk ? undefined : 'Enter a valid email'}>
          <Input
            type="email"
            leadingIcon="mail"
            value={draft.email}
            onChange={(e) => patch({ email: e.target.value })}
          />
        </FormField>
      </SettingsSection>
      <SettingsSection title="Preferences">
        <FormField label="Language">
          <Select
            value={draft.language}
            onValueChange={(language) => patch({ language })}
            options={opts(LANGUAGES)}
          />
        </FormField>
        <FormField label="Time zone">
          <Select
            value={draft.timeZone}
            onValueChange={(timeZone) => patch({ timeZone })}
            options={opts(TIME_ZONES)}
          />
        </FormField>
      </SettingsSection>
      <SettingsSection
        title="Email signature"
        description="Added to the end of email replies."
        columns={1}
      >
        <Textarea
          rows={3}
          value={draft.signature}
          onChange={(e) => patch({ signature: e.target.value })}
          aria-label="Email signature"
        />
      </SettingsSection>
    </SettingsPage>
  )
}

export interface SecurityState {
  authenticator: boolean
  backupCodes: boolean
  passwordChanged: string
}

/** S2 Security — password, two-step sign-in, signed-in devices. Changes apply straight away. */
export function SecurityPage({
  sidebar,
  value,
  onChange,
  devices,
  onSignOut,
}: {
  sidebar: ReactNode
  value: SecurityState
  onChange: (v: SecurityState) => void
  devices: SignedInDevice[]
  /** A device id, or 'all' for everywhere but this one. */
  onSignOut: (id: string) => void
}) {
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [tried, setTried] = useState(false)
  const [signOutAll, setSignOutAll] = useState(false)
  const errors = {
    current: pw.current ? undefined : 'Enter your current password',
    next: pw.next.length >= 10 ? undefined : 'Use at least 10 characters',
    confirm: pw.confirm === pw.next ? undefined : 'Passwords don’t match',
  }
  const update = () => {
    setTried(true)
    if (Object.values(errors).some(Boolean)) return
    onChange({ ...value, passwordChanged: 'just now' })
    setPw({ current: '', next: '', confirm: '' })
    setTried(false)
    toast.success('Password updated')
  }
  return (
    <SettingsPage
      sidebar={sidebar}
      title="Security"
      description="Keep your account safe."
      overlays={
        <ConfirmationModal
          open={signOutAll}
          onOpenChange={setSignOutAll}
          title="Sign out everywhere?"
          description="Every other device has to sign in again. This one stays signed in."
          confirmLabel="Sign out"
          variant="destructive"
          onConfirm={() => onSignOut('all')}
        />
      }
    >
      <SettingsSection
        title="Password"
        description={`Last changed ${value.passwordChanged}.`}
        columns={1}
        action={<Button onClick={update}>Update password</Button>}
      >
        <form
          className="grid grid-cols-3 gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            update()
          }}
        >
          <FormField label="Current password" error={tried ? errors.current : undefined}>
            <Input
              type="password"
              value={pw.current}
              onChange={(e) => setPw({ ...pw, current: e.target.value })}
              autoComplete="current-password"
            />
          </FormField>
          <FormField label="New password" error={tried ? errors.next : undefined}>
            <Input
              type="password"
              placeholder="At least 10 characters"
              value={pw.next}
              onChange={(e) => setPw({ ...pw, next: e.target.value })}
              autoComplete="new-password"
            />
          </FormField>
          <FormField label="Confirm" error={tried ? errors.confirm : undefined}>
            <Input
              type="password"
              placeholder="Repeat new password"
              value={pw.confirm}
              onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
              autoComplete="new-password"
            />
          </FormField>
          <button type="submit" hidden />
        </form>
      </SettingsSection>
      <SettingsSection
        title="Two-step sign-in"
        description="Ask for a code from an authenticator app when signing in."
        columns={1}
      >
        <ToggleRow
          label="Authenticator app"
          description={value.authenticator ? 'Turned on · Nov 2, 2026' : 'Off'}
          checked={value.authenticator}
          onChange={(authenticator) => {
            onChange({ ...value, authenticator })
            toast.success(authenticator ? 'Authenticator turned on' : 'Authenticator turned off')
          }}
        />
        <ToggleRow
          label="Backup codes"
          description={
            value.backupCodes ? '8 of 10 left' : 'Use these when you don’t have your phone'
          }
          checked={value.backupCodes}
          onChange={(backupCodes) => onChange({ ...value, backupCodes })}
        />
      </SettingsSection>
      <SettingsSection
        title="Signed-in devices"
        columns={1}
        action={
          <Button
            variant="ghost"
            size="sm"
            disabled={devices.length < 2}
            onClick={() => setSignOutAll(true)}
          >
            Sign out everywhere
          </Button>
        }
      >
        <SettingsTable
          rows={devices}
          columns={[
            { label: 'Device', render: (d) => `${d.device}${d.current ? ' · this device' : ''}` },
            {
              label: 'Location',
              className: 'w-32',
              render: (d) => <span className="text-muted-foreground">{d.location}</span>,
            },
            {
              label: 'Last active',
              className: 'w-28',
              render: (d) => <span className="text-muted-foreground">{d.lastActive}</span>,
            },
            {
              label: '',
              className: 'w-28 text-end',
              render: (d) =>
                d.current ? (
                  <span className="text-small text-muted-foreground">Current</span>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => onSignOut(d.id)}>
                    Sign out
                  </Button>
                ),
            },
          ]}
        />
      </SettingsSection>
    </SettingsPage>
  )
}

const CHANNEL_LABEL: Record<NotifyChannel, string> = {
  inApp: 'In-app',
  email: 'Email',
  desktop: 'Desktop',
}

/** S3 Notifications — event × channel matrix and quiet hours. */
export function NotificationsPage({
  sidebar,
  value,
  onSave,
}: {
  sidebar: ReactNode
  value: { events: NotificationEvent[]; quietHours: boolean }
  onSave: (v: { events: NotificationEvent[]; quietHours: boolean }) => void
}) {
  const { draft, setDraft, patch, dirty, commit, reset } = useDraft(value, onSave)
  const toggle = (id: string, ch: NotifyChannel, on: boolean) =>
    setDraft((d) => ({ ...d, events: d.events.map((e) => (e.id === id ? { ...e, [ch]: on } : e)) }))
  return (
    <SettingsPage
      sidebar={sidebar}
      title="Notifications"
      description="Choose what reaches you, and where."
      form={{
        dirty,
        onSave: () => (commit(), toast.success('Notification settings saved')),
        onDiscard: reset,
        changed: 'your notification settings',
      }}
    >
      <SettingsSection title="Events" columns={1}>
        <SettingsTable
          rows={draft.events}
          columns={[
            { label: 'When…', render: (e) => e.label },
            ...(['inApp', 'email', 'desktop'] as NotifyChannel[]).map((ch) => ({
              label: CHANNEL_LABEL[ch],
              className: 'w-24',
              render: (e: NotificationEvent) => (
                <Switch
                  checked={e[ch]}
                  onCheckedChange={(on) => toggle(e.id, ch, on)}
                  aria-label={`${CHANNEL_LABEL[ch]}: ${e.label}`}
                />
              ),
            })),
          ]}
        />
      </SettingsSection>
      <SettingsSection
        title="Quiet hours"
        description="No desktop or email notifications during these times."
        columns={1}
      >
        <ToggleRow
          label="Weekdays 6:00 PM – 8:00 AM"
          description="Mentions and breaches still come through"
          checked={draft.quietHours}
          onChange={(quietHours) => patch({ quietHours })}
        />
      </SettingsSection>
    </SettingsPage>
  )
}
