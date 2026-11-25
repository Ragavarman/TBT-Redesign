import { useRef, useState, type ReactNode } from 'react'
import {
  Avatar,
  Badge,
  Button,
  Icon,
  IconButton,
  PriorityGlyph,
  StatusGlyph,
  Textarea,
} from '@/components/atoms'
import {
  Breadcrumb,
  ConditionBadge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  EmptyState,
  PickerList,
  PropertyRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  toast,
} from '@/components/molecules'
import { createDataTableColumns, DataTable, PageHeader } from '@/components/organisms'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ProfileTemplate } from '@/components/templates'
import { useHotkeys } from '@/hooks/useHotkeys'
import { shortAgo, WS_NOW, wsCurrentAgent, wsInventory } from '@/mocks'
import { cn } from '@/lib/utils'
import {
  formatDuration,
  formatTicketId,
  TICKET_PRIORITIES,
  TICKET_PRIORITY_LABEL,
  TICKET_STATUS_LABEL,
  type Customer,
  type CustomerAsset,
  type CustomerCall,
  type CustomerNote,
  type CustomerProfile,
  type Ticket,
} from '@/types'

/**
 * Figma Interface · Customers: 05b Profile (Tickets), C1 Notes, C2 Assets, X14 Calls.
 * Breadcrumb header with Merge / Edit / New ticket, the customer intro, four tabs, and a
 * Details + Activity column.
 */

export type CustomerTab = 'tickets' | 'notes' | 'assets' | 'calls'

/* ── Dates (UTC, like the rest of the mock workspace) ───────────────────────────────── */

