import { useState, type ReactNode } from 'react'
import { Badge, Button, IconButton, Switch } from '@/components/atoms'
import { toast } from '@/components/molecules'
import {
  RecordSheet,
  SettingsSection,
  type RecordField,
  type RecordValues,
} from '@/components/organisms'
import {
  CHANNELS,
  FIELD_TYPES,
  wsAgents,
  type Application,
  type RoutingRule,
  type SlaPolicy,
  type TicketField,
} from '@/mocks'
import { NotificationsPage, ProfilePage, SecurityPage } from '@/pages/settings/AccountPages'
import { RoutingRuleSheet } from '@/pages/settings/RoutingRuleSheet'
import { Footnote, SettingsPage, SettingsTable } from '@/pages/settings/SettingsKit'
import {
  BackupPage,
  GeneralPage,
  RingCentralPage,
  ZendeskPage,
} from '@/pages/settings/WorkspacePages'
import { TICKET_STATUS_LABEL } from '@/types'
import { AppSidebar } from './AppSidebar'
import { newId } from './collections-context'
import {
  useActionTypes,
  useApplications,
  useBackupDoc,
  useBackups,
  useCustomerTags,
  useDevices,
  useGeneralDoc,
  useNotificationsDoc,
  useOrganizations,
  usePhoneNumbers,
  useProfileDoc,
  useRingCentralDoc,
  useRoutingRules,
  useSecurityDoc,
  useSlaPolicies,
  useTeams,
  useTicketFields,
  useZendeskDoc,
} from './stores'
import { useWorkspace } from './workspace-context'

/** Move item `i` by `d` places. */
const move = <T,>(xs: T[], i: number, d: number) => {
  const j = i + d
  if (j < 0 || j >= xs.length) return xs
  const next = [...xs]
  ;[next[i], next[j]] = [next[j]!, next[i]!]
  return next
}

function OrderButtons({
  i,
  n,
  onMove,
  label,
}: {
  i: number
  n: number
  onMove: (d: number) => void
  label: string
}) {
  return (
    <span
      className="flex"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <IconButton
        icon="chevron-up"
        size="sm"
        variant="ghost"
        label={`Move ${label} up`}
        disabled={i === 0}
        onClick={() => onMove(-1)}
      />
      <IconButton
        icon="chevron-down"
        size="sm"
        variant="ghost"
        label={`Move ${label} down`}
        disabled={i === n - 1}
        onClick={() => onMove(1)}
      />
    </span>
  )
}

const mins = (m: number) => (m < 60 ? `${m}m` : `${m / 60}h`)
const FIRST_REPLY = [15, 30, 60, 120, 240]
const RESOLVE = [4, 8, 24, 48, 72]
const HOURS_247 = '24/7 — ignore business hours'
const HOURS_BIZ = 'Business hours only'
const APPLIES_OPTIONS = [
  'Priority is Urgent',
  'Priority is High',
  'Tag is VIP',
  'Application is POS',
  'Any application',
  'All other tickets',
]

/** /settings/:view — S1–S13 with X20 (SLA), X21 (routing rule) and X22 (unsaved changes). */
export function SettingsViewRoute({ view }: { view: string }) {
  const sidebar = <AppSidebar />
  switch (view) {
    case 'profile':
      return <ProfileRoute sidebar={sidebar} />
    case 'security':
      return <SecurityRoute sidebar={sidebar} />
    case 'notifications':
      return <NotificationsRoute sidebar={sidebar} />
    case 'general':
      return <GeneralRoute sidebar={sidebar} />
    case 'applications':
      return <ApplicationsRoute sidebar={sidebar} />
    case 'organizations':
      return <OrganizationsRoute sidebar={sidebar} />
    case 'sla-policies':
      return <SlaRoute sidebar={sidebar} />
    case 'fields':
      return <FieldsRoute sidebar={sidebar} />
    case 'tags':
      return <TagsRoute sidebar={sidebar} />
    case 'routing':
      return <RoutingRoute sidebar={sidebar} />
    case 'zendesk':
      return <ZendeskRoute sidebar={sidebar} />
    case 'ringcentral':
      return <RingCentralRoute sidebar={sidebar} />
    case 'backup':
      return <BackupRoute sidebar={sidebar} />
  }
  return null
}

