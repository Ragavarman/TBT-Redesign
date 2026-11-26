import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  Avatar,
  Badge,
  Button,
  Icon,
  IconButton,
  PriorityGlyph,
  StatusGlyph,
} from '@/components/atoms'
import {
  Alert,
  EmptyState,
  PropertyRow,
  SlaBadge,
  Tabs,
  TabsContent,
  TabsList,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  TabsTrigger,
  toast,
} from '@/components/molecules'
import {
  AssigneePicker,
  AttachmentTile,
  Composer,
  ComposerBar,
  EmailView,
  FilterChips,
  InternalNote,
  InvoiceSheet,
  LinkedTicketRow,
  MergeDialog,
  ResolveDialog,
  SnoozeMenu,
  snoozeLabel,
  STATUS_PICKER_LABEL,
  StatusPicker,
  TicketBreadcrumb,
  TicketListItem,
  TimelineDay,
  TimelineEntry,
  type CannedReply,
  type ComposerMode,
  type ComposerSubmit,
  type InvoiceSubmit,
  type MergeCandidate,
  type ResolveSubmit,
  type SnoozeUntil,
} from '@/components/organisms'
import { TicketWorkspaceTemplate } from '@/components/templates'
import { useHotkeys } from '@/hooks/useHotkeys'
import {
  shortAgo,
  WS_NOW,
  wsAgents,
  wsCannedReplies,
  wsCurrentAgent,
  wsMentionables,
  wsTickets,
  wsGeneratedDetail,
  wsTicketDetail,
} from '@/mocks'
import { cn } from '@/lib/utils'
import {
  formatBytes,
  type Agent,
  formatTicketId,
  TICKET_PRIORITY_LABEL,
  TICKET_STATUS_LABEL,
  type Ticket,
  type TicketActivity,
  type TicketActivityKind,
  type TicketDetail,
  type TicketMessage,
  type TicketPriority,
  type TicketStatus,
} from '@/types'

/**
 * Figma Interface · T3 Ticket — Full timeline (227:23027), T1 Original email (227:22787),
 * T2 Attachments (227:22908): one page, three of its tabs. List 320 · conversation · details 300.
 */

export type TicketTab = 'conversation' | 'email' | 'attachments' | 'timeline'

/* ── Dates (UTC, so the mock workspace reads the same everywhere) ─────────────────────── */

const clock = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(iso))

const monthDay = (iso: string) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(
    new Date(iso),
  )

const longDate = (iso: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(iso))

const emailDate = (iso: string) =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  })
    .format(new Date(iso))
    .replace(/, (\d{4}),/, ', $1 ·')

function dayLabel(iso: string) {
  const day = (d: string) => d.slice(0, 10)
  const today = day(WS_NOW)
  const yesterday = new Date(Date.parse(WS_NOW) - 86_400_000).toISOString().slice(0, 10)
  if (day(iso) === today) return 'Today'
  if (day(iso) === yesterday) return 'Yesterday'
  return monthDay(iso)
}

/** Group newest-first items by day label, keeping order. */
function byDay<T extends { at: string }>(items: T[]) {
  const groups: { label: string; items: T[] }[] = []
  for (const item of items) {
    const label = dayLabel(item.at)
    const last = groups.at(-1)
    if (last?.label === label) last.items.push(item)
    else groups.push({ label, items: [item] })
  }
  return groups
}

/* ── List panel ────────────────────────────────────────────────────────────────────── */

function TicketListPanel({
  title,
  count,
  tickets,
  selectedId,
  onBack,
  onOpen,
}: {
  title: string
  count?: ReactNode
  tickets: Ticket[]
  selectedId: number
  onBack: () => void
  onOpen: (id: number) => void
}) {
  return (
    <>
      <header className="flex min-h-13 shrink-0 items-center gap-1 border-b ps-2 pe-3">
        <IconButton icon="arrow-left" label={`Back to ${title}`} size="sm" onClick={onBack} />
        <h2 className="min-w-0 truncate text-title text-foreground">{title}</h2>
        {count !== undefined && (
          <span className="shrink-0 text-title text-muted-foreground tabular-nums">{count}</span>
        )}
        <span className="flex-1" />
        <Button variant="ghost" size="sm" shortcut="V">
          Display
        </Button>
      </header>
      <nav aria-label={title} className="min-h-0 flex-1 overflow-y-auto">
        {tickets.map((t) => (
          <TicketListItem
            key={t.id}
            ticket={t}
            timeLabel={shortAgo(t.updatedAt)}
            selected={t.id === selectedId}
            onClick={() => onOpen(t.id)}
          />
        ))}
      </nav>
    </>
  )
}

/* ── Conversation tab ──────────────────────────────────────────────────────────────── */

