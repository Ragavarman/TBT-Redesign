import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { Avatar, Badge, Button } from '@/components/atoms'
import { toast } from '@/components/molecules'
import { RecordSheet, type RecordField, type RecordValues } from '@/components/organisms'
import {
  ROLES,
  TEAM_NAMES,
  TEAM_VIEW,
  wsAgents,
  type Role,
  type Team,
  type TeamMember,
} from '@/mocks'
import { PersonCell, ResourceListPage } from '@/pages/kit/ResourceListPage'
import {
  AgentDetailPage,
  DeactivateDialog,
  MemberStatus,
  RolesPage,
  TeamDetailPage,
} from '@/pages/team/TeamPages'
import type { Ticket } from '@/types'
import { AppSidebar } from './AppSidebar'
import { newId } from './collections-context'
import { ticketPath } from './nav'
import { useInvites, usePermissions, useTeamMembers, useTeams } from './stores'
import { useWorkspace } from './workspace-context'

const isOpen = (t: Ticket) => t.status !== 'resolved' && t.status !== 'closed'
const APPS = ['Customer Portal', 'POS', 'Inventory', 'Payments']
const short = (t: string) => t.replace(/^(Support|Technical|Sales) Team /, '$1 ')

/** Invite / edit agent form (Figma F1). */
function agentFields(members: TeamMember[], editingId?: string): RecordField[] {
  return [
    { name: 'firstName', label: 'First name', type: 'text', half: true, required: true },
    { name: 'lastName', label: 'Last name', type: 'text', half: true },
    {
      name: 'email',
      label: 'Work email',
      type: 'email',
      required: true,
      validate: (v) =>
        members.some((m) => m.email === String(v).trim() && m.id !== editingId)
          ? 'Someone already uses this email'
          : undefined,
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      options: [...ROLES],
      helper: 'Agents work tickets. Team leads can also edit teams and views.',
    },
    { name: 'teams', label: 'Teams', type: 'tags', options: TEAM_NAMES },
    {
      name: 'ext',
      label: 'RingCentral extension',
      type: 'text',
      placeholder: 'Optional',
      helper: 'Routes calls for this agent to their tickets',
    },
    {
      name: 'autoAssign',
      label: 'Auto-assign tickets',
      type: 'switch',
      helper: 'Up to the max open tickets at a time',
    },
    {
      name: 'maxOpen',
      label: 'Max open tickets',
      type: 'select',
      half: true,
      options: ['6', '8', '10', '12', '15'],
    },
  ]
}
const splitName = (n: string) => {
  const [first = '', ...rest] = n.split(' ')
  return { firstName: first, lastName: rest.join(' ') }
}

function useTeamData() {
  const members = useTeamMembers()
  const teams = useTeams()
  const { tickets, updateTickets } = useWorkspace()
  const openOf = (name: string) => tickets.filter((t) => isOpen(t) && t.assignee?.name === name)
  return { members, teams, tickets, updateTickets, openOf }
}