const fmt = (iso: string, o: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-US', { ...o, timeZone: 'UTC' }).format(new Date(iso))
const longDate = (d: string) =>
  fmt(`${d.slice(0, 10)}T00:00:00Z`, { month: 'short', day: 'numeric', year: 'numeric' })
const monthYear = (ym: string) => fmt(`${ym}-01T00:00:00Z`, { month: 'short', year: 'numeric' })
const time = (iso: string) => fmt(iso, { hour: 'numeric', minute: '2-digit', hour12: false })
function whenLabel(iso: string) {
  const day = iso.slice(0, 10)
  const today = WS_NOW.slice(0, 10)
  const yesterday = new Date(Date.parse(WS_NOW) - 86_400_000).toISOString().slice(0, 10)
  if (day === today) return `Today ${time(iso)}`
  if (day === yesterday) return `Yesterday ${time(iso)}`
  return `${fmt(iso, { month: 'short', day: 'numeric' })} ${time(iso)}`
}
function noteWhen(iso: string) {
  const day = iso.slice(0, 10)
  const yesterday = new Date(Date.parse(WS_NOW) - 86_400_000).toISOString().slice(0, 10)
  if (day === WS_NOW.slice(0, 10)) return 'Today'
  if (day === yesterday) return 'Yesterday'
  return fmt(iso, { month: 'short', day: 'numeric' })
}

/* ── Tickets tab ───────────────────────────────────────────────────────────────────── */

const tcol = createDataTableColumns<Ticket>()
const ticketColumns = tcol.columns([
  tcol.accessor('id', {
    header: 'ID',
    meta: { width: 88 },
    cell: ({ getValue }) => <span className="tabular-nums">{formatTicketId(getValue())}</span>,
  }),
  tcol.accessor('subject', { header: 'Subject', cell: ({ getValue }) => getValue() }),
  tcol.accessor('status', {
    header: 'Status',
    meta: { width: 150 },
    cell: ({ getValue }) => (
      <span className="flex items-center gap-2 text-muted-foreground">
        <StatusGlyph status={getValue()} label={null} />
        {TICKET_STATUS_LABEL[getValue()]}
      </span>
    ),
  }),
  tcol.accessor('priority', {
    header: 'Priority',
    meta: { width: 110 },
    sortFn: (a, b) =>
      TICKET_PRIORITIES.indexOf(a.original.priority) -
      TICKET_PRIORITIES.indexOf(b.original.priority),
    cell: ({ getValue }) => (
      <span className="flex items-center gap-2 text-muted-foreground">
        <PriorityGlyph priority={getValue()} label={null} />
        {TICKET_PRIORITY_LABEL[getValue()]}
      </span>
    ),
  }),
  tcol.accessor('updatedAt', {
    header: 'Updated',
    meta: { width: 90 },
    cell: ({ getValue }) => <span className="tabular-nums">{shortAgo(getValue())}</span>,
  }),
])

/* ── Assets tab ────────────────────────────────────────────────────────────────────── */

const acol = createDataTableColumns<CustomerAsset>()
const assetColumns = acol.columns([
  acol.accessor('name', {
    header: 'Asset',
    // long device names wrap rather than truncate in this narrower column
    cell: ({ getValue }) => <span className="whitespace-normal">{getValue()}</span>,
  }),
  acol.accessor('serial', {
    header: 'Serial',
    meta: { width: 120 },
    cell: ({ getValue }) => (
      <span className="text-small text-muted-foreground tabular-nums">{getValue()}</span>
    ),
  }),
  acol.accessor('location', {
    header: 'Location',
    meta: { width: 120 },
    cell: ({ getValue }) => getValue(),
  }),
  acol.accessor('condition', {
    header: 'Condition',
    meta: { width: 124 },
    cell: ({ getValue }) => <ConditionBadge condition={getValue()} />,
  }),
  acol.accessor('warrantyUntil', {
    header: 'Warranty',
    meta: { width: 100 },
    cell: ({ getValue }) => <span className="whitespace-nowrap">{monthYear(getValue())}</span>,
  }),
])

/* ── Calls tab ─────────────────────────────────────────────────────────────────────── */

const CALL_TYPE: Record<CustomerCall['type'], string> = {
  voicemail: 'Voicemail',
  missed: 'Missed call',
  answered: 'Answered',
}

function PlayButton({ seconds }: { seconds: number }) {
  // A pretend player: counts through the recording while "playing".
  const [pos, setPos] = useState<number | null>(null)
  const timer = useRef<ReturnType<typeof setInterval>>(undefined)
  const toggle = () => {
    if (pos !== null) {
      clearInterval(timer.current)
      setPos(null)
      return
    }
    setPos(0)
    timer.current = setInterval(
      () =>
        setPos((p) => {
          if (p === null || p + 1 >= seconds) {
            clearInterval(timer.current)
            return null
          }
          return p + 1
        }),
      1000,
    )
  }
  const playing = pos !== null
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? 'Stop recording' : 'Play recording'}
      className="inline-flex cursor-pointer items-center gap-2 rounded-full pe-2 text-small text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Icon name={playing ? 'x' : 'arrow-right'} size={12} />
      </span>
      {playing ? `${formatDuration(pos)} / ${formatDuration(seconds)}` : 'Play'}
    </button>
  )
}

/* ── Details column ────────────────────────────────────────────────────────────────── */

