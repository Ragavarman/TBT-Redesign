import { useState, type ReactNode } from 'react'
import {
  Avatar,
  Badge,
  Button,
  Checkbox,
  Radio,
  RadioGroup,
  StatusGlyph,
  Switch,
} from '@/components/atoms'
import { Breadcrumb, EmptyState, PropertyRow, toast } from '@/components/molecules'
import { Dialog, DialogClose, KpiStrip, PageHeader } from '@/components/organisms'
import { AppShell, Panel, PanelBody, ProfileTemplate } from '@/components/templates'
import { useHotkeys } from '@/hooks/useHotkeys'
import { cn } from '@/lib/utils'
import { shortAgo, type PermissionRow, type Team, type TeamMember } from '@/mocks'
import { formatTicketId, TICKET_STATUS_LABEL, type Ticket } from '@/types'

/** Figma Interface · Team: 06b Agent details, F2 Deactivate, F4 Team details, X16 Roles & permissions. */

const pct = (n: number) => (n ? `${Math.round(n * 100)}%` : '—')

const STATUS_DOT: Record<TeamMember['status'], string> = {
  Active: 'bg-success',
  Away: 'bg-warning',
  Invited: 'bg-muted-foreground',
  Deactivated: 'bg-destructive',
}

export function MemberStatus({ status }: { status: TeamMember['status'] }) {
  return (
    <span className="flex items-center gap-1.5 text-small text-muted-foreground">
      <span aria-hidden className={cn('size-1.5 rounded-full', STATUS_DOT[status])} />
      {status}
    </span>
  )
}