/** /team/:view — Agents, Teams (+ team shortcuts), Roles & permissions, Invites. */
export function TeamViewRoute({ view }: { view: string }) {
  const navigate = useNavigate()
  const { members, teams, openOf, tickets } = useTeamData()
  const perms = usePermissions()
  const invites = useInvites()
  const [editing, setEditing] = useState<string | null | undefined>(undefined)
  const sidebar = <AppSidebar />

  if (TEAM_VIEW[view]) return <Navigate to={`/team/teams/${TEAM_VIEW[view]}`} replace />

  // Invite agent (F1) — from Agents and Invites
  const inviteSheet = (
    <RecordSheet
      key={editing === null ? 'invite' : 'closed'}
      open={editing === null}
      onOpenChange={(o) => !o && setEditing(undefined)}
      title="Invite agent"
      description="They get an email to set a password"
      saveLabel="Send invite"
      fields={agentFields(members.items)}
      initial={{ role: 'Agent', teams: ['Support Team Alpha'], autoAssign: true, maxOpen: '12' }}
      onSave={(v) => {
        const name = [v.firstName, v.lastName].filter(Boolean).join(' ')
        members.add({
          id: newId('ag'),
          name,
          email: String(v.email),
          role: v.role as Role,
          teams: v.teams as string[],
          ext: String(v.ext) || undefined,
          status: 'Invited',
          joined: '—',
          autoAssign: !!v.autoAssign,
          maxOpen: Number(v.maxOpen),
          weekdays: '8:30 AM – 5:30 PM',
          resolved30: 0,
          medianResolution: '—',
          csat: 0,
        })
        invites.add({
          id: newId('inv'),
          email: String(v.email),
          role: v.role as Role,
          teams: v.teams as string[],
          invitedBy: 'Team Lead',
          sent: 'Just now',
          expiresIn: 7,
        })
        toast.success(`Invite sent to ${String(v.email)}`)
      }}
    />
  )

  if (view === 'agents') {
    return (
      <ResourceListPage
        sidebar={sidebar}
        icon="team"
        title="Agents"
        rows={members.items}
        getId={(m) => m.id}
        searchText={(m) => `${m.name} ${m.email} ${m.role} ${m.teams.join(' ')}`}
        onRowClick={(m) => navigate(`/team/agents/${m.id}`)}
        actions={
          <Button leadingIcon="plus" onClick={() => setEditing(null)}>
            Invite agent
          </Button>
        }
        columns={[
          {
            key: 'name',
            label: 'Agent',
            sort: (m) => m.name,
            render: (m) => (
              <span className="flex items-center gap-2">
                <Avatar name={m.name} size="xs" aria-hidden />
                <span className="flex flex-col">
                  <span>{m.name}</span>
                  <span className="text-small text-muted-foreground">{m.email}</span>
                </span>
              </span>
            ),
          },
          {
            key: 'role',
            label: 'Role',
            className: 'w-28',
            sort: (m) => m.role,
            render: (m) => <span className="text-muted-foreground">{m.role}</span>,
          },
          {
            key: 'teams',
            label: 'Teams',
            className: 'w-56',
            render: (m) =>
              m.teams.length ? (
                <span className="flex items-center gap-1">
                  <Badge variant="outline">{short(m.teams[0]!)}</Badge>
                  {m.teams.length > 1 && (
                    <span className="text-small text-muted-foreground">+{m.teams.length - 1}</span>
                  )}
                </span>
              ) : (
                <span className="text-muted-foreground">—</span>
              ),
          },
          {
            key: 'open',
            label: 'Open',
            className: 'w-20',
            sort: (m) => openOf(m.name).length,
            render: (m) => <span className="tabular-nums">{openOf(m.name).length}</span>,
          },
          {
            key: 'status',
            label: 'Status',
            className: 'w-32',
            sort: (m) => m.status,
            render: (m) => <MemberStatus status={m.status} />,
          },
        ]}
      >
        {inviteSheet}
      </ResourceListPage>
    )
  }

  if (view === 'teams') {
    const team = editing ? teams.items.find((t) => t.id === editing) : undefined
    return (
      <ResourceListPage
        sidebar={sidebar}
        icon="customers"
        title="Teams"
        rows={teams.items}
        getId={(t) => t.id}
        searchText={(t) => `${t.name} ${t.description}`}
        onRowClick={(t) => navigate(`/team/teams/${t.id}`)}
        actions={
          <Button leadingIcon="plus" onClick={() => setEditing(null)}>
            New team
          </Button>
        }
        columns={[
          {
            key: 'name',
            label: 'Team',
            sort: (t) => t.name,
            render: (t) => (
              <span className="flex flex-col">
                <span>{t.name}</span>
                <span className="text-small text-muted-foreground">{t.description}</span>
              </span>
            ),
          },
          {
            key: 'members',
            label: 'Members',
            className: 'w-40',
            render: (t) => {
              const ms = members.items.filter((m) => m.teams.includes(t.name))
              return (
                <span className="flex items-center -space-x-1.5">
                  {ms.slice(0, 4).map((m) => (
                    <Avatar key={m.id} name={m.name} size="xs" className="ring-2 ring-card" />
                  ))}
                  <span className="ps-3 text-small text-muted-foreground">{ms.length}</span>
                </span>
              )
            },
          },
          {
            key: 'open',
            label: 'Open',
            className: 'w-20',
            render: (t) => (
              <span className="tabular-nums">
                {tickets.filter((x) => isOpen(x) && x.team === t.name).length}
              </span>
            ),
          },
          {
            key: 'sla',
            label: 'SLA policy',
            className: 'w-32',
            render: (t) => <span className="text-muted-foreground">{t.slaPolicy}</span>,
          },
          {
            key: 'assign',
            label: 'Assign by',
            className: 'w-36',
            render: (t) => <span className="text-muted-foreground">{t.assignBy}</span>,
          },
        ]}
      >
        <TeamSheet open={editing !== undefined} team={team} onClose={() => setEditing(undefined)} />
      </ResourceListPage>
    )
  }

  if (view === 'roles') {
    const roles = Object.keys(perms.items[0]?.allowed ?? {})
    return (
      <RolesPage
        sidebar={sidebar}
        roles={roles}
        peopleIn={(r) => members.items.filter((m) => m.role === r).length}
        rows={perms.items}
        onToggle={(id, role, on) =>
          perms.update(id, {
            allowed: { ...perms.items.find((p) => p.id === id)!.allowed, [role]: on },
          })
        }
        onAddRole={(name, copy) => {
          perms.replace(
            perms.items.map((p) => ({
              ...p,
              allowed: { ...p.allowed, [name]: !!p.allowed[copy] },
            })),
          )
          toast.success(`Added ${name}, starting from ${copy}`)
        }}
      />
    )
  }

  if (view === 'invites') {
    return (
      <ResourceListPage
        sidebar={sidebar}
        icon="mail"
        title="Invites"
        count={`${invites.items.length} pending`}
        rows={invites.items}
        getId={(i) => i.id}
        actions={
          <Button leadingIcon="plus" onClick={() => setEditing(null)}>
            Invite agent
          </Button>
        }
        toolbar={
          <p className="border-b px-4 py-2 text-small text-muted-foreground">
            Invites expire after 7 days. Resending sends a new link and resets the timer.
          </p>
        }
        empty={{
          icon: 'mail',
          title: 'No pending invites',
          description: 'People you invite show up here until they sign in.',
        }}
        columns={[
          { key: 'email', label: 'Email', sort: (i) => i.email, render: (i) => i.email },
          {
            key: 'role',
            label: 'Role',
            className: 'w-28',
            render: (i) => <span className="text-muted-foreground">{i.role}</span>,
          },
          {
            key: 'teams',
            label: 'Teams',
            className: 'w-44',
            render: (i) => (
              <span className="text-muted-foreground">{i.teams.map(short).join(', ') || '—'}</span>
            ),
          },
          {
            key: 'by',
            label: 'Invited by',
            className: 'w-36',
            render: (i) => <PersonCell name={i.invitedBy} />,
          },
          {
            key: 'sent',
            label: 'Sent',
            className: 'w-28',
            render: (i) => <span className="text-muted-foreground">{i.sent}</span>,
          },
          {
            key: 'actions',
            label: '',
            className: 'w-64',
            render: (i) => (
              <span className="flex items-center justify-end gap-1">
                <Badge variant={i.expiresIn < 0 ? 'neutral' : 'outline'}>
                  {i.expiresIn < 0 ? 'Expired' : `in ${i.expiresIn} days`}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => (
                    invites.update(i.id, { sent: 'Just now', expiresIn: 7 }),
                    toast.success(`New invite sent to ${i.email}`)
                  )}
                >
                  Resend
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => {
                    invites.remove(i.id)
                    members.replace(
                      members.items.filter((m) => !(m.email === i.email && m.status === 'Invited')),
                    )
                    toast.success(`Invite to ${i.email} revoked`)
                  }}
                >
                  Revoke
                </Button>
              </span>
            ),
          },
        ]}
      >
        {inviteSheet}
      </ResourceListPage>
    )
  }
  return null
}