type R = { sidebar: ReactNode }

function ProfileRoute({ sidebar }: R) {
  const [doc, save] = useProfileDoc()
  return <ProfilePage sidebar={sidebar} value={doc} onSave={save} />
}

function SecurityRoute({ sidebar }: R) {
  const [doc, save] = useSecurityDoc()
  const devices = useDevices()
  return (
    <SecurityPage
      sidebar={sidebar}
      value={doc}
      onChange={save}
      devices={devices.items}
      onSignOut={(id) => {
        if (id === 'all') devices.replace(devices.items.filter((d) => d.current))
        else devices.remove(id)
        toast.success(id === 'all' ? 'Signed out of every other device' : 'Device signed out')
      }}
    />
  )
}

function NotificationsRoute({ sidebar }: R) {
  const [doc, save] = useNotificationsDoc()
  return <NotificationsPage sidebar={sidebar} value={doc} onSave={save} />
}

function GeneralRoute({ sidebar }: R) {
  const [doc, save] = useGeneralDoc()
  const { tickets } = useWorkspace()
  return (
    <GeneralPage
      sidebar={sidebar}
      value={doc}
      onSave={save}
      nextTicket={Math.max(0, ...tickets.map((t) => t.id)) + 1}
    />
  )
}

/** S5 list + edit application. */
function ApplicationsRoute({ sidebar }: R) {
  const apps = useApplications()
  const teams = useTeams()
  const sla = useSlaPolicies()
  const [editing, setEditing] = useState<string | null | undefined>()
  const app = editing ? apps.items.find((a) => a.id === editing) : undefined
  return (
    <SettingsPage
      sidebar={sidebar}
      title="Applications"
      description="Products your customers get support for. Each sets a default team and SLA."
      actions={
        <Button leadingIcon="plus" onClick={() => setEditing(null)}>
          Add application
        </Button>
      }
      overlays={
        <RecordSheet
          key={editing ?? (editing === null ? 'new' : 'closed')}
          open={editing !== undefined}
          onOpenChange={(o) => !o && setEditing(undefined)}
          title={app ? 'Edit application' : 'Add application'}
          description={app?.name}
          saveLabel={app ? 'Save' : 'Add application'}
          deleteLabel="Archive"
          initial={
            app ?? {
              defaultTeam: teams.items[0]?.name,
              slaPolicy: 'Standard',
              channels: ['Email'],
              active: true,
            }
          }
          fields={[
            {
              name: 'name',
              label: 'Name',
              type: 'text',
              required: true,
              validate: (v) =>
                apps.items.some(
                  (a) =>
                    a.name.toLowerCase() === String(v).trim().toLowerCase() && a.id !== app?.id,
                )
                  ? 'That application already exists'
                  : undefined,
            },
            { name: 'description', label: 'Description', type: 'textarea', rows: 2 },
            {
              name: 'defaultTeam',
              label: 'Default team',
              type: 'select',
              half: true,
              options: teams.items.map((t) => t.name),
              helper: 'New tickets go here',
            },
            {
              name: 'slaPolicy',
              label: 'SLA policy',
              type: 'select',
              half: true,
              options: sla.items.map((s) => s.name),
            },
            { name: 'channels', label: 'Channels', type: 'tags', options: CHANNELS },
            { name: 'supportEmail', label: 'Support email', type: 'email' },
            {
              name: 'active',
              label: 'Active',
              type: 'switch',
              helper: 'Customers can pick this application',
            },
          ]}
          onDelete={
            app ? () => (apps.remove(app.id), toast.success(`${app.name} archived`)) : undefined
          }
          onSave={(v) => {
            const next = { ...(v as unknown as Application), id: app?.id ?? newId('app') }
            apps.upsert(next)
            toast.success(app ? `Saved ${next.name}` : `${next.name} added`)
          }}
        />
      }
    >
      <div className="flex flex-col overflow-hidden rounded-lg border">
        {apps.items.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setEditing(a.id)}
            className="flex items-center gap-3 border-b px-4 py-3 text-start outline-none last:border-b-0 hover:bg-accent focus-visible:bg-accent"
          >
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-body text-foreground">{a.name}</span>
              <span className="truncate text-small text-muted-foreground">
                {a.description || 'No description'}
              </span>
            </span>
            <span className="w-44 truncate text-small text-muted-foreground">{a.defaultTeam}</span>
            {!a.active && (
              <Badge variant="neutral" size="sm">
                Disabled
              </Badge>
            )}
          </button>
        ))}
      </div>
      <p className="text-small text-muted-foreground">
        Disabled applications are hidden from New ticket but keep their history.
      </p>
    </SettingsPage>
  )
}

