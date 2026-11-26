import { useState, type ReactNode } from 'react'
import { Badge, Button, Input, Switch } from '@/components/atoms'
import { FormField, Select, toast } from '@/components/molecules'
import { ConfirmationModal, SettingsSection } from '@/components/organisms'
import {
  HOUR_OPTIONS,
  LANGUAGES,
  TIME_ZONES,
  ZENDESK_TBT_FIELDS,
  type BackupFile,
  type GeneralSettings,
  type PhoneNumber,
  type RingCentralSettings,
  type ZendeskSettings,
} from '@/mocks'
import { SettingsPage, SettingsTable, ToggleRow } from './SettingsKit'
import { useDraft } from './use-draft'

const opts = (xs: string[]) => xs.map((x) => ({ value: x, label: x }))

/** S4 General — workspace details and business hours. */
export function GeneralPage({
  sidebar,
  value,
  onSave,
  nextTicket,
}: {
  sidebar: ReactNode
  value: GeneralSettings
  onSave: (v: GeneralSettings) => void
  /** Number of the next ticket, for the prefix preview. */
  nextTicket: number
}) {
  const { draft, patch, setDraft, dirty, commit, reset } = useDraft(value, onSave)
  const setDay = (id: string, p: Partial<GeneralSettings['hours'][number]>) =>
    setDraft((d) => ({ ...d, hours: d.hours.map((h) => (h.id === id ? { ...h, ...p } : h)) }))
  const nameOk = draft.workspaceName.trim() !== ''
  const changed = [
    draft.workspaceName !== value.workspaceName && 'the workspace name',
    JSON.stringify(draft.hours) !== JSON.stringify(value.hours) && 'business hours',
  ].filter(Boolean)
  return (
    <SettingsPage
      sidebar={sidebar}
      title="General"
      description={`Workspace details shared by everyone in ${value.workspaceName}.`}
      form={{
        dirty,
        onSave: () =>
          nameOk
            ? (commit(), toast.success('Workspace saved'))
            : toast.error('Enter a workspace name'),
        onDiscard: reset,
        changed: changed.length ? changed.join(' and ') : 'workspace settings',
      }}
    >
      <SettingsSection title="Workspace">
        <FormField
          label="Workspace name"
          required
          error={nameOk ? undefined : 'Enter a workspace name'}
        >
          <Input
            value={draft.workspaceName}
            onChange={(e) => patch({ workspaceName: e.target.value })}
          />
        </FormField>
        <FormField label="Company">
          <Input value={draft.company} onChange={(e) => patch({ company: e.target.value })} />
        </FormField>
        <FormField label="Ticket ID prefix" helper={`Next ticket: ${draft.prefix}${nextTicket}`}>
          <Input
            value={draft.prefix}
            maxLength={4}
            onChange={(e) => patch({ prefix: e.target.value.toUpperCase() })}
          />
        </FormField>
        <FormField label="Default language">
          <Select
            value={draft.language}
            onValueChange={(language) => patch({ language })}
            options={opts(LANGUAGES)}
          />
        </FormField>
        <div className="col-span-full flex items-center gap-3 rounded-lg border px-3 py-2.5">
          <span className="grid size-9 place-items-center rounded-md bg-primary text-body-strong text-primary-foreground">
            {draft.workspaceName.trim().charAt(0).toUpperCase() || 'T'}
          </span>
          <span className="flex flex-1 flex-col">
            <span className="text-body text-foreground">Logo</span>
            <span className="text-small text-muted-foreground">
              Shown in emails and the customer portal · PNG or SVG
            </span>
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => toast('Logo upload needs a backend')}
          >
            Replace
          </Button>
        </div>
      </SettingsSection>
      <SettingsSection
        title="Business hours"
        description="Used for SLA timers and auto-replies."
        columns={1}
      >
        <FormField label="Time zone">
          <Select
            value={draft.timeZone}
            onValueChange={(timeZone) => patch({ timeZone })}
            options={opts(TIME_ZONES)}
          />
        </FormField>
        <SettingsTable
          rows={draft.hours}
          columns={[
            { label: 'Day', render: (h) => h.day },
            {
              label: 'Open',
              className: 'w-20',
              render: (h) => (
                <Switch
                  checked={h.open}
                  onCheckedChange={(open) => setDay(h.id, { open })}
                  aria-label={`Open ${h.day}`}
                />
              ),
            },
            {
              label: 'From',
              className: 'w-36',
              render: (h) =>
                h.open ? (
                  <Select
                    size="sm"
                    value={h.from}
                    onValueChange={(from) => setDay(h.id, { from })}
                    options={opts(HOUR_OPTIONS)}
                    aria-label={`${h.day} from`}
                  />
                ) : (
                  '—'
                ),
            },
            {
              label: 'To',
              className: 'w-36',
              render: (h) =>
                h.open ? (
                  <Select
                    size="sm"
                    value={h.to}
                    onValueChange={(to) => setDay(h.id, { to })}
                    options={opts(HOUR_OPTIONS)}
                    aria-label={`${h.day} to`}
                  />
                ) : (
                  '—'
                ),
            },
          ]}
        />
      </SettingsSection>
    </SettingsPage>
  )
}