/** Create / edit team (Figma F5). */
function TeamSheet({ open, team, onClose }: { open: boolean; team?: Team; onClose: () => void }) {
  const teams = useTeams()
  const members = useTeamMembers()
  return (
    <RecordSheet
      key={open ? (team?.id ?? 'new') : 'closed'}
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title={team ? 'Edit team' : 'New team'}
      saveLabel={team ? 'Save team' : 'Create team'}
      initial={
        team
          ? { ...team, maxOpen: String(team.maxOpen) }
          : {
              assignBy: 'Round robin',
              maxOpen: '12',
              slaPolicy: 'Standard',
              outsideHours: 'Support Team Alpha',
              hours: 'Mon – Fri · 8:30 AM – 5:30 PM',
            }
      }
      fields={[
        {
          name: 'name',
          label: 'Name',
          type: 'text',
          required: true,
          validate: (v) =>
            teams.items.some(
              (t) => t.name.toLowerCase() === String(v).trim().toLowerCase() && t.id !== team?.id,
            )
              ? 'That team already exists'
              : undefined,
        },
        { name: 'description', label: 'Description', type: 'textarea', rows: 2 },
        { name: 'applications', label: 'Applications', type: 'tags', options: APPS },
        {
          name: 'assignBy',
          label: 'Assign by',
          type: 'select',
          half: true,
          options: ['Round robin', 'Least busy', 'Manual'],
        },
        {
          name: 'maxOpen',
          label: 'Max open per agent',
          type: 'select',
          half: true,
          options: ['6', '8', '10', '12', '15'],
        },
        {
          name: 'slaPolicy',
          label: 'SLA policy',
          type: 'select',
          half: true,
          options: ['Urgent', 'High', 'Standard', 'VIP customers'],
        },
        {
          name: 'outsideHours',
          label: 'Outside hours',
          type: 'select',
          half: true,
          options: teams.items.map((t) => t.name).filter((n) => n !== team?.name),
        },
        { name: 'hours', label: 'Hours', type: 'text' },
      ]}
      onDelete={
        team
          ? () => {
              teams.remove(team.id)
              members.replace(
                members.items.map((m) => ({ ...m, teams: m.teams.filter((t) => t !== team.name) })),
              )
              toast.success(`Deleted ${team.name}`)
            }
          : undefined
      }
      onSave={(v: RecordValues) => {
        const next: Team = {
          ...(team ?? { slaMet: 0, firstResponse: '—', csat: 0 }),
          id: team?.id ?? newId('team'),
          name: String(v.name),
          description: String(v.description),
          applications: v.applications as string[],
          assignBy: v.assignBy as Team['assignBy'],
          maxOpen: Number(v.maxOpen),
          slaPolicy: String(v.slaPolicy),
          outsideHours: String(v.outsideHours),
          hours: String(v.hours),
        }
        if (team && team.name !== next.name)
          members.replace(
            members.items.map((m) => ({
              ...m,
              teams: m.teams.map((t) => (t === team.name ? next.name : t)),
            })),
          )
        teams.upsert(next)
        toast.success(team ? `Saved ${next.name}` : `${next.name} created`)
      }}
    />
  )
}