/** S6 Organizations. */
function OrganizationsRoute({ sidebar }: R) {
  const orgs = useOrganizations()
  const apps = useApplications()
  const [editing, setEditing] = useState<string | null | undefined>()
  const org = editing ? orgs.items.find((o) => o.id === editing) : undefined
  return (
    <SettingsPage
      sidebar={sidebar}
      title="Organizations"
      description="Group customers by company. Customers with a matching email domain join automatically."
      actions={
        <Button leadingIcon="plus" onClick={() => setEditing(null)}>
          Add organization
        </Button>
      }
      overlays={
        <RecordSheet
          key={editing ?? (editing === null ? 'new' : 'closed')}
          open={editing !== undefined}
          onOpenChange={(o) => !o && setEditing(undefined)}
          title={org ? 'Edit organization' : 'Add organization'}
          saveLabel={org ? 'Save' : 'Add organization'}
          initial={org}
          fields={[
            { name: 'name', label: 'Name', type: 'text', required: true },
            {
              name: 'domain',
              label: 'Email domain',
              type: 'text',
              required: true,
              placeholder: 'company.lk',
              helper: 'Customers who email from this domain join this organization',
              validate: (v) =>
                !/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(String(v).trim())
                  ? 'Use a domain like company.lk'
                  : orgs.items.some((o) => o.domain === String(v).trim() && o.id !== org?.id)
                    ? 'Another organization uses this domain'
                    : undefined,
            },
            {
              name: 'applications',
              label: 'Applications',
              type: 'tags',
              options: apps.items.map((a) => a.name),
            },
          ]}
          onDelete={
            org ? () => (orgs.remove(org.id), toast.success(`Deleted ${org.name}`)) : undefined
          }
          onSave={(v) => {
            orgs.upsert({
              customers: 0,
              ...org,
              id: org?.id ?? newId('org'),
              name: String(v.name),
              domain: String(v.domain).toLowerCase(),
              applications: v.applications as string[],
            })
            toast.success(org ? 'Organization saved' : `${String(v.name)} added`)
          }}
        />
      }
    >
      <SettingsTable
        rows={orgs.items}
        onRowClick={(o) => setEditing(o.id)}
        columns={[
          { label: 'Organization', render: (o) => o.name },
          {
            label: 'Domain',
            className: 'w-36',
            render: (o) => <span className="text-muted-foreground">{o.domain}</span>,
          },
          {
            label: 'Customers',
            className: 'w-24',
            render: (o) => <span className="tabular-nums">{o.customers}</span>,
          },
          {
            label: 'Applications',
            className: 'w-52',
            render: (o) =>
              o.applications.length ? (
                <span className="flex gap-1">
                  {o.applications.map((a) => (
                    <Badge key={a} variant="outline" size="sm">
                      {a}
                    </Badge>
                  ))}
                </span>
              ) : (
                <span className="text-muted-foreground">—</span>
              ),
          },
        ]}
      />
    </SettingsPage>
  )
}