/** Message text with line breaks kept and @mentions picked out. */
function Body({ text }: { text: string }) {
  const names = wsMentionables.map((m) => m.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const parts = text.split(new RegExp(`(@(?:${names.join('|')}))`, 'g'))
  return (
    <p className="text-body whitespace-pre-line text-foreground">
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <span key={i} className="rounded-xs bg-primary/10 px-0.5 text-primary">
            {p}
          </span>
        ) : (
          p
        ),
      )}
    </p>
  )
}

function Message({ message }: { message: TicketMessage }) {
  if (message.from === 'note') {
    return (
      <InternalNote author={message.author} timeLabel={clock(message.at)}>
        <Body text={message.body} />
      </InternalNote>
    )
  }
  return (
    <article
      aria-label={`Message from ${message.author.name}`}
      className={cn(
        'flex flex-col gap-2 rounded-lg border px-4 py-3',
        message.from === 'agent' ? 'bg-muted/50' : 'bg-card',
      )}
    >
      <header className="flex min-w-0 items-center gap-2">
        <Avatar name={message.author.name} src={message.author.avatarUrl} size="xs" aria-hidden />
        <span className="truncate text-label text-foreground">{message.author.name}</span>
        {message.via && (
          <span className="shrink-0 text-caption text-muted-foreground">· {message.via}</span>
        )}
        <span className="flex-1" />
        <time
          dateTime={message.at}
          className="shrink-0 text-caption text-muted-foreground tabular-nums"
        >
          {clock(message.at)}
        </time>
      </header>
      <Body text={message.body} />
      {message.attachments && message.attachments.length > 0 && (
        <ul aria-label="Attachments" className="flex flex-wrap gap-2">
          {message.attachments.map((a) => (
            <li
              key={a.name}
              className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-small text-foreground"
            >
              <Icon name="paperclip" size={14} className="text-muted-foreground" />
              {a.name} · {formatBytes(a.size)}
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}

function ConversationTab({ messages }: { messages: TicketMessage[] }) {
  // oldest first, like a chat thread — and open at (and follow) the newest message
  const groups = byDay([...messages].sort((a, b) => a.at.localeCompare(b.at)))
  const end = useRef<HTMLDivElement>(null)
  useEffect(() => {
    // scroll only the panel body (scrollIntoView could also nudge the app shell)
    const body = end.current?.closest<HTMLElement>('[data-slot=panel-body]')
    if (body) body.scrollTop = body.scrollHeight
  }, [messages.length])
  return (
    <div ref={end} className="flex flex-col gap-6 px-8 py-6">
      {groups.map((g) => (
        <section key={g.label} className="flex flex-col gap-3">
          <h3 className="text-caption text-muted-foreground">{g.label}</h3>
          {g.items.map((m) => (
            <Message key={m.id} message={m} />
          ))}
        </section>
      ))}
    </div>
  )
}

/* ── Original email tab ────────────────────────────────────────────────────────────── */

function EmailTab({ detail }: { detail: TicketDetail }) {
  const { email } = detail
  if (!email) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <EmptyState
          icon="mail"
          title="No original email"
          description="This ticket didn’t start from an email."
        />
      </div>
    )
  }
  const files = email.attachmentIds
    .map((id) => detail.attachments.find((a) => a.id === id))
    .filter((a) => a !== undefined)
  return (
    <div className="flex flex-col gap-4 px-8 py-5">
      <EmailView
        fields={[
          { label: 'From', value: email.from },
          { label: 'To', value: email.to },
          { label: 'Date', value: emailDate(email.date) },
          { label: 'Subject', value: email.subject },
        ]}
        body={email.body}
        quoted={email.quoted}
        attachments={files.map((f) => ({ id: f.id, label: `${f.name} · ${formatBytes(f.size)}` }))}
      />
      <div className="flex gap-2">
        <Button variant="ghost" size="sm">
          View raw source
        </Button>
        <Button variant="ghost" size="sm">
          Download .eml
        </Button>
      </div>
    </div>
  )
}

/* ── Attachments tab ───────────────────────────────────────────────────────────────── */

function AttachmentsTab({ detail }: { detail: TicketDetail }) {
  const files = detail.attachments
  const total = files.reduce((n, f) => n + f.size, 0)
  return (
    <div className="flex flex-col gap-4 px-8 py-5">
      <div className="flex items-center gap-2">
        <p className="flex-1 text-body text-muted-foreground">
          {files.length} {files.length === 1 ? 'file' : 'files'}
          {files.length > 0 && ` · ${formatBytes(total)}`}
        </p>
        {files.length > 0 && (
          <Button variant="secondary" size="sm" leadingIcon="download">
            Download all
          </Button>
        )}
        <Button size="sm" leadingIcon="upload">
          Upload
        </Button>
      </div>
      {files.length > 0 ? (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-3">
          {files.map((f) => (
            <li key={f.id} className="flex">
              <AttachmentTile
                className="flex-1"
                name={f.name}
                kind={f.kind}
                meta={`${formatBytes(f.size)} · ${f.source}`}
              />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon="paperclip"
          title="No attachments"
          description="Files from emails and calls will show up here."
        />
      )}
    </div>
  )
}

/* ── Timeline tab ──────────────────────────────────────────────────────────────────── */

type TimelineFilter = 'all' | TicketActivityKind

const TIMELINE_FILTERS: { value: TimelineFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'message', label: 'Messages' },
  { value: 'note', label: 'Notes' },
  { value: 'status', label: 'Status' },
  { value: 'call', label: 'Calls' },
]

function TimelineTab({ activity }: { activity: TicketActivity[] }) {
  const [filter, setFilter] = useState<TimelineFilter>('all')
  const shown = filter === 'all' ? activity : activity.filter((a) => a.kind === filter)
  return (
    <div className="flex flex-col gap-4 px-8 py-5">
      <FilterChips
        label="Filter timeline"
        options={TIMELINE_FILTERS}
        value={filter}
        onValueChange={setFilter}
      />
      {shown.length === 0 ? (
        <EmptyState type="no-results" title="Nothing here" description="Try another filter." />
      ) : (
        byDay(shown).map((g) => (
          <TimelineDay key={g.label} label={g.label}>
            {g.items.map((a) => (
              <TimelineEntry
                key={a.id}
                time={clock(a.at)}
                dateTime={a.at}
                actor={a.actor}
                title={a.title}
                detail={a.detail}
              />
            ))}
          </TimelineDay>
        ))
      )}
    </div>
  )
}

/* ── Details column ────────────────────────────────────────────────────────────────── */

function DetailsGroup({
  title,
  count,
  children,
}: {
  title: string
  count?: number
  children: ReactNode
}) {
  const [open, setOpen] = useState(true)
  return (
    <div className="flex flex-col">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="-mx-1 flex min-h-8 items-center gap-2 rounded-xs px-1 text-left text-small text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span>{title}</span>
        {count !== undefined && <span className="tabular-nums">{count}</span>}
        <span className="flex-1" />
        <Icon
          name="chevron-down"
          size={14}
          className={cn('transition-transform duration-150', !open && '-rotate-90')}
        />
      </button>
      {open && children}
    </div>
  )
}

/** A property value that opens a picker: looks like plain text until hovered. */
const pickerTrigger =
  '-mx-1 inline-flex min-w-0 cursor-pointer items-center gap-1.5 rounded-xs px-1 py-0.5 text-left outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring aria-expanded:bg-accent'

function DetailsCard({
  ticket,
  team,
  priority,
  sla,
  statusPicker,
  assigneePicker,
  detail,
  invoice,
  mergedInto,
  onAddInvoice,
}: {
  ticket: Ticket
  team: string
  priority: TicketPriority
  /** SLA value: plain text when on track, a badge when at risk or breached. */
  sla: ReactNode
  /** <StatusPicker /> with its trigger — the Status value. */
  statusPicker: ReactNode
  /** <AssigneePicker /> with its trigger — the Assignee value. */
  assigneePicker: ReactNode
  detail: TicketDetail
  /** The linked invoice, once added (Figma T5). */
  invoice?: InvoiceSubmit
  /** Ticket this one was merged into (Figma T4). */
  mergedInto?: string
  onAddInvoice: () => void
}) {
  return (
    <section
      aria-label="Ticket details"
      className="flex flex-col gap-1 rounded-xl border bg-card px-4 pt-4 pb-3 text-card-foreground"
    >
      <h2 className="pb-2 text-title text-foreground">{ticket.subject}</h2>
      <PropertyRow label="Status">{statusPicker}</PropertyRow>
      <PropertyRow label="Assignee">{assigneePicker}</PropertyRow>
      <PropertyRow label="Priority">
        <PriorityGlyph priority={priority} label={null} />
        {TICKET_PRIORITY_LABEL[priority]}
      </PropertyRow>
      <PropertyRow label="Team">{team}</PropertyRow>
      <PropertyRow label="Application">{detail.application}</PropertyRow>
      <PropertyRow label="Labels">
        {ticket.tags.map((tag) => (
          <Badge key={tag} variant="outline">
            {tag}
          </Badge>
        ))}
        <IconButton icon="plus" label="Add label" size="sm" className="size-6" />
      </PropertyRow>
      <PropertyRow label="SLA">{sla}</PropertyRow>
      <DetailsGroup title="Linked">
        <PropertyRow label="Asset" action={{ label: 'Link device', onClick: () => {} }}>
          {detail.asset}
        </PropertyRow>
        <PropertyRow label="Invoice" action={{ label: 'Add invoice', onClick: onAddInvoice }}>
          {invoice && (
            <>
              <span className="truncate">
                {invoice.number} · {invoice.currency}{' '}
                {invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <Badge
                variant={
                  invoice.status === 'Paid'
                    ? 'success'
                    : invoice.status === 'Overdue'
                      ? 'destructive'
                      : 'neutral'
                }
              >
                {invoice.status}
              </Badge>
            </>
          )}
        </PropertyRow>
        {mergedInto && <PropertyRow label="Merged into">{mergedInto}</PropertyRow>}
      </DetailsGroup>
      {detail.similar.length > 0 && (
        <DetailsGroup title="Similar tickets" count={detail.similar.length}>
          <div className="flex flex-col px-2">
            {detail.similar.map((s) => (
              <LinkedTicketRow
                key={s.id}
                status={s.status}
                title={`${formatTicketId(s.id)} ${s.subject}`}
                timeLabel={s.timeLabel}
              />
            ))}
          </div>
        </DetailsGroup>
      )}
    </section>
  )
}

function CustomerCard({
  ticket,
  detail,
  onOpen,
}: {
  ticket: Ticket
  detail: TicketDetail
  /** Open the customer's profile. */
  onOpen?: () => void
}) {
  const c = ticket.requester
  return (
    <section
      aria-label="Customer"
      className="flex flex-col gap-1 rounded-xl border bg-card px-4 pt-4 pb-3 text-card-foreground"
    >
      <div className="flex items-center gap-3 pb-2">
        <Avatar name={c.name} src={c.avatarUrl} size="md" aria-hidden />
        <div className="flex min-w-0 flex-col">
          <h2 className="truncate text-title text-foreground">
            {onOpen ? (
              <button
                type="button"
                onClick={onOpen}
                className="cursor-pointer rounded-xs text-left outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
              >
                {c.name}
              </button>
            ) : (
              c.name
            )}
          </h2>
          <p className="truncate text-small text-muted-foreground">{c.phone ?? c.email}</p>
        </div>
      </div>
      <PropertyRow label="Company">{c.organization || undefined}</PropertyRow>
      <PropertyRow label="Tag">
        {detail.customer.tag && <Badge variant="outline">{detail.customer.tag}</Badge>}
      </PropertyRow>
      <PropertyRow label="Tickets">
        {detail.customer.tickets} · {detail.customer.open} open
      </PropertyRow>
      <PropertyRow label="Customer since">{longDate(detail.customer.since)}</PropertyRow>
    </section>
  )
}

/* ── Page ──────────────────────────────────────────────────────────────────────────── */

export interface TicketDetailPageProps {
  /** The app sidebar — collapsed to the rail on this screen. */
  sidebar: ReactNode
  /** The view the agent came from — list panel title and back target. */
  viewLabel: string
  viewCount?: ReactNode
  /** Tickets in that view (the list panel). */
  tickets: Ticket[]
  ticket: Ticket
  initialTab?: TicketTab
  /** Open a picker on load (stories: Figma X1 / X2 / X5). */
  initialPicker?: Picker
  /** Open the composer on load (stories: Figma X6 / X7). */
  initialComposer?: ComposerMode
  /** Text already typed in that composer, e.g. "/print" to show the canned-reply menu. */
  initialComposerText?: string
  /** Open the resolve dialog on load (story: Figma X8). */
  initialResolve?: boolean
  /** Open Merge (T4) or Add invoice (T5) on load. */
  initialOverlay?: 'merge' | 'invoice'
  onBack: () => void
  onOpenTicket: (id: number) => void
  /** Customer card name → their profile. */
  onOpenCustomer?: () => void
  /** "/" suggestions in the reply; defaults to the mock set (the app passes Knowledge's). */
  cannedReplies?: CannedReply[]
}

type Picker = 'status' | 'assignee' | 'snooze'

const TEAMS = ['Support Team Alpha', 'Technical Team Beta', 'Sales Team Gamma']

/** Resolution reasons in the resolve dialog (Figma X8). */
const RESOLUTIONS = [
  'Fixed — firmware rolled back',
  'Fixed — settings changed',
  'Answered — how-to question',
  'Duplicate of another ticket',
  'No reply from the customer',
  'Won’t fix',
]

/** Open tickets per agent — the load shown in the assignee picker. */
const openCount = (agentId: string) =>
  wsTickets.filter(
    (t) => t.assignee?.id === agentId && t.status !== 'resolved' && t.status !== 'closed',
  ).length

export function TicketDetailPage({
  sidebar,
  viewLabel,
  viewCount,
  tickets,
  ticket,
  initialTab = 'conversation',
  initialPicker,
  initialComposer,
  initialComposerText,
  initialResolve,
  initialOverlay,
  onBack,
  onOpenTicket,
  onOpenCustomer,
  cannedReplies = wsCannedReplies,
}: TicketDetailPageProps) {
  const baseDetail = wsTicketDetail(ticket.id) ?? wsGeneratedDetail(ticket)
  const me = wsCurrentAgent
  const [tab, setTab] = useState<TicketTab>(initialTab)
  const [picker, setPicker] = useState<Picker | null>(initialPicker ?? null)
  const pickerProps = (p: Picker) => ({
    open: picker === p,
    onOpenChange: (open: boolean) => setPicker(open ? p : null),
  })

  // Everything below works against the mock ticket, and each change lands on the timeline.
  const [status, setStatus] = useState<TicketStatus>(ticket.status)
  const [assignee, setAssignee] = useState<Agent | undefined>(ticket.assignee)
  const [team, setTeam] = useState(ticket.team)
  const [snoozed, setSnoozed] = useState<SnoozeUntil>()
  const [activity, setActivity] = useState<TicketActivity[]>(baseDetail.activity)
  const [messages, setMessages] = useState<TicketMessage[]>(baseDetail.messages)
  const [priority, setPriority] = useState<TicketPriority>(ticket.priority)
  const [resolution, setResolution] = useState(baseDetail.resolution)
  const [resolveOpen, setResolveOpen] = useState(initialResolve ?? false)
  // Merge (T4) and Add invoice (T5)
  const [overlay, setOverlay] = useState<'merge' | 'invoice' | null>(initialOverlay ?? null)
  const [invoice, setInvoice] = useState<InvoiceSubmit>()
  const [mergedInto, setMergedInto] = useState<string>()
  const [attachments, setAttachments] = useState(baseDetail.attachments)
  const detail = { ...baseDetail, attachments }
  // SLA: a reply is the first response; escalating hands it to the lead
  const [responded, setResponded] = useState(false)
  const [escalated, setEscalated] = useState(false)
  const resolved = status === 'resolved' || status === 'closed'
  const closed = status === 'closed'
  const breached = ticket.sla?.state === 'breached' && !responded && !resolved

  // Local changes are stamped a second apart from the workspace's "now", so they sort in order.
  const seq = useRef(0)
  const stamp = () => new Date(Date.parse(WS_NOW) + ++seq.current * 1000).toISOString()

  const log = (title: string, entryDetail?: string, kind: TicketActivityKind = 'status') =>
    setActivity((a) => [
      { id: `local-a${seq.current}`, kind, actor: me, title, detail: entryDetail, at: stamp() },
      ...a,
    ])

  const changeStatus = (next: TicketStatus) => {
    if (next === status) return
    log(
      `${me.name} changed status`,
      `${STATUS_PICKER_LABEL[status]} → ${STATUS_PICKER_LABEL[next]}`,
    )
    setStatus(next)
    const done = next === 'resolved' || next === 'closed'
    if (done) {
      setSnoozed(undefined)
      setComposer(null)
      setResolution((r) => r ?? { by: me.name, at: stamp() })
    } else setResolution(undefined)
    toast.success(`Status changed to ${STATUS_PICKER_LABEL[next]}`)
  }

  /** Resolve from the dialog: resolution, closing message, survey. */
  const resolveWith = (r: ResolveSubmit) => {
    if (r.message) {
      setMessages((m) => [
        ...m,
        {
          id: `local-m${seq.current}`,
          author: me,
          from: 'agent',
          via: 'Email',
          body: r.message,
          at: stamp(),
        },
      ])
      setResponded(true)
    }
    log(`${me.name} resolved the ticket`, r.resolution)
    setStatus('resolved')
    setSnoozed(undefined)
    setComposer(null)
    setResolution({ by: me.name, at: stamp() })
    toast.success(
      [
        `${formatTicketId(ticket.id)} resolved`,
        r.survey && 'survey sent',
        r.linkNote && 'linked to the knowledge note',
      ]
        .filter(Boolean)
        .join(' · '),
    )
  }

  const reopen = () => changeStatus('open')

  /** Breached SLA → hand to the team lead at urgent priority. */
  const escalate = () => {
    const lead = wsAgents.teamLead
    log(`${me.name} escalated the ticket`, `To ${lead.name} · priority Urgent`)
    setPriority('urgent')
    setAssignee(lead)
    setEscalated(true)
    toast.success(`Escalated to ${lead.name}`)
  }

  const assign = (agent: Agent | undefined) => {
    if (agent?.id === assignee?.id) return
    log(
      agent
        ? `${me.name} assigned ${agent.id === me.id ? 'themselves' : agent.name}`
        : `${me.name} unassigned the ticket`,
      `${assignee?.name ?? 'Unassigned'} → ${agent?.name ?? 'Unassigned'}`,
    )
    setAssignee(agent)
    toast.success(agent ? `Assigned to ${agent.id === me.id ? 'you' : agent.name}` : 'Unassigned')
  }

  const moveTeam = (next: string) => {
    log(`${me.name} moved the ticket`, `${team} → ${next}`)
    setTeam(next)
    setAssignee(undefined)
    toast.success(`Moved to ${next}`)
  }

  const snooze = (until: SnoozeUntil | undefined) => {
    setSnoozed(until)
    const label =
      until && ('reply' in until ? 'the customer replies' : snoozeLabel(until.at, WS_NOW))
    log(
      until ? `${me.name} snoozed the ticket` : `${me.name} unsnoozed the ticket`,
      label && `Until ${label}`,
    )
    toast.success(until ? `Snoozed until ${label}` : 'Snooze removed')
  }

  // The composer: closed (the bar) or open in a mode. Opening jumps to the Conversation tab.
  const [composer, setComposer] = useState<{ mode: ComposerMode; text?: string } | null>(
    initialComposer ? { mode: initialComposer, text: initialComposerText } : null,
  )
  const compose = (mode: ComposerMode, text?: string) => {
    setTab('conversation')
    setComposer({ mode, text })
  }

  const submit = (p: ComposerSubmit) => {
    const at = stamp()
    const quote = (s: string) => `“${s.length > 60 ? `${s.slice(0, 60)}…` : s}”`
    if (p.mode === 'reply') {
      const files = p.attachments.map(({ name, size }) => ({ name, size }))
      setMessages((m) => [
        ...m,
        {
          id: `local-m${seq.current}`,
          author: me,
          from: 'agent',
          via: 'Email',
          body: p.body,
          attachments: files,
          at,
        },
      ])
      log(`${me.name} replied by email`, quote(p.body), 'message')
      setResponded(true)
      if (p.setWaiting) changeStatus('waiting')
      toast.success(`Reply sent to ${ticket.requester.name}`)
    } else if (p.mode === 'note') {
      setMessages((m) => [
        ...m,
        { id: `local-m${seq.current}`, author: me, from: 'note', body: p.body, at },
      ])
      log(`${me.name} added an internal note`, quote(p.body), 'note')
      const who = [...new Set(p.mentions.map((x) => x.name))]
      toast.success(who.length ? `Note added · ${who.join(', ')} notified` : 'Note added')
    } else {
      const dir = p.direction === 'outbound' ? 'Call to' : 'Call from'
      log(
        `${dir} ${ticket.requester.phone ?? ticket.requester.name}`,
        [p.duration, p.body].filter(Boolean).join(' · '),
        'call',
      )
      toast.success('Call logged')
    }
    setComposer(null)
  }

  const index = tickets.findIndex((t) => t.id === ticket.id)
  const step = (by: number) => {
    const next = tickets[index + by]
    if (next) onOpenTicket(next.id)
  }

  useHotkeys({
    r: () => !closed && compose('reply'),
    n: () => !closed && compose('note'),
    '/': () => !closed && compose('reply', '/'),
    s: () => setPicker('status'),
    'shift+a': () => setPicker('assignee'),
    a: () => assign(me),
    h: () => !resolved && setPicker('snooze'),
    e: () => (resolved ? reopen() : changeStatus('resolved')),
    'shift+e': () => !resolved && setResolveOpen(true),
    m: () => !closed && setOverlay('merge'),
    j: () => step(1),
    k: () => step(-1),
    escape: onBack,
  })

  const firstName = ticket.requester.name.split(' ')[0] ?? ticket.requester.name

  // Merge candidates: this ticket's similar tickets and the same caller's first, then the rest.
  const sameCaller = (t: Ticket) => t.requester.id === ticket.requester.id
  const mergeCandidates: MergeCandidate[] = [
    ...detail.similar.map((s) => ({
      id: s.id,
      label: formatTicketId(s.id),
      subject: s.subject,
      status: s.status,
      timeLabel: s.timeLabel,
      customer: ticket.requester.name,
      suggested: true,
    })),
    ...tickets
      .filter((t) => t.id !== ticket.id && !detail.similar.some((s) => s.id === t.id))
      .map((t) => ({
        id: t.id,
        label: formatTicketId(t.id),
        subject: t.subject,
        status: t.status,
        timeLabel: shortAgo(t.updatedAt),
        customer: t.requester.name,
        suggested: sameCaller(t),
      })),
  ]

  const merge = ({ targetId, notify }: { targetId: number; notify: boolean }) => {
    const target = formatTicketId(targetId)
    log(`${me.name} merged the ticket`, `Into ${target}`)
    if (notify) {
      setMessages((m) => [
        ...m,
        {
          id: `local-m${seq.current}`,
          author: me,
          from: 'agent',
          via: 'Email',
          body: `Hi ${firstName}, we’ve combined this with your other request (${target}) so everything is in one place.`,
          at: stamp(),
        },
      ])
    }
    setMergedInto(target)
    setStatus('closed')
    setComposer(null)
    setSnoozed(undefined)
    setResolution({ by: me.name, at: stamp() })
    toast.success(`${formatTicketId(ticket.id)} merged into ${target}`, {
      action: { label: 'Open', onClick: () => onOpenTicket(targetId) },
    })
  }

  const addInvoice = (inv: InvoiceSubmit) => {
    setInvoice(inv)
    if (inv.file) {
      const file = inv.file
      setAttachments((a) => [
        ...a,
        {
          id: `inv-${a.length}`,
          name: file.name,
          kind: 'document',
          size: file.size,
          source: `added by ${me.name}`,
        },
      ])
    }
    log(
      `${me.name} linked an invoice`,
      `${inv.number} · ${inv.currency} ${inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} · ${inv.status}`,
    )
    toast.success(`${inv.number} linked to ${formatTicketId(ticket.id)}`)
  }

  // Ticket-state banner under the tabs (Figma X9 closed, X10 SLA breached).
  const banner = resolved ? (
    <Alert
      variant="success"
      icon="check"
      title={closed ? 'Closed' : 'Resolved'}
      description={[
        resolution &&
          `Resolved by ${resolution.by} on ${monthDay(resolution.at)}${clock(resolution.at) ? `, ${clock(resolution.at)}` : ''}`,
        resolution?.csat !== undefined && `CSAT ${resolution.csat}/5`,
        closed
          ? `Replies from ${firstName} reopen it.`
          : `It reopens if ${firstName} replies within 7 days.`,
      ]
        .filter(Boolean)
        .join(' · ')}
      action={
        <Button variant="outline" size="sm" onClick={reopen}>
          Reopen
        </Button>
      }
    />
  ) : breached ? (
    escalated ? (
      <Alert
        variant="warning"
        title="Escalated"
        description={`${wsAgents.teamLead.name} has the ticket at urgent priority. The first response is still overdue — reply now.`}
      />
    ) : (
      <Alert
        variant="destructive"
        title="SLA breached"
        description={`First response is overdue (${ticket.sla!.label.toLowerCase()}). Reply now or escalate to the team lead.`}
        action={
          <Button variant="outline" size="sm" onClick={escalate}>
            Escalate
          </Button>
        }
      />
    )
  ) : undefined

  const sla = ticket.sla
  const slaValue = !sla ? undefined : resolved ? (
    `Resolved · SLA ${sla.state === 'breached' && !responded ? 'breached' : 'met'}`
  ) : breached ? (
    <SlaBadge state="breached">{sla.label}</SlaBadge>
  ) : sla.state === 'breached' ? (
    'Responded late'
  ) : sla.state === 'at-risk' ? (
    <SlaBadge state="at-risk">{sla.label}</SlaBadge>
  ) : (
    sla.label
  )

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as TicketTab)} className="contents">
      <MergeDialog
        open={overlay === 'merge'}
        onOpenChange={(o) => setOverlay(o ? 'merge' : null)}
        ticketLabel={formatTicketId(ticket.id)}
        candidates={mergeCandidates}
        onMerge={merge}
      />
      <InvoiceSheet
        key={overlay === 'invoice' ? 'invoice-open' : 'invoice'}
        open={overlay === 'invoice'}
        onOpenChange={(o) => setOverlay(o ? 'invoice' : null)}
        linkedTo={`Linked to ${formatTicketId(ticket.id)} · ${ticket.requester.name}`}
        customer={[ticket.requester.name, ticket.requester.phone ?? ticket.requester.email].join(
          ' · ',
        )}
        defaultNumber={`INV-${1043 + (ticket.id % 50)}`}
        today={WS_NOW.slice(0, 10)}
        onAdd={addInvoice}
      />
      <ResolveDialog
        open={resolveOpen}
        onOpenChange={setResolveOpen}
        ticketLabel={formatTicketId(ticket.id)}
        customerName={firstName}
        resolutions={RESOLUTIONS}
        defaultMessage={`Hi ${firstName}, this should be sorted now. Reply here if it happens again.`}
        knowledgeNote={detail.knowledgeNote}
        onResolve={resolveWith}
      />
      <TicketWorkspaceTemplate
        sidebar={sidebar}
        list={
          <TicketListPanel
            title={viewLabel}
            count={viewCount}
            tickets={tickets}
            selectedId={ticket.id}
            onBack={onBack}
            onOpen={onOpenTicket}
          />
        }
        header={
          <header className="flex min-h-13 shrink-0 items-start gap-4 px-5 pt-4 pb-3">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <TicketBreadcrumb
                  ticketId={formatTicketId(ticket.id)}
                  status={status}
                  source={detail.source}
                  className="min-w-0"
                />
                {snoozed && (
                  <Badge
                    variant="info"
                    icon="clock"
                    onRemove={() => snooze(undefined)}
                    removeLabel="Remove snooze"
                  >
                    Snoozed until{' '}
                    {'reply' in snoozed ? 'customer replies' : snoozeLabel(snoozed.at, WS_NOW)}
                  </Badge>
                )}
              </div>
              <h1 className="line-clamp-2 text-heading-2 text-foreground">{ticket.subject}</h1>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <SnoozeMenu
                now={WS_NOW}
                onSnooze={snooze}
                {...pickerProps('snooze')}
                trigger={
                  <Button variant="ghost" shortcut="H" disabled={resolved}>
                    Snooze
                  </Button>
                }
              />
              <Button
                variant="secondary"
                shortcut="E"
                onClick={() => (resolved ? reopen() : setResolveOpen(true))}
              >
                {resolved ? 'Reopen' : 'Resolve'}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <IconButton icon="dots" label="More actions" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    icon="layers"
                    shortcut="M"
                    disabled={closed}
                    onSelect={() => setOverlay('merge')}
                  >
                    Merge into another ticket
                  </DropdownMenuItem>
                  <DropdownMenuItem icon="ticket" onSelect={() => setOverlay('invoice')}>
                    Add invoice
                  </DropdownMenuItem>
                  <DropdownMenuItem icon="phone" disabled={closed} onSelect={() => compose('call')}>
                    Log a call
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
        }
        tabs={
          <TabsList className="px-5 py-2" aria-label="Ticket sections">
            <TabsTrigger value="conversation">Conversation</TabsTrigger>
            <TabsTrigger value="email">Original email</TabsTrigger>
            <TabsTrigger value="attachments" count={detail.attachments.length || undefined}>
              Attachments
            </TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>
        }
        banner={banner}
        composerLayout={composer || closed ? 'docked' : 'floating'}
        composer={
          closed ? (
            // Figma X9: read-only — no replying or notes until it's reopened
            <div className="flex items-center gap-3 rounded-xl border bg-muted/40 px-4 py-3">
              <Icon name="lock" size={16} className="text-muted-foreground" />
              <p className="min-w-0 flex-1 text-body text-muted-foreground">
                This ticket is closed. Reopen it to reply or add a note.
              </p>
              <Button shortcut="E" onClick={reopen}>
                Reopen
              </Button>
            </div>
          ) : composer ? (
            <Composer
              mode={composer.mode}
              onModeChange={(mode) => setComposer((c) => ({ ...c, mode }))}
              initialText={composer.text}
              to={`${ticket.requester.name} <${ticket.requester.email}>`}
              cannedReplies={cannedReplies}
              mentionables={wsMentionables.filter((m) => m.id !== me.id)}
              signature={`Signature: ${me.name}`}
              onSubmit={submit}
              onClose={() => setComposer(null)}
            />
          ) : (
            <ComposerBar>
              <Button
                variant="ghost"
                leadingIcon="reply"
                shortcut="R"
                onClick={() => compose('reply')}
              >
                Reply
              </Button>
              <Button
                variant="ghost"
                leadingIcon="pencil"
                shortcut="N"
                onClick={() => compose('note')}
              >
                Note
              </Button>
              <Button
                variant="ghost"
                leadingIcon="chat"
                shortcut="/"
                onClick={() => compose('reply', '/')}
              >
                Canned reply
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" leadingIcon="dots">
                    More
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="end">
                  <DropdownMenuItem icon="phone" onSelect={() => compose('call')}>
                    Log a call
                  </DropdownMenuItem>
                  <DropdownMenuItem icon="external" disabled>
                    Forward
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </ComposerBar>
          )
        }
        details={
          <>
            <DetailsCard
              ticket={ticket}
              team={team}
              priority={priority}
              sla={slaValue}
              detail={detail}
              invoice={invoice}
              mergedInto={mergedInto}
              onAddInvoice={() => setOverlay('invoice')}
              statusPicker={
                <StatusPicker
                  status={status}
                  onChange={changeStatus}
                  {...pickerProps('status')}
                  trigger={
                    <button type="button" aria-label="Change status" className={pickerTrigger}>
                      <StatusGlyph status={status} label={null} />
                      <span className="truncate">{TICKET_STATUS_LABEL[status]}</span>
                    </button>
                  }
                />
              }
              assigneePicker={
                <AssigneePicker
                  assigneeId={assignee?.id}
                  team={team}
                  me={me}
                  agents={Object.values(wsAgents)
                    .filter((a) => a.team === team)
                    .map((agent) => ({ agent, meta: `${openCount(agent.id)} open` }))}
                  teams={TEAMS}
                  onAssign={assign}
                  onTeamChange={moveTeam}
                  {...pickerProps('assignee')}
                  trigger={
                    <button type="button" aria-label="Change assignee" className={pickerTrigger}>
                      {assignee ? (
                        <>
                          <Avatar name={assignee.name} size="xs" aria-hidden />
                          <span className="truncate">{assignee.name}</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
                    </button>
                  }
                />
              }
            />
            <CustomerCard ticket={ticket} detail={detail} onOpen={onOpenCustomer} />
          </>
        }
      >
        <TabsContent value="conversation">
          <ConversationTab messages={messages} />
        </TabsContent>
        <TabsContent value="email" className="h-full">
          <EmailTab detail={detail} />
        </TabsContent>
        <TabsContent value="attachments">
          <AttachmentsTab detail={detail} />
        </TabsContent>
        <TabsContent value="timeline">
          <TimelineTab activity={activity} />
        </TabsContent>
      </TicketWorkspaceTemplate>
    </Tabs>
  )
}
