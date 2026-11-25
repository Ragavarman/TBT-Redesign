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
  EmptyState,
  PropertyRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/molecules'
import {
  AttachmentTile,
  ComposerBar,
  EmailView,
  FilterChips,
  InternalNote,
  LinkedTicketRow,
  TicketBreadcrumb,
  TicketListItem,
  TimelineDay,
  TimelineEntry,
} from '@/components/organisms'
import { TicketWorkspaceTemplate } from '@/components/templates'
import { shortAgo, WS_NOW, wsTicketDetail } from '@/mocks'
import { cn } from '@/lib/utils'
import {
  formatBytes,
  formatTicketId,
  TICKET_PRIORITY_LABEL,
  TICKET_STATUS_LABEL,
  type Ticket,
  type TicketActivity,
  type TicketActivityKind,
  type TicketDetail,
  type TicketMessage,
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

function Message({ message }: { message: TicketMessage }) {
  if (message.from === 'note') {
    return (
      <InternalNote author={message.author} timeLabel={clock(message.at)}>
        {message.body}
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
      <p className="text-body text-foreground">{message.body}</p>
    </article>
  )
}

function ConversationTab({ messages }: { messages: TicketMessage[] }) {
  // oldest first, like a chat thread — and open at the newest message
  const groups = byDay([...messages].sort((a, b) => a.at.localeCompare(b.at)))
  const end = useRef<HTMLDivElement>(null)
  useEffect(() => {
    // scroll only the panel body (scrollIntoView could also nudge the app shell)
    const body = end.current?.closest<HTMLElement>('[data-slot=panel-body]')
    if (body) body.scrollTop = body.scrollHeight
  }, [])
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

function DetailsCard({
  ticket,
  status,
  detail,
}: {
  ticket: Ticket
  status: TicketStatus
  detail: TicketDetail
}) {
  return (
    <section
      aria-label="Ticket details"
      className="flex flex-col gap-1 rounded-xl border bg-card px-4 pt-4 pb-3 text-card-foreground"
    >
      <h2 className="pb-2 text-title text-foreground">{ticket.subject}</h2>
      <PropertyRow label="Status">
        <StatusGlyph status={status} label={null} />
        {TICKET_STATUS_LABEL[status]}
      </PropertyRow>
      <PropertyRow label="Assignee">
        {ticket.assignee && (
          <>
            <Avatar name={ticket.assignee.name} size="xs" aria-hidden />
            {ticket.assignee.name}
          </>
        )}
      </PropertyRow>
      <PropertyRow label="Priority">
        <PriorityGlyph priority={ticket.priority} label={null} />
        {TICKET_PRIORITY_LABEL[ticket.priority]}
      </PropertyRow>
      <PropertyRow label="Team">{ticket.team}</PropertyRow>
      <PropertyRow label="Application">{detail.application}</PropertyRow>
      <PropertyRow label="Labels">
        {ticket.tags.map((tag) => (
          <Badge key={tag} variant="outline">
            {tag}
          </Badge>
        ))}
        <IconButton icon="plus" label="Add label" size="sm" className="size-6" />
      </PropertyRow>
      <PropertyRow label="SLA">{ticket.sla?.label}</PropertyRow>
      <DetailsGroup title="Linked">
        <PropertyRow label="Asset" action={{ label: 'Link device', onClick: () => {} }}>
          {detail.asset}
        </PropertyRow>
        <PropertyRow label="Invoice" action={{ label: 'Add invoice', onClick: () => {} }}>
          {detail.invoice}
        </PropertyRow>
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

function CustomerCard({ ticket, detail }: { ticket: Ticket; detail: TicketDetail }) {
  const c = ticket.requester
  return (
    <section
      aria-label="Customer"
      className="flex flex-col gap-1 rounded-xl border bg-card px-4 pt-4 pb-3 text-card-foreground"
    >
      <div className="flex items-center gap-3 pb-2">
        <Avatar name={c.name} src={c.avatarUrl} size="md" aria-hidden />
        <div className="flex min-w-0 flex-col">
          <h2 className="truncate text-title text-foreground">{c.name}</h2>
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
  onBack: () => void
  onOpenTicket: (id: number) => void
}

export function TicketDetailPage({
  sidebar,
  viewLabel,
  viewCount,
  tickets,
  ticket,
  initialTab = 'conversation',
  onBack,
  onOpenTicket,
}: TicketDetailPageProps) {
  const detail = wsTicketDetail(ticket.id)!
  const [tab, setTab] = useState<TicketTab>(initialTab)
  // Resolve works on the mock: flips the status and back (Reopen).
  const [status, setStatus] = useState<TicketStatus>(ticket.status)
  const resolved = status === 'resolved' || status === 'closed'

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as TicketTab)} className="contents">
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
              <TicketBreadcrumb
                ticketId={formatTicketId(ticket.id)}
                status={status}
                source={detail.source}
              />
              <h1 className="line-clamp-2 text-heading-2 text-foreground">{ticket.subject}</h1>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button variant="ghost" shortcut="H" disabled={resolved}>
                Snooze
              </Button>
              <Button
                variant="secondary"
                shortcut="E"
                onClick={() => setStatus(resolved ? 'open' : 'resolved')}
              >
                {resolved ? 'Reopen' : 'Resolve'}
              </Button>
              <IconButton icon="dots" label="More actions" />
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
        composer={
          <ComposerBar>
            <Button variant="ghost" leadingIcon="reply" shortcut="R">
              Reply
            </Button>
            <Button variant="ghost" leadingIcon="pencil" shortcut="N">
              Note
            </Button>
            <Button variant="ghost" leadingIcon="chat" shortcut="/">
              Canned reply
            </Button>
            <Button variant="ghost" leadingIcon="dots">
              More
            </Button>
          </ComposerBar>
        }
        details={
          <>
            <DetailsCard ticket={ticket} status={status} detail={detail} />
            <CustomerCard ticket={ticket} detail={detail} />
          </>
        }
      >
        <TabsContent value="conversation">
          <ConversationTab messages={detail.messages} />
        </TabsContent>
        <TabsContent value="email" className="h-full">
          <EmailTab detail={detail} />
        </TabsContent>
        <TabsContent value="attachments">
          <AttachmentsTab detail={detail} />
        </TabsContent>
        <TabsContent value="timeline">
          <TimelineTab activity={detail.activity} />
        </TabsContent>
      </TicketWorkspaceTemplate>
    </Tabs>
  )
}