/** S7 SLA policies + X20 Edit SLA policy. Shared with Reports › SLA. */
function SlaRoute({ sidebar }: R) {
  const sla = useSlaPolicies()
  const [editing, setEditing] = useState<string | null | undefined>()
  const policy = editing ? sla.items.find((p) => p.id === editing) : undefined
  const fields: RecordField[] = [
    { name: 'name', label: 'Name', type: 'text', required: true },
    {
      name: 'applies',
      label: 'Applies when',
      type: 'tags',
      options: APPLIES_OPTIONS,
      required: true,
    },
    {
      name: 'first',
      label: 'First reply within',
      type: 'select',
      half: true,
      options: FIRST_REPLY.map((m) =>
        m < 60 ? `${m} minutes` : `${m / 60} hour${m > 60 ? 's' : ''}`,
      ),
    },
    {
      name: 'resolve',
      label: 'Resolve within',
      type: 'select',
      half: true,
      options: RESOLVE.map((h) => `${h} hours`),
    },
    { name: 'hours', label: 'Hours', type: 'select', options: [HOURS_247, HOURS_BIZ] },
    {
      name: 'warnAtRisk',
      label: 'Warn when 30 minutes are left',
      type: 'switch',
      helper: 'Notifies the assignee and marks the ticket At risk',
    },
    {
      name: 'escalate',
      label: 'Escalate when breached',
      type: 'switch',
      helper: 'Reassigns to the team lead and notifies them',
    },
    { name: 'pauseOnWaiting', label: 'Pause while waiting for the customer', type: 'switch' },
  ]
  const toValues = (p?: SlaPolicy) =>
    p && {
      name: p.name,
      applies: p.appliesTo.split(' · '),
      first:
        fields[2]!.options![FIRST_REPLY.indexOf(p.firstResponseMins)] ?? fields[2]!.options![0],
      resolve: `${p.resolveHours} hours`,
      hours: p.businessHours ? HOURS_BIZ : HOURS_247,
      warnAtRisk: p.warnAtRisk ?? true,
      escalate: p.escalate ?? true,
      pauseOnWaiting: p.pauseOnWaiting ?? true,
    }
  const fromValues = (v: RecordValues): Partial<SlaPolicy> => {
    const first = FIRST_REPLY[fields[2]!.options!.indexOf(String(v.first))] ?? 60
    const resolve = parseInt(String(v.resolve))
    return {
      name: String(v.name),
      appliesTo: (v.applies as string[]).join(' · '),
      firstResponseMins: first,
      resolveHours: resolve,
      target: `Resolve in ${resolve}h`,
      businessHours: v.hours === HOURS_BIZ,
      warnAtRisk: !!v.warnAtRisk,
      escalate: !!v.escalate,
      pauseOnWaiting: !!v.pauseOnWaiting,
    }
  }
  const index = policy ? sla.items.indexOf(policy) : -1
  return (
    <SettingsPage
      sidebar={sidebar}
      title="SLA policies"
      icon="reports"
      description="The first policy that matches a ticket is used. Use the arrows to change the order."
      actions={
        <Button leadingIcon="plus" onClick={() => setEditing(null)}>
          Add policy
        </Button>
      }
      overlays={
        <RecordSheet
          key={editing ?? (editing === null ? 'new' : 'closed')}
          open={editing !== undefined}
          onOpenChange={(o) => !o && setEditing(undefined)}
          title={policy ? 'Edit SLA policy' : 'New SLA policy'}
          description={
            policy
              ? `${policy.name} · ${index === 0 ? 'applies first' : `order ${index + 1} of ${sla.items.length}`}`
              : 'Added at the end of the list'
          }
          saveLabel="Save"
          deleteLabel="Delete policy"
          fields={fields}
          initial={
            toValues(policy) ?? {
              applies: ['Any application'],
              resolve: '24 hours',
              first: '1 hour',
              hours: HOURS_BIZ,
              warnAtRisk: true,
              escalate: false,
              pauseOnWaiting: true,
            }
          }
          onDelete={
            policy
              ? () => (sla.remove(policy.id), toast.success(`Deleted ${policy.name}`))
              : undefined
          }
          onSave={(v) => {
            if (policy) sla.update(policy.id, fromValues(v))
            else
              sla.replace([
                ...sla.items,
                { id: newId('sla'), active: true, ...fromValues(v) } as SlaPolicy,
              ])
            toast.success('SLA policy saved')
          }}
        />
      }
    >
      <SettingsTable
        rows={sla.items}
        onRowClick={(p) => setEditing(p.id)}
        columns={[
          {
            label: '',
            className: 'w-20',
            render: (p) => (
              <OrderButtons
                i={sla.items.indexOf(p)}
                n={sla.items.length}
                label={p.name}
                onMove={(d) => sla.replace(move(sla.items, sla.items.indexOf(p), d))}
              />
            ),
          },
          { label: 'Policy', className: 'w-36', render: (p) => p.name },
          {
            label: 'Applies when',
            render: (p) => <span className="text-muted-foreground">{p.appliesTo}</span>,
          },
          { label: 'First reply', className: 'w-24', render: (p) => mins(p.firstResponseMins) },
          { label: 'Resolve', className: 'w-20', render: (p) => `${p.resolveHours}h` },
          {
            label: 'Hours',
            className: 'w-24',
            render: (p) => (
              <span className="text-muted-foreground">{p.businessHours ? 'Business' : '24/7'}</span>
            ),
          },
        ]}
      />
      <Footnote>First-reply targets start counting once response tracking is switched on.</Footnote>
    </SettingsPage>
  )
}