/** Connected-integration card (S11 / S12 head). */
function ConnectionCard({
  logo,
  name,
  connected,
  detail,
  children,
  onConnect,
}: {
  logo: string
  name: string
  connected: boolean
  detail: string
  children: ReactNode
  onConnect: () => void
}) {
  return (
    <section className="flex items-center gap-3 rounded-lg border px-5 py-4">
      <span className="grid size-9 place-items-center rounded-md bg-primary text-small font-semibold text-primary-foreground">
        {logo}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-center gap-2 text-body-strong text-foreground">
          {name}
          <Badge variant={connected ? 'success' : 'neutral'} size="sm">
            {connected ? 'Connected' : 'Not connected'}
          </Badge>
        </span>
        <span className="truncate text-small text-muted-foreground">
          {connected ? detail : `Connect ${name} to turn this on`}
        </span>
      </span>
      {connected ? children : <Button onClick={onConnect}>Connect</Button>}
    </section>
  )
}

/** S11 Zendesk. */
export function ZendeskPage({
  sidebar,
  value,
  onSave,
}: {
  sidebar: ReactNode
  value: ZendeskSettings & { connected?: boolean; lastSync?: string }
  onSave: (v: ZendeskSettings & { connected?: boolean; lastSync?: string }) => void
}) {
  const { draft, patch, setDraft, dirty, commit, reset } = useDraft(value, onSave)
  const [disconnecting, setDisconnecting] = useState(false)
  const connected = value.connected !== false
  return (
    <SettingsPage
      sidebar={sidebar}
      title="Zendesk"
      description="Bring tickets and customers in from Zendesk."
      form={{
        dirty,
        onSave: () => (commit(), toast.success('Zendesk settings saved')),
        onDiscard: reset,
        changed: 'the Zendesk sync',
      }}
      overlays={
        <ConfirmationModal
          open={disconnecting}
          onOpenChange={setDisconnecting}
          variant="destructive"
          title="Disconnect Zendesk?"
          description="New tickets stop syncing. Tickets already imported stay in TBT."
          confirmLabel="Disconnect"
          onConfirm={() =>
            void (onSave({ ...value, connected: false }), toast.success('Zendesk disconnected'))
          }
        />
      }
    >
      <ConnectionCard
        logo="Z"
        name="Zendesk"
        connected={connected}
        detail={`mdisolutions.zendesk.com · last sync ${value.lastSync ?? '4 minutes ago'} · 3,412 tickets`}
        onConnect={() => (
          onSave({ ...value, connected: true, lastSync: 'just now' }),
          toast.success('Zendesk connected')
        )}
      >
        <Button
          variant="secondary"
          size="sm"
          onClick={() => (
            onSave({ ...value, lastSync: 'just now' }),
            setDraft((d) => ({ ...d, lastSync: 'just now' })),
            toast.success('Synced · 3 new tickets')
          )}
        >
          Sync now
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setDisconnecting(true)}>
          Disconnect
        </Button>
      </ConnectionCard>
      {connected && (
        <>
          <SettingsSection title="Sync settings" columns={1}>
            <ToggleRow
              label="Import new tickets"
              description="Every 5 minutes"
              checked={draft.importTickets}
              onChange={(importTickets) => patch({ importTickets })}
            />
            <ToggleRow
              label="Match customers by phone number"
              badge={
                <Badge variant="info" size="sm">
                  New
                </Badge>
              }
              description="Stops duplicates when the same caller has a Zendesk and a TBT record"
              checked={draft.matchByPhone}
              onChange={(matchByPhone) => patch({ matchByPhone })}
            />
            <ToggleRow
              label="Sync replies back to Zendesk"
              checked={draft.syncReplies}
              onChange={(syncReplies) => patch({ syncReplies })}
            />
            <ToggleRow
              label="Tag imported customers"
              description="Adds “Zendesk import”"
              checked={draft.tagImported}
              onChange={(tagImported) => patch({ tagImported })}
            />
          </SettingsSection>
          <SettingsSection title="Field mapping" columns={1}>
            <SettingsTable
              rows={draft.mapping}
              columns={[
                { label: 'Zendesk field', render: (m) => m.zendesk },
                {
                  label: 'TBT field',
                  className: 'w-52',
                  render: (m) => (
                    <Select
                      size="sm"
                      value={m.tbt}
                      aria-label={`TBT field for ${m.zendesk}`}
                      onValueChange={(tbt) =>
                        setDraft((d) => ({
                          ...d,
                          mapping: d.mapping.map((x) => (x.id === m.id ? { ...x, tbt } : x)),
                        }))
                      }
                      options={opts(ZENDESK_TBT_FIELDS)}
                    />
                  ),
                },
              ]}
            />
          </SettingsSection>
        </>
      )}
    </SettingsPage>
  )
}