function TicketTable({ tickets, onOpen }: { tickets: Ticket[]; onOpen: (id: number) => void }) {
  if (!tickets.length)
    return <EmptyState title="No open tickets" description="Assigned tickets show up here." />
  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-left text-body">
        <thead className="border-b bg-muted/40 text-small text-muted-foreground">
          <tr>
            <th className="h-9 w-24 ps-4 font-normal">ID</th>
            <th className="font-normal">Subject</th>
            <th className="w-40 font-normal">Status</th>
            <th className="w-24 pe-4 font-normal">Updated</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => (
            <tr
              key={t.id}
              tabIndex={0}
              onClick={() => onOpen(t.id)}
              onKeyDown={(e) => e.key === 'Enter' && onOpen(t.id)}
              className="cursor-pointer border-b outline-none last:border-b-0 hover:bg-accent focus-visible:bg-accent"
            >
              <td className="h-10 ps-4 tabular-nums">{formatTicketId(t.id)}</td>
              <td className="truncate">{t.subject}</td>
              <td>
                <span className="flex items-center gap-2 text-muted-foreground">
                  <StatusGlyph status={t.status} label={null} />
                  {TICKET_STATUS_LABEL[t.status]}
                </span>
              </td>
              <td className="pe-4 text-muted-foreground">{shortAgo(t.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SideCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section
      aria-label={title}
      className="flex flex-col gap-1 rounded-xl border bg-card px-4 pt-3 pb-3"
    >
      <h2 className="pb-1 text-title text-foreground">{title}</h2>
      {children}
    </section>
  )
}

/* ── 06b Agent details ─────────────────────────────────────────────────────────────── */

export function AgentDetailPage({
  sidebar,
  member,
  tickets,
  onBack,
  onEdit,
  onDeactivate,
  onReactivate,
  onOpenTicket,
  children,
}: {
  sidebar: ReactNode
  member: TeamMember
  tickets: Ticket[]
  onBack: () => void
  onEdit: () => void
  onDeactivate: () => void
  onReactivate: () => void
  onOpenTicket: (id: number) => void
  children?: ReactNode
}) {
  useHotkeys({ escape: onBack, e: onEdit })
  const inactive = member.status === 'Deactivated'
  return (
    <ProfileTemplate
      sidebar={sidebar}
      header={
        <PageHeader
          title={
            <Breadcrumb
              items={[
                { label: 'Agents', href: '#', onClick: (e) => (e.preventDefault(), onBack()) },
                { label: member.name },
              ]}
            />
          }
          actions={
            <>
              {inactive ? (
                <Button variant="secondary" onClick={onReactivate}>
                  Reactivate
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  className="text-destructive"
                  onClick={onDeactivate}
                  disabled={member.role === 'Admin'}
                >
                  Deactivate
                </Button>
              )}
              <Button variant="secondary" shortcut="E" onClick={onEdit}>
                Edit
              </Button>
            </>
          }
        />
      }
      intro={
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Avatar name={member.name} size="lg" aria-hidden />
            <div className="flex flex-col">
              <h1 className="text-heading-1 text-foreground">{member.name}</h1>
              <p className="flex items-center gap-2 text-small text-muted-foreground">
                {member.email}
                {member.ext && ` · ext. ${member.ext}`} · <MemberStatus status={member.status} />
              </p>
            </div>
          </div>
          <KpiStrip
            items={[
              {
                id: 'role',
                label: 'Role',
                value: <span className="text-title">{member.role}</span>,
              },
              { id: 'open', label: 'Open tickets', value: tickets.length },
              { id: 'res', label: 'Resolved', value: member.resolved30 },
              {
                id: 'med',
                label: 'Median time',
                value: <span className="text-title">{member.medianResolution}</span>,
              },
              { id: 'csat', label: 'CSAT', value: pct(member.csat) },
            ]}
          />
        </div>
      }
      aside={
        <>
          <SideCard title="Teams & access">
            <PropertyRow label="Teams">
              {member.teams.length
                ? member.teams.map((t) => (
                    <Badge key={t} variant="outline">
                      {t.replace(/^(Support|Technical|Sales) Team /, '$1 ')}
                    </Badge>
                  ))
                : undefined}
            </PropertyRow>
            <PropertyRow label="Role">{member.role}</PropertyRow>
            <PropertyRow label="Joined">{member.joined}</PropertyRow>
          </SideCard>
          <SideCard title="Working hours">
            <PropertyRow label="Mon – Fri">{member.weekdays}</PropertyRow>
            <PropertyRow label="Saturday">{member.saturday}</PropertyRow>
            <PropertyRow label="Time zone">Asia/Colombo</PropertyRow>
            <PropertyRow label="Auto-assign">
              {member.autoAssign ? `On · max ${member.maxOpen} open` : 'Off'}
            </PropertyRow>
          </SideCard>
        </>
      }
    >
      <section aria-label="Assigned tickets" className="flex flex-col gap-2 p-5">
        <h2 className="text-title text-foreground">Assigned tickets</h2>
        <TicketTable tickets={tickets} onOpen={onOpenTicket} />
      </section>
      {children}
    </ProfileTemplate>
  )
}

/* ── F2 Deactivate ─────────────────────────────────────────────────────────────────── */

export type ReassignTo = 'queue' | 'agent' | 'keep'

export function DeactivateDialog({
  open,
  onOpenChange,
  member,
  openTickets,
  otherAgents,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  member: TeamMember
  openTickets: number
  otherAgents: string[]
  onConfirm: (r: { to: ReassignTo; agent?: string; removeFromTeams: boolean }) => void
}) {
  const [to, setTo] = useState<ReassignTo>('queue')
  const [agent, setAgent] = useState(otherAgents[0] ?? '')
  const [remove, setRemove] = useState(true)
  const first = member.name.split(' ')[0]
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Deactivate ${member.name}?`}
      description={`${first} can no longer sign in. Their history stays on every ticket.`}
      footer={
        <>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm({ to, agent: to === 'agent' ? agent : undefined, removeFromTeams: remove })
              onOpenChange(false)
            }}
          >
            Deactivate
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {openTickets > 0 ? (
          <fieldset className="flex flex-col gap-2">
            <legend className="pb-2 text-label text-foreground">
              {first} has {openTickets} open {openTickets === 1 ? 'ticket' : 'tickets'}. Where
              should they go?
            </legend>
            <RadioGroup value={to} onValueChange={(v) => setTo(v as ReassignTo)} className="gap-2">
              <Radio
                value="queue"
                label="Back to the team queue"
                description={`${member.teams[0] ?? 'Team'} · unassigned`}
              />
              <Radio value="agent" label="Another agent" description="Pick who takes them over" />
              {to === 'agent' && (
                <select
                  aria-label="Agent"
                  value={agent}
                  onChange={(e) => setAgent(e.target.value)}
                  className="ms-6 h-9 rounded-md border bg-card px-2 text-body text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {otherAgents.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              )}
              <Radio
                value="keep"
                label="Leave them assigned"
                description="Not recommended — nobody will see replies"
              />
            </RadioGroup>
          </fieldset>
        ) : (
          <p className="text-body text-muted-foreground">{first} has no open tickets.</p>
        )}
        <Switch checked={remove} onCheckedChange={setRemove} label="Remove from teams and views" />
      </div>
    </Dialog>
  )
}

/* ── F4 Team details ───────────────────────────────────────────────────────────────── */

export function TeamDetailPage({
  sidebar,
  team,
  members,
  openByMember,
  openTotal,
  onBack,
  onEdit,
  onAddMember,
  onOpenMember,
  children,
}: {
  sidebar: ReactNode
  team: Team
  members: TeamMember[]
  openByMember: (name: string) => number
  openTotal: number
  onBack: () => void
  onEdit: () => void
  onAddMember: () => void
  onOpenMember: (id: string) => void
  children?: ReactNode
}) {
  useHotkeys({ escape: onBack, e: onEdit })
  return (
    <ProfileTemplate
      sidebar={sidebar}
      header={
        <PageHeader
          title={
            <Breadcrumb
              items={[
                { label: 'Teams', href: '#', onClick: (e) => (e.preventDefault(), onBack()) },
                { label: team.name },
              ]}
            />
          }
          actions={
            <>
              <Button variant="secondary" shortcut="E" onClick={onEdit}>
                Edit team
              </Button>
              <Button leadingIcon="plus" onClick={onAddMember}>
                Add member
              </Button>
            </>
          }
        />
      }
      intro={
        <KpiStrip
          items={[
            { id: 'm', label: 'Members', value: members.length },
            { id: 'o', label: 'Open tickets', value: openTotal },
            { id: 's', label: 'SLA met', value: pct(team.slaMet) },
            {
              id: 'f',
              label: '1st reply',
              value: <span className="text-title">{team.firstResponse}</span>,
            },
            { id: 'c', label: 'CSAT', value: pct(team.csat) },
          ]}
        />
      }
      aside={
        <>
          <SideCard title="Routing">
            <PropertyRow label="Applications">
              {team.applications.map((a) => (
                <Badge key={a} variant="outline">
                  {a}
                </Badge>
              ))}
            </PropertyRow>
            <PropertyRow label="Assign by">{team.assignBy}</PropertyRow>
            <PropertyRow label="Max open">{team.maxOpen} per agent</PropertyRow>
            <PropertyRow label="SLA policy">{team.slaPolicy}</PropertyRow>
          </SideCard>
          <SideCard title="Hours">
            <PropertyRow label="Hours">{team.hours}</PropertyRow>
            <PropertyRow label="Outside hours">{team.outsideHours}</PropertyRow>
          </SideCard>
        </>
      }
    >
      <section aria-label="Members" className="flex flex-col gap-2 p-5">
        <h2 className="text-title text-foreground">Members</h2>
        {members.length ? (
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-left text-body">
              <thead className="border-b bg-muted/40 text-small text-muted-foreground">
                <tr>
                  <th className="h-9 ps-4 font-normal">Agent</th>
                  <th className="w-32 font-normal">Role</th>
                  <th className="w-20 font-normal">Open</th>
                  <th className="w-32 pe-4 font-normal">Status</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr
                    key={m.id}
                    tabIndex={0}
                    onClick={() => onOpenMember(m.id)}
                    onKeyDown={(e) => e.key === 'Enter' && onOpenMember(m.id)}
                    className="cursor-pointer border-b outline-none last:border-b-0 hover:bg-accent focus-visible:bg-accent"
                  >
                    <td className="h-12 ps-4">
                      <span className="flex items-center gap-2">
                        <Avatar name={m.name} size="xs" aria-hidden />
                        <span className="flex flex-col">
                          <span>{m.name}</span>
                          <span className="text-small text-muted-foreground">{m.email}</span>
                        </span>
                      </span>
                    </td>
                    <td className="text-muted-foreground">{m.role}</td>
                    <td className="tabular-nums">{openByMember(m.name)}</td>
                    <td className="pe-4">
                      <MemberStatus status={m.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No members yet"
            description="Add agents to route this team’s tickets to them."
          />
        )}
      </section>
      {children}
    </ProfileTemplate>
  )
}

/* ── X16 Roles & permissions ───────────────────────────────────────────────────────── */

export function RolesPage({
  sidebar,
  roles,
  peopleIn,
  rows,
  onToggle,
  onAddRole,
}: {
  sidebar: ReactNode
  roles: string[]
  peopleIn: (role: string) => number
  rows: PermissionRow[]
  onToggle: (rowId: string, role: string, on: boolean) => void
  onAddRole: (name: string, copyFrom: string) => void
}) {
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [copy, setCopy] = useState('Agent')
  const groups = [...new Set(rows.map((r) => r.group))]
  return (
    <AppShell sidebar={sidebar}>
      <Panel>
        <PageHeader
          icon="lock"
          title="Roles & permissions"
          actions={
            <Button leadingIcon="plus" onClick={() => setAdding(true)}>
              Add role
            </Button>
          }
        />
        <PanelBody className="flex flex-col gap-3 p-5">
          <p className="text-body text-muted-foreground">
            What each role can do. Admin always has every permission. Changes apply to everyone with
            the role straight away.
          </p>
          <div className="overflow-hidden rounded-xl border">
            <table className="w-full text-left text-body">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="h-12 ps-4 font-normal text-muted-foreground">Permission</th>
                  {roles.map((r) => (
                    <th key={r} className="w-32 text-center font-normal">
                      <span className="flex flex-col">
                        <span className="text-label text-foreground">{r}</span>
                        <span className="text-caption text-muted-foreground">
                          {peopleIn(r)} {peopleIn(r) === 1 ? 'person' : 'people'}
                        </span>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              {groups.map((g) => (
                <tbody key={g}>
                  <tr className="border-b bg-muted/20">
                    <th
                      colSpan={roles.length + 1}
                      className="h-8 ps-4 text-start text-caption font-normal text-muted-foreground"
                    >
                      {g}
                    </th>
                  </tr>
                  {rows
                    .filter((r) => r.group === g)
                    .map((r) => (
                      <tr key={r.id} className="border-b last:border-b-0">
                        <td className="h-10 ps-4">{r.label}</td>
                        {roles.map((role) => (
                          <td key={role} className="text-center">
                            <span className="inline-flex">
                              <Checkbox
                                aria-label={`${role}: ${r.label}`}
                                checked={role === 'Admin' || !!r.allowed[role]}
                                disabled={role === 'Admin'}
                                onCheckedChange={(on) => {
                                  onToggle(r.id, role, on === true)
                                  toast.success(
                                    `${role} ${on ? 'can now' : 'can no longer'} ${r.label.toLowerCase()}`,
                                  )
                                }}
                              />
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              ))}
            </table>
          </div>
        </PanelBody>
      </Panel>
      <Dialog
        open={adding}
        onOpenChange={setAdding}
        title="Add role"
        size="sm"
        footer={
          <>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button
              disabled={!name.trim() || roles.includes(name.trim())}
              onClick={() => {
                onAddRole(name.trim(), copy)
                setAdding(false)
                setName('')
              }}
            >
              Add role
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-label">
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="h-9 rounded-md border bg-card px-3 text-body outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-label">
            Start from
            <select
              value={copy}
              onChange={(e) => setCopy(e.target.value)}
              className="h-9 rounded-md border bg-card px-2 text-body outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {roles.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
        </div>
      </Dialog>
    </AppShell>
  )
}