/** S8 Ticket fields + action types. */
function FieldsRoute({ sidebar }: R) {
  const fieldsC = useTicketFields()
  const actions = useActionTypes()
  const [editing, setEditing] = useState<
    { kind: 'field' | 'action'; id: string | null } | undefined
  >()
  const field =
    editing?.kind === 'field' && editing.id
      ? fieldsC.items.find((f) => f.id === editing.id)
      : undefined
  const action =
    editing?.kind === 'action' && editing.id
      ? actions.items.find((a) => a.id === editing.id)
      : undefined
  const close = (o: boolean) => !o && setEditing(undefined)
  const statuses = Object.values(TICKET_STATUS_LABEL)
  return (
    <SettingsPage
      sidebar={sidebar}
      title="Ticket fields"
      icon="knowledge"
      description="Fields agents fill in on a ticket, and the follow-up actions they can log."
      overlays={
        <>
          <RecordSheet
            key={editing?.kind === 'field' ? (editing.id ?? 'new') : 'closed-f'}
            open={editing?.kind === 'field'}
            onOpenChange={close}
            title={field ? 'Edit field' : 'Add field'}
            initial={field ?? { type: 'Text', required: false, shownOn: ['Details'] }}
            fields={[
              { name: 'name', label: 'Name', type: 'text', required: true },
              { name: 'type', label: 'Type', type: 'select', options: FIELD_TYPES },
              {
                name: 'shownOn',
                label: 'Shown on',
                type: 'tags',
                options: ['New ticket', 'Details'],
              },
              {
                name: 'required',
                label: 'Required',
                type: 'switch',
                helper: 'Agents can’t resolve a ticket without it',
              },
            ]}
            onDelete={
              field
                ? () => (fieldsC.remove(field.id), toast.success(`Deleted ${field.name}`))
                : undefined
            }
            onSave={(v) => (
              fieldsC.upsert({
                id: field?.id ?? newId('f'),
                name: String(v.name),
                type: v.type as TicketField['type'],
                required: !!v.required,
                shownOn: v.shownOn as string[],
              }),
              toast.success('Field saved')
            )}
          />
          <RecordSheet
            key={editing?.kind === 'action' ? (editing.id ?? 'new') : 'closed-a'}
            open={editing?.kind === 'action'}
            onOpenChange={close}
            variant="dialog"
            title={action ? 'Edit action type' : 'Add action type'}
            initial={action ?? { setsStatus: statuses[0] }}
            fields={[
              { name: 'name', label: 'Action', type: 'text', required: true },
              { name: 'setsStatus', label: 'Sets status to', type: 'select', options: statuses },
            ]}
            onDelete={
              action
                ? () => (actions.remove(action.id), toast.success(`Deleted ${action.name}`))
                : undefined
            }
            onSave={(v) => (
              actions.upsert({
                used30: 0,
                ...action,
                id: action?.id ?? newId('a'),
                name: String(v.name),
                setsStatus: String(v.setsStatus),
              }),
              toast.success('Action type saved')
            )}
          />
        </>
      }
    >
      <SettingsSection
        title="Ticket fields"
        columns={1}
        action={
          <Button
            variant="secondary"
            size="sm"
            leadingIcon="plus"
            onClick={() => setEditing({ kind: 'field', id: null })}
          >
            Add field
          </Button>
        }
      >
        <SettingsTable
          rows={fieldsC.items}
          onRowClick={(f) => setEditing({ kind: 'field', id: f.id })}
          columns={[
            { label: 'Field', render: (f) => f.name },
            {
              label: 'Type',
              className: 'w-32',
              render: (f) => <span className="text-muted-foreground">{f.type}</span>,
            },
            {
              label: 'Required',
              className: 'w-24',
              render: (f) => (
                <span onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                  <Switch
                    checked={f.required}
                    aria-label={`${f.name} required`}
                    onCheckedChange={(required) => fieldsC.update(f.id, { required })}
                  />
                </span>
              ),
            },
            {
              label: 'Shown on',
              className: 'w-44',
              render: (f) =>
                f.shownOn.length ? (
                  <span className="flex gap-1">
                    {f.shownOn.map((s) => (
                      <Badge key={s} variant="outline" size="sm">
                        {s}
                      </Badge>
                    ))}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                ),
            },
          ]}
        />
      </SettingsSection>
      <SettingsSection
        title="Action types"
        description="Logged from the ticket’s More menu."
        columns={1}
        action={
          <Button
            variant="secondary"
            size="sm"
            leadingIcon="plus"
            onClick={() => setEditing({ kind: 'action', id: null })}
          >
            Add action type
          </Button>
        }
      >
        <SettingsTable
          rows={actions.items}
          onRowClick={(a) => setEditing({ kind: 'action', id: a.id })}
          columns={[
            { label: 'Action', render: (a) => a.name },
            {
              label: 'Sets status to',
              className: 'w-44',
              render: (a) => <span className="text-muted-foreground">{a.setsStatus}</span>,
            },
            {
              label: 'Used (30d)',
              className: 'w-24',
              render: (a) => <span className="tabular-nums">{a.used30}</span>,
            },
          ]}
        />
      </SettingsSection>
    </SettingsPage>
  )
}