/** S12 RingCentral — numbers apply straight away; call handling is saved with the header. */
export function RingCentralPage({
  sidebar,
  value,
  onSave,
  numbers,
  teams,
  onRouteNumber,
  onAddNumber,
  onEditNumber,
}: {
  sidebar: ReactNode
  value: RingCentralSettings & { connected?: boolean }
  onSave: (v: RingCentralSettings & { connected?: boolean }) => void
  numbers: PhoneNumber[]
  teams: string[]
  onRouteNumber: (id: string, team: string) => void
  onAddNumber: () => void
  onEditNumber: (n: PhoneNumber) => void
}) {
  const { draft, patch, dirty, commit, reset } = useDraft(value, onSave)
  const [disconnecting, setDisconnecting] = useState(false)
  const connected = value.connected !== false
  return (
    <SettingsPage
      sidebar={sidebar}
      title="RingCentral"
      description="Turn calls and voicemails into tickets."
      form={{
        dirty,
        onSave: () => (commit(), toast.success('Call handling saved')),
        onDiscard: reset,
        changed: 'call handling',
      }}
      overlays={
        <ConfirmationModal
          open={disconnecting}
          onOpenChange={setDisconnecting}
          variant="destructive"
          title="Disconnect RingCentral?"
          description="Calls stop creating tickets and the incoming-call bar turns off."
          confirmLabel="Disconnect"
          onConfirm={() =>
            void (onSave({ ...value, connected: false }), toast.success('RingCentral disconnected'))
          }
        />
      }
    >
      <ConnectionCard
        logo="RC"
        name="RingCentral"
        connected={connected}
        detail={`Account 4412-889 · ${numbers.length} numbers · webhooks healthy`}
        onConnect={() => (
          onSave({ ...value, connected: true }),
          toast.success('RingCentral connected')
        )}
      >
        <Button
          variant="secondary"
          size="sm"
          onClick={() => toast.success('Test call placed to ext. 200 — answer to finish')}
        >
          Test call
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setDisconnecting(true)}>
          Disconnect
        </Button>
      </ConnectionCard>
      {connected && (
        <>
          <SettingsSection
            title="Phone numbers"
            columns={1}
            action={
              <Button variant="secondary" size="sm" leadingIcon="plus" onClick={onAddNumber}>
                Add number
              </Button>
            }
          >
            <SettingsTable
              rows={numbers}
              onRowClick={onEditNumber}
              columns={[
                {
                  label: 'Number',
                  className: 'w-40',
                  render: (n) => <span className="tabular-nums">{n.number}</span>,
                },
                { label: 'Label', render: (n) => n.label },
                {
                  label: 'Routes to',
                  className: 'w-52',
                  render: (n) => (
                    <span
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <Select
                        size="sm"
                        value={n.routesTo}
                        aria-label={`Route ${n.number} to`}
                        onValueChange={(t) => onRouteNumber(n.id, t)}
                        options={opts(teams)}
                      />
                    </span>
                  ),
                },
              ]}
            />
          </SettingsSection>
          <SettingsSection title="Call handling" columns={1}>
            <ToggleRow
              label="Create a ticket for missed calls"
              checked={draft.missedCallTickets}
              onChange={(missedCallTickets) => patch({ missedCallTickets })}
            />
            <ToggleRow
              label="Attach voicemail audio and transcript"
              checked={draft.voicemail}
              onChange={(voicemail) => patch({ voicemail })}
            />
            <ToggleRow
              label="Add call recordings to the timeline"
              description="Callers hear a short notice first"
              checked={draft.recordings}
              onChange={(recordings) => patch({ recordings })}
            />
            <ToggleRow
              label="Reopen ticket if the same caller rings within 24h"
              checked={draft.reopen}
              onChange={(reopen) => patch({ reopen })}
            />
          </SettingsSection>
        </>
      )}
    </SettingsPage>
  )
}