function SideCard({
  title,
  action,
  children,
}: {
  title: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section
      aria-label={title}
      className="flex flex-col gap-1 rounded-xl border bg-card px-4 pt-3 pb-3 text-card-foreground"
    >
      <div className="flex min-h-8 items-center gap-2 pb-1">
        <h2 className="flex-1 text-title text-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

/* ── Page ──────────────────────────────────────────────────────────────────────────── */

export interface CustomerProfilePageProps {
  sidebar: ReactNode
  customer: Customer
  profile: CustomerProfile
  /** This customer's tickets (from the workspace). */
  tickets: Ticket[]
  initialTab?: CustomerTab
  onBack: () => void
  onOpenTicket: (id: number) => void
  /** New ticket with this customer picked. */
  onNewTicket: () => void
  /** Header actions (Figma C3 / C4, wired in their own step). */
  onEdit?: () => void
  onMerge?: () => void
}

export function CustomerProfilePage({
  sidebar,
  customer,
  profile,
  tickets,
  initialTab = 'tickets',
  onBack,
  onOpenTicket,
  onNewTicket,
  onEdit,
  onMerge,
}: CustomerProfilePageProps) {
  const me = wsCurrentAgent
  const firstName = customer.name.split(' ')[0] ?? customer.name
  const [tab, setTab] = useState<CustomerTab>(initialTab)
  const [notes, setNotes] = useState<CustomerNote[]>(profile.notes)
  const [draft, setDraft] = useState('')
  const [assets, setAssets] = useState<CustomerAsset[]>(profile.assets)
  const [linking, setLinking] = useState(false)
  const noteBox = useRef<HTMLTextAreaElement>(null)
  const open = tickets.filter((t) => t.status !== 'resolved' && t.status !== 'closed')
  const known = new Set(tickets.map((t) => t.id))

  const sortedNotes = [...notes].sort(
    (a, b) => Number(!!b.pinned) - Number(!!a.pinned) || b.at.localeCompare(a.at),
  )
  const addNote = () => {
    const body = draft.trim()
    if (!body) return
    setNotes((n) => [{ id: `local-${n.length}`, author: me, body, at: WS_NOW }, ...n])
    setDraft('')
    toast.success('Note added')
  }
  const togglePin = (id: string) =>
    setNotes((n) => n.map((x) => (x.id === id ? { ...x, pinned: !x.pinned } : x)))
  const deleteNote = (id: string) => {
    const gone = notes.find((n) => n.id === id)
    setNotes((n) => n.filter((x) => x.id !== id))
    toast.success('Note deleted', {
      action: gone ? { label: 'Undo', onClick: () => setNotes((n) => [...n, gone]) } : undefined,
    })
  }
  const linkAsset = (id: string) => {
    const a = wsInventory.find((x) => x.id === id)
    if (!a) return
    setAssets((list) => [...list, a])
    setLinking(false)
    toast.success(`${a.name} linked to ${customer.name}`)
  }
  const callBack = () =>
    toast.info(`Calling ${customer.phone ?? customer.name}…`, { description: 'Via RingCentral' })

  useHotkeys({
    n: () => {
      setTab('notes')
      requestAnimationFrame(() => noteBox.current?.focus())
    },
    escape: onBack,
    '1': () => setTab('tickets'),
    '2': () => setTab('notes'),
    '3': () => setTab('assets'),
    '4': () => setTab('calls'),
  })

  const contact = [
    customer.phone && { icon: 'chat' as const, text: customer.phone },
    { icon: 'mail' as const, text: customer.email },
    profile.company && { icon: 'customers' as const, text: profile.company },
  ].filter(Boolean) as { icon: 'chat' | 'mail' | 'customers'; text: string }[]

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as CustomerTab)} className="contents">
      <ProfileTemplate
        sidebar={sidebar}
        header={
          <PageHeader
            title={
              <Breadcrumb
                items={[
                  { label: 'Customers', onClick: (e) => (e.preventDefault(), onBack()), href: '#' },
                  { label: customer.name },
                ]}
              />
            }
            actions={
              <>
                <Button variant="secondary" onClick={onMerge} disabled={!onMerge}>
                  Merge
                </Button>
                <Button variant="secondary" onClick={onEdit} disabled={!onEdit}>
                  Edit
                </Button>
                <Button leadingIcon="plus" onClick={onNewTicket}>
                  New ticket
                </Button>
              </>
            }
          />
        }
        intro={
          <div className="flex items-start gap-3">
            <Avatar name={customer.name} src={customer.avatarUrl} size="lg" aria-hidden />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <h1 className="truncate text-heading-1 text-foreground">{customer.name}</h1>
              <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-small text-muted-foreground">
                {contact.map((c) => (
                  <li key={c.text} className="flex items-center gap-1.5">
                    <Icon name={c.icon} size={14} />
                    {c.text}
                  </li>
                ))}
              </ul>
            </div>
            {profile.tags.length > 0 && (
              <ul aria-label="Tags" className="flex shrink-0 flex-wrap gap-1.5">
                {profile.tags.map((t) => (
                  <li key={t}>
                    <Badge variant="outline">{t}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        }
        tabs={
          <TabsList aria-label="Customer sections">
            <TabsTrigger value="tickets" count={tickets.length}>
              Tickets
            </TabsTrigger>
            <TabsTrigger value="notes" count={notes.length}>
              Notes
            </TabsTrigger>
            <TabsTrigger value="assets" count={assets.length}>
              Assets
            </TabsTrigger>
            <TabsTrigger value="calls" count={profile.calls.length}>
              Calls
            </TabsTrigger>
          </TabsList>
        }
        aside={
          <>
            <SideCard
              title="Details"
              action={
                <Button variant="ghost" size="sm" onClick={onEdit} disabled={!onEdit}>
                  Edit
                </Button>
              }
            >
              <PropertyRow label="Phone">{customer.phone}</PropertyRow>
              <PropertyRow label="Email">
                <span className="truncate">{customer.email}</span>
              </PropertyRow>
              <PropertyRow label="Company">{profile.company}</PropertyRow>
              <PropertyRow label="Location">{profile.location}</PropertyRow>
              <PropertyRow label="Customer since">{longDate(profile.since)}</PropertyRow>
              <PropertyRow label="Source">{profile.source}</PropertyRow>
            </SideCard>
            <SideCard title="Activity">
              <PropertyRow label="Open tickets">{open.length}</PropertyRow>
              <PropertyRow label="Last contact">{profile.stats.lastContact}</PropertyRow>
              <PropertyRow label="Avg. resolution">{profile.stats.avgResolution}</PropertyRow>
              <PropertyRow label="CSAT">
                {profile.stats.csat !== undefined ? `${profile.stats.csat} / 5` : undefined}
              </PropertyRow>
            </SideCard>
          </>
        }
      >
        <TabsContent value="tickets" className="py-1">
          {tickets.length ? (
            <DataTable
              appearance="flush"
              label={`${customer.name}’s tickets`}
              itemLabel="tickets"
              columns={ticketColumns}
              data={tickets}
              getRowId={(t) => String(t.id)}
              pageSize={false}
              onRowClick={(t) => onOpenTicket(t.id)}
            />
          ) : (
            <EmptyState
              title="No tickets yet"
              description={`Tickets from ${firstName} will show up here.`}
              action={
                <Button size="sm" onClick={onNewTicket}>
                  New ticket
                </Button>
              }
            />
          )}
        </TabsContent>

        <TabsContent value="notes" className="flex flex-col gap-3 p-5">
          <form
            className="flex flex-col gap-2 rounded-lg border bg-card p-3"
            onSubmit={(e) => {
              e.preventDefault()
              addNote()
            }}
          >
            <Textarea
              ref={noteBox}
              aria-label={`Note about ${firstName}`}
              placeholder={`Add a note about ${firstName}… only agents can see notes`}
              rows={2}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault()
                  addNote()
                }
              }}
              className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
            <div className="flex items-center gap-2">
              <Icon name="lock" size={14} className="text-muted-foreground" />
              <span className="flex-1 text-small text-muted-foreground">
                Only agents can see notes
              </span>
              <Button size="sm" type="submit" disabled={!draft.trim()}>
                Add note
              </Button>
            </div>
          </form>
          {sortedNotes.length === 0 ? (
            <EmptyState
              title="No notes yet"
              description="Notes help the next agent who picks up a call."
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {sortedNotes.map((n) => (
                <li
                  key={n.id}
                  className={cn(
                    'flex flex-col gap-1.5 rounded-lg border px-4 py-3',
                    n.pinned ? 'bg-muted/50' : 'bg-card',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Avatar name={n.author.name} size="xs" aria-hidden />
                    <span className="text-label text-foreground">{n.author.name}</span>
                    <span className="text-caption text-muted-foreground">{noteWhen(n.at)}</span>
                    <span className="flex-1" />
                    {n.pinned && <span className="text-caption text-muted-foreground">Pinned</span>}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <IconButton icon="dots" label="Note actions" size="sm" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem icon="star" onSelect={() => togglePin(n.id)}>
                          {n.pinned ? 'Unpin' : 'Pin to top'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          icon="trash"
                          destructive
                          onSelect={() => deleteNote(n.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-body whitespace-pre-line text-foreground">{n.body}</p>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="assets" className="flex flex-col gap-2 py-4">
          <div className="flex items-center gap-2 px-5">
            <p className="flex-1 text-body text-muted-foreground">
              Devices this customer owns or uses
            </p>
            <Popover open={linking} onOpenChange={setLinking}>
              <PopoverTrigger asChild>
                <Button variant="secondary" size="sm" leadingIcon="link">
                  Link asset
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80">
                <PickerList
                  label="Inventory"
                  placeholder="Search inventory…"
                  options={wsInventory
                    .filter((a) => !assets.some((x) => x.id === a.id))
                    .map((a) => ({
                      value: a.id,
                      label: a.name,
                      meta: a.serial,
                      keywords: `${a.serial} ${a.location}`,
                      icon: <Icon name="inventory" size={14} />,
                    }))}
                  emptyText="Everything in stock is linked"
                  onSelect={linkAsset}
                />
              </PopoverContent>
            </Popover>
          </div>
          {assets.length ? (
            <DataTable
              appearance="flush"
              label={`${customer.name}’s assets`}
              itemLabel="assets"
              columns={assetColumns}
              data={assets}
              getRowId={(a) => a.id}
              pageSize={false}
            />
          ) : (
            <EmptyState
              icon="inventory"
              title="No assets linked"
              description="Link the devices this customer uses."
            />
          )}
        </TabsContent>

        <TabsContent value="calls" className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-2">
            <p className="flex-1 text-body text-muted-foreground">
              Calls and voicemails from RingCentral
            </p>
            <Button size="sm" leadingIcon="phone" onClick={callBack} disabled={!customer.phone}>
              Call back
            </Button>
          </div>
          {profile.calls.length ? (
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-left text-body">
                <thead className="border-b bg-muted/40 text-small text-muted-foreground">
                  <tr>
                    <th className="h-10 px-4 font-normal">When</th>
                    <th className="px-3 font-normal">Type</th>
                    <th className="px-3 font-normal">Duration</th>
                    <th className="px-3 font-normal">Recording</th>
                    <th className="px-4 font-normal">Ticket</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.calls.map((c) => (
                    <tr key={c.id} className="border-b last:border-b-0">
                      <td className="h-11 px-4 tabular-nums">{whenLabel(c.at)}</td>
                      <td className="px-3">
                        {CALL_TYPE[c.type]}
                        {c.agent && <span className="text-muted-foreground"> · {c.agent}</span>}
                      </td>
                      <td className="px-3 text-muted-foreground tabular-nums">
                        {c.duration !== undefined ? formatDuration(c.duration) : '—'}
                      </td>
                      <td className="px-3">
                        {c.recording && c.duration ? (
                          <PlayButton seconds={c.duration} />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 tabular-nums">
                        {c.ticketId === undefined ? (
                          '—'
                        ) : known.has(c.ticketId) ? (
                          <button
                            type="button"
                            onClick={() => onOpenTicket(c.ticketId!)}
                            className="cursor-pointer rounded-xs text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {formatTicketId(c.ticketId)}
                          </button>
                        ) : (
                          <span className="text-muted-foreground">
                            {formatTicketId(c.ticketId)}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon="phone"
              title="No calls yet"
              description={`Calls with ${firstName} will show up here.`}
            />
          )}
        </TabsContent>
      </ProfileTemplate>
    </Tabs>
  )
}