/** S9 Customer tags. */
function TagsRoute({ sidebar }: R) {
  const tags = useCustomerTags()
  const [editing, setEditing] = useState<string | null | undefined>()
  const tag = editing ? tags.items.find((t) => t.id === editing) : undefined
  return (
    <SettingsPage
      sidebar={sidebar}
      title="Customer tags"
      icon="customers"
      description="Tags help agents spot important customers at a glance."
      actions={
        <Button leadingIcon="plus" onClick={() => setEditing(null)}>
          New tag
        </Button>
      }
      overlays={
        <RecordSheet
          key={editing ?? (editing === null ? 'new' : 'closed')}
          open={editing !== undefined}
          onOpenChange={(o) => !o && setEditing(undefined)}
          variant="dialog"
          title={tag ? 'Edit tag' : 'New tag'}
          initial={tag ?? { autoAdded: false }}
          fields={[
            {
              name: 'name',
              label: 'Tag',
              type: 'text',
              required: true,
              validate: (v) =>
                tags.items.some(
                  (t) =>
                    t.name.toLowerCase() === String(v).trim().toLowerCase() && t.id !== tag?.id,
                )
                  ? 'That tag already exists'
                  : undefined,
            },
            { name: 'description', label: 'Description', type: 'text' },
            {
              name: 'autoAdded',
              label: 'Add automatically',
              type: 'switch',
              helper: 'TBT adds and removes this tag by its rule',
            },
          ]}
          onDelete={
            tag
              ? () => (
                  tags.remove(tag.id),
                  toast.success(`Deleted ${tag.name} — removed from ${tag.customers} customers`)
                )
              : undefined
          }
          onSave={(v) => (
            tags.upsert({
              customers: 0,
              ...tag,
              id: tag?.id ?? newId('tg'),
              name: String(v.name),
              description: String(v.description),
              autoAdded: !!v.autoAdded,
            }),
            toast.success('Tag saved')
          )}
        />
      }
    >
      <SettingsTable
        rows={tags.items}
        onRowClick={(t) => setEditing(t.id)}
        columns={[
          {
            label: 'Tag',
            className: 'w-40',
            render: (t) => (
              <Badge variant={t.name === 'VIP' ? 'warning' : 'outline'}>{t.name}</Badge>
            ),
          },
          {
            label: 'Description',
            render: (t) => <span className="text-muted-foreground">{t.description}</span>,
          },
          {
            label: 'Customers',
            className: 'w-24',
            render: (t) => <span className="tabular-nums">{t.customers}</span>,
          },
          {
            label: 'Auto-added',
            className: 'w-28',
            render: (t) => (
              <span onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                <Switch
                  checked={t.autoAdded}
                  aria-label={`${t.name} auto-added`}
                  onCheckedChange={(autoAdded) => tags.update(t.id, { autoAdded })}
                />
              </span>
            ),
          },
        ]}
      />
    </SettingsPage>
  )
}