const EXPORTS = [
  {
    id: 'tickets',
    title: 'Tickets',
    description: 'All tickets with messages · CSV',
    action: 'Export tickets',
    file: 'tickets',
    ext: 'csv',
    size: '38 MB',
  },
  {
    id: 'customers',
    title: 'Customers',
    description: 'Customers, tags and organizations · CSV',
    action: 'Export customers',
    file: 'customers',
    ext: 'csv',
    size: '1.2 MB',
  },
  {
    id: 'full',
    title: 'Full backup',
    description: 'Everything, including attachments · ZIP',
    action: 'Create backup',
    file: 'backup',
    ext: 'zip',
    size: '414 MB',
  },
]

/** S13 Backup & export. */
export function BackupPage({
  sidebar,
  nightly,
  onNightly,
  files,
  onCreate,
}: {
  sidebar: ReactNode
  nightly: boolean
  onNightly: (on: boolean) => void
  files: BackupFile[]
  onCreate: (file: Omit<BackupFile, 'id'>) => void
}) {
  const [busy, setBusy] = useState<string | null>(null)
  return (
    <SettingsPage
      sidebar={sidebar}
      title="Backup & export"
      description="Download your data or keep automatic backups."
    >
      <div className="grid grid-cols-3 gap-3">
        {EXPORTS.map((x) => (
          <section
            key={x.id}
            className="flex flex-col items-start gap-1 rounded-lg border px-4 py-3"
          >
            <h2 className="text-body-strong text-foreground">{x.title}</h2>
            <p className="flex-1 text-small text-muted-foreground">{x.description}</p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-2"
              loading={busy === x.id}
              onClick={() => {
                setBusy(x.id)
                setTimeout(() => {
                  setBusy(null)
                  onCreate({
                    file: `${x.file}-${new Date().toISOString().slice(0, 10)}.${x.ext}`,
                    createdBy: 'Team Lead',
                    size: x.size,
                    created: 'Just now',
                  })
                  toast.success(`${x.title} ready — added to Recent`)
                }, 900)
              }}
            >
              {x.action}
            </Button>
          </section>
        ))}
      </div>
      <SettingsSection
        title="Automatic backups"
        description="Stored for 30 days. Admins get an email when one fails."
        columns={1}
      >
        <ToggleRow
          label="Back up every night at 2:00 AM"
          description={nightly ? 'Next backup in 13 hours' : 'Off — only manual backups'}
          checked={nightly}
          onChange={(on) => (
            onNightly(on),
            toast.success(on ? 'Nightly backups on' : 'Nightly backups off')
          )}
        />
      </SettingsSection>
      <SettingsSection title="Recent backups & exports" columns={1}>
        <SettingsTable
          rows={files}
          columns={[
            { label: 'File', render: (f) => f.file },
            {
              label: 'Created by',
              className: 'w-32',
              render: (f) => <span className="text-muted-foreground">{f.createdBy}</span>,
            },
            {
              label: 'Size',
              className: 'w-24',
              render: (f) => <span className="text-muted-foreground tabular-nums">{f.size}</span>,
            },
            {
              label: 'Created',
              className: 'w-32',
              render: (f) => <span className="text-muted-foreground">{f.created}</span>,
            },
            {
              label: '',
              className: 'w-16 text-end',
              render: (f) => (
                <Button
                  variant="ghost"
                  size="sm"
                  leadingIcon="download"
                  aria-label={`Download ${f.file}`}
                  onClick={() => toast(`Downloading ${f.file}`)}
                />
              ),
            },
          ]}
        />
      </SettingsSection>
    </SettingsPage>
  )
}