/** /team/agents/:id (Figma 06b, F1 edit, F2 deactivate) and /team/teams/:id (F4, F5). */
export function TeamDetailRoute({ view, id }: { view: string; id: string }) {
  const navigate = useNavigate()
  const { members, teams, openOf, tickets, updateTickets } = useTeamData()
  const [editing, setEditing] = useState(false)
  const [deactivating, setDeactivating] = useState(false)
  const [adding, setAdding] = useState(false)
  const sidebar = <AppSidebar />

  if (view === 'agents') {
    const m = members.items.find((x) => x.id === id)
    if (!m) return <Navigate to="/team/agents" replace />
    const open = openOf(m.name)
    return (
      <AgentDetailPage
        key={m.id}
        sidebar={sidebar}
        member={m}
        tickets={open}
        onBack={() => navigate('/team/agents')}
        onEdit={() => setEditing(true)}
        onDeactivate={() => setDeactivating(true)}
        onReactivate={() => (
          members.update(m.id, { status: 'Active' }),
          toast.success(`${m.name} reactivated`)
        )}
        onOpenTicket={(tid) => navigate(ticketPath('all', tid))}
      >
        <RecordSheet
          key={editing ? 'edit' : 'closed'}
          open={editing}
          onOpenChange={setEditing}
          title="Edit agent"
          saveLabel="Save changes"
          fields={agentFields(members.items, m.id)}
          initial={{ ...m, ...splitName(m.name), maxOpen: String(m.maxOpen), ext: m.ext ?? '' }}
          onSave={(v) => {
            members.update(m.id, {
              name: [v.firstName, v.lastName].filter(Boolean).join(' '),
              email: String(v.email),
              role: v.role as Role,
              teams: v.teams as string[],
              ext: String(v.ext) || undefined,
              autoAssign: !!v.autoAssign,
              maxOpen: Number(v.maxOpen),
            })
            toast.success('Agent saved')
          }}
        />
        <DeactivateDialog
          key={deactivating ? 'open' : 'closed'}
          open={deactivating}
          onOpenChange={setDeactivating}
          member={m}
          openTickets={open.length}
          otherAgents={Object.values(wsAgents)
            .map((a) => a.name)
            .filter((n) => n !== m.name)}
          onConfirm={({ to, agent, removeFromTeams }) => {
            if (to !== 'keep' && open.length) {
              const target = Object.values(wsAgents).find((a) => a.name === agent)
              updateTickets(
                open.map((t) => ({
                  id: t.id,
                  patch: { assignee: to === 'agent' ? target : undefined },
                })),
              )
            }
            members.update(m.id, {
              status: 'Deactivated',
              ...(removeFromTeams ? { teams: [] } : {}),
            })
            toast.success(
              `${m.name} deactivated${open.length && to !== 'keep' ? ` · ${open.length} tickets ${to === 'agent' ? `moved to ${agent}` : 'back in the queue'}` : ''}`,
            )
          }}
        />
      </AgentDetailPage>
    )
  }

  if (view === 'teams') {
    const team = teams.items.find((t) => t.id === id)
    if (!team) return <Navigate to="/team/teams" replace />
    const teamMembers = members.items.filter((m) => m.teams.includes(team.name))
    const outside = members.items.filter(
      (m) => !m.teams.includes(team.name) && m.status !== 'Deactivated',
    )
    return (
      <TeamDetailPage
        key={team.id}
        sidebar={sidebar}
        team={team}
        members={teamMembers}
        openByMember={(name) => openOf(name).length}
        openTotal={tickets.filter((t) => isOpen(t) && t.team === team.name).length}
        onBack={() => navigate('/team/teams')}
        onEdit={() => setEditing(true)}
        onAddMember={() => setAdding(true)}
        onOpenMember={(mid) => navigate(`/team/agents/${mid}`)}
      >
        <TeamSheet open={editing} team={team} onClose={() => setEditing(false)} />
        <RecordSheet
          key={adding ? 'add' : 'closed'}
          open={adding}
          onOpenChange={setAdding}
          variant="dialog"
          title={`Add to ${team.name}`}
          saveLabel="Add member"
          fields={[
            {
              name: 'agent',
              label: 'Agent',
              type: 'select',
              options: outside.map((m) => m.name),
              required: true,
            },
          ]}
          initial={{ agent: outside[0]?.name ?? '' }}
          onSave={(v) => {
            const m = outside.find((x) => x.name === v.agent)
            if (!m) return
            members.update(m.id, { teams: [...m.teams, team.name] })
            toast.success(`${m.name} added to ${team.name}`)
          }}
        />
      </TeamDetailPage>
    )
  }
  return null
}