/** S10 Auto-routing + X21 Edit routing rule. */
function RoutingRoute({ sidebar }: R) {
  const rules = useRoutingRules()
  const teams = useTeams()
  const sla = useSlaPolicies()
  const tags = useCustomerTags()
  const [editing, setEditing] = useState<string | null | undefined>()
  const rule = editing ? rules.items.find((r) => r.id === editing) : undefined
  const agents = Object.values(wsAgents).map((a) => a.name)
  const choices = {
    'Assign to team': teams.items.map((t) => t.name),
    'Assign to agent': agents,
    Notify: agents,
    'Set SLA policy': sla.items.map((s) => s.name),
    'Set priority': ['Urgent', 'High', 'Medium', 'Low'],
    'Add tag': tags.items.map((t) => t.name),
  }
  const describe = (r: RoutingRule) =>
    r.actions
      .map((a) => (a.kind.startsWith('Assign') ? a.value : `${a.kind.toLowerCase()} ${a.value}`))
      .join(' · ')
  return (
    <SettingsPage
      sidebar={sidebar}
      title="Auto-routing"
      icon="team"
      description="Rules run top to bottom when a ticket is created. The first match wins."
      actions={
        <Button leadingIcon="plus" onClick={() => setEditing(null)}>
          Add rule
        </Button>
      }
      overlays={
        <RoutingRuleSheet
          key={editing ?? (editing === null ? 'new' : 'closed')}
          open={editing !== undefined}
          onOpenChange={(o) => !o && setEditing(undefined)}
          rule={rule}
          position={
            rule
              ? `Rule ${rules.items.indexOf(rule) + 1} of ${rules.items.length}`
              : `Added before “Everything else”`
          }
          choices={choices}
          onDelete={
            rule ? () => (rules.remove(rule.id), toast.success(`Deleted ${rule.name}`)) : undefined
          }
          onSave={(r) => {
            if (rule) rules.update(rule.id, r)
            else {
              const next = [...rules.items]
              const fallback = next.findIndex((x) => !x.conditions.length)
              next.splice(fallback < 0 ? next.length : fallback, 0, {
                ...r,
                id: newId('r'),
                matched30: 0,
              })
              rules.replace(next)
            }
            toast.success('Rule saved')
          }}
        />
      }
    >
      <ol className="flex flex-col gap-2">
        {rules.items.map((r, i) => (
          <li key={r.id} className="flex items-center gap-3 rounded-lg border px-3 py-3">
            <OrderButtons
              i={i}
              n={rules.items.length}
              label={r.name}
              onMove={(d) => rules.replace(move(rules.items, i, d))}
            />
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-small text-muted-foreground tabular-nums">
              {i + 1}
            </span>
            <button
              type="button"
              onClick={() => setEditing(r.id)}
              className="flex min-w-0 flex-1 flex-col text-start outline-none focus-visible:underline"
            >
              <span
                className={
                  r.active
                    ? 'text-body-strong text-foreground'
                    : 'text-body-strong text-muted-foreground'
                }
              >
                {r.name}
              </span>
              <span className="truncate text-small text-muted-foreground">
                When{' '}
                <span className="text-foreground">
                  {r.conditions.length
                    ? r.conditions.map((c) => `${c.field} ${c.op} ${c.value}`).join(' · ')
                    : r.fallback}
                </span>
                {' › '}Assign to <span className="text-foreground">{describe(r)}</span>
              </span>
            </button>
            <Switch
              checked={r.active}
              aria-label={`${r.name} active`}
              onCheckedChange={(active) => (
                rules.update(r.id, { active }),
                toast.success(`${r.name} ${active ? 'on' : 'off'}`)
              )}
            />
          </li>
        ))}
      </ol>
    </SettingsPage>
  )
}

function ZendeskRoute({ sidebar }: R) {
  const [doc, save] = useZendeskDoc()
  return <ZendeskPage sidebar={sidebar} value={doc} onSave={save} />
}

function RingCentralRoute({ sidebar }: R) {
  const [doc, save] = useRingCentralDoc()
  const numbers = usePhoneNumbers()
  const teams = useTeams()
  const [editing, setEditing] = useState<string | null | undefined>()
  const num = editing ? numbers.items.find((n) => n.id === editing) : undefined
  return (
    <>
      <RingCentralPage
        sidebar={sidebar}
        value={doc}
        onSave={save}
        numbers={numbers.items}
        teams={teams.items.map((t) => t.name)}
        onRouteNumber={(id, routesTo) => (
          numbers.update(id, { routesTo }),
          toast.success(`Calls now go to ${routesTo}`)
        )}
        onAddNumber={() => setEditing(null)}
        onEditNumber={(n) => setEditing(n.id)}
      />
      <RecordSheet
        key={editing ?? (editing === null ? 'new' : 'closed')}
        open={editing !== undefined}
        onOpenChange={(o) => !o && setEditing(undefined)}
        variant="dialog"
        title={num ? 'Edit number' : 'Add number'}
        initial={num ?? { routesTo: teams.items[0]?.name }}
        fields={[
          {
            name: 'number',
            label: 'Number',
            type: 'text',
            required: true,
            placeholder: '(555) 123-4567',
            validate: (v) =>
              String(v).replace(/\D/g, '').length < 9 ? 'Enter a full phone number' : undefined,
          },
          { name: 'label', label: 'Label', type: 'text', required: true },
          {
            name: 'routesTo',
            label: 'Routes to',
            type: 'select',
            options: teams.items.map((t) => t.name),
          },
        ]}
        onDelete={
          num ? () => (numbers.remove(num.id), toast.success(`Removed ${num.number}`)) : undefined
        }
        onSave={(v) => (
          numbers.upsert({
            id: num?.id ?? newId('n'),
            number: String(v.number),
            label: String(v.label),
            routesTo: String(v.routesTo),
          }),
          toast.success('Number saved')
        )}
      />
    </>
  )
}

function BackupRoute({ sidebar }: R) {
  const [doc, save] = useBackupDoc()
  const files = useBackups()
  return (
    <BackupPage
      sidebar={sidebar}
      nightly={doc.nightly}
      onNightly={(nightly) => save({ nightly })}
      files={files.items}
      onCreate={(f) => files.add({ ...f, id: newId('b') })}
    />
  )
}
