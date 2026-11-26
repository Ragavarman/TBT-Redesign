import { useRef, useState, type ReactNode } from 'react'
import { Button, Icon, PriorityGlyph, StatusGlyph, type IconName } from '@/components/atoms'
import { EmptyState, Tabs, TabsList, TabsTrigger } from '@/components/molecules'
import { PageHeader, TicketRow } from '@/components/organisms'
import { ListPageTemplate } from '@/components/templates'
import { useHotkeys } from '@/hooks/useHotkeys'
import { customerLabel, shortAgo } from '@/mocks'
import { cn } from '@/lib/utils'
import type { Ticket } from '@/types'
import {
  groupTickets,
  type DisplayOptions,
  type FilterCondition,
  type SavedView,
} from './ticket-view'
import { useTicketView } from './useTicketView'

/**
 * Figma Interface · My tickets list (X3 Filter builder, X4 Display options, T6 Save view):
 * header with Filters / Display / New ticket, Todo · All statuses tabs, and rows grouped by
 * status (Breached SLA pinned first). Every inbox view except All tickets uses it.
 */

type Scope = 'todo' | 'all'

export interface TicketsListPageProps {
  sidebar: ReactNode
  title: string
  icon?: IconName
  /** The view's tickets, before the agent's own filters. */
  tickets: Ticket[]
  /** A saved view's filters. */
  initialFilters?: FilterCondition[]
  initialDisplay?: Partial<DisplayOptions>
  onOpenTicket?: (id: number) => void
  onSaveView?: (view: SavedView) => void
  /** New ticket button (C opens it from anywhere in the app). */
  onNewTicket?: () => void
  /** Stories: open a control on load. */
  initialOpen?: 'filters' | 'display' | 'save'
  /**
   * Inbox zero (Figma X27): what to offer when nothing is left to do, e.g. View unassigned.
   * Shown on the Todo tab when there are no filters and no open tickets.
   */
  caughtUpAction?: { label: string; onClick: () => void }
}

export function TicketsListPage({
  sidebar,
  title,
  icon = 'inbox',
  tickets,
  initialFilters,
  initialDisplay,
  onOpenTicket,
  onSaveView,
  initialOpen,
  onNewTicket,
  caughtUpAction,
}: TicketsListPageProps) {
  const [scope, setScope] = useState<Scope>('todo')
  const todo = tickets.filter((t) => t.status !== 'resolved' && t.status !== 'closed')
  const view = useTicketView({
    tickets: scope === 'todo' ? todo : tickets,
    initialFilters,
    initialDisplay,
    layout: 'list',
    title,
    onSaveView,
    initialOpen,
  })
  const groups = groupTickets(view.shown, view.display)
  const list = useRef<HTMLDivElement>(null)

  // J / K move between rows (Enter opens the focused one)
  const moveRow = (by: number) => {
    const rows = [...(list.current?.querySelectorAll<HTMLElement>('[data-slot=ticket-row]') ?? [])]
    const at = rows.findIndex((r) => r === document.activeElement)
    const next = at === -1 ? (by > 0 ? 0 : rows.length - 1) : at + by
    rows[Math.min(rows.length - 1, Math.max(0, next))]?.focus()
  }
  useHotkeys({ j: () => moveRow(1), k: () => moveRow(-1) })

  return (
    <ListPageTemplate
      sidebar={sidebar}
      header={
        <PageHeader
          icon={icon}
          title={title}
          actions={
            <>
              {view.controls}
              <Button leadingIcon="plus" shortcut="C" onClick={onNewTicket}>
                New ticket
              </Button>
            </>
          }
        />
      }
      toolbar={
        <Tabs value={scope} onValueChange={(v) => setScope(v as Scope)}>
          <TabsList className="px-4 py-2" aria-label="Show">
            <TabsTrigger value="todo" count={todo.length}>
              Todo
            </TabsTrigger>
            <TabsTrigger value="all">All statuses</TabsTrigger>
          </TabsList>
        </Tabs>
      }
    >
      <div ref={list}>
        {view.shown.length === 0 && scope === 'todo' && view.filters.length === 0 ? (
          // Figma X27 · inbox zero
          <div className="flex h-[60vh] items-center justify-center p-6">
            <EmptyState
              icon="check"
              title="You’re all caught up"
              description={
                tickets.length > 0
                  ? `Nothing needs you right now. ${tickets.length} resolved or closed ${tickets.length === 1 ? 'ticket is' : 'tickets are'} under All statuses.`
                  : 'Nothing needs you right now.'
              }
              action={
                <div className="flex flex-col items-center gap-2">
                  {caughtUpAction && (
                    <Button size="sm" onClick={caughtUpAction.onClick}>
                      {caughtUpAction.label}
                    </Button>
                  )}
                  {tickets.length > 0 && (
                    <Button size="sm" variant="ghost" onClick={() => setScope('all')}>
                      See all statuses
                    </Button>
                  )}
                </div>
              }
            />
          </div>
        ) : view.shown.length === 0 ? (
          <div className="flex h-80 items-center justify-center p-6">
            <EmptyState
              type={view.filters.length ? 'no-results' : 'empty'}
              title={view.filters.length ? 'No tickets match these filters' : 'Nothing here'}
              description={
                view.filters.length
                  ? 'Change or clear the filters to see more.'
                  : 'Tickets in this view will show up here.'
              }
            />
          </div>
        ) : (
          groups.map((g) => (
            <section key={g.id} aria-label={`${g.label}, ${g.tickets.length}`}>
              {view.display.grouping !== 'none' && (
                <h2
                  className={cn(
                    'flex items-center gap-2 border-b bg-muted/40 px-4 text-label text-foreground',
                    view.display.density === 'compact' ? 'h-8' : 'h-10',
                  )}
                >
                  {g.status ? (
                    <StatusGlyph status={g.status} label={null} />
                  ) : g.priority ? (
                    <PriorityGlyph priority={g.priority} label={null} />
                  ) : (
                    <Icon name="user" size={14} className="text-muted-foreground" />
                  )}
                  {g.label}
                  <span className="text-muted-foreground tabular-nums">{g.tickets.length}</span>
                </h2>
              )}
              {g.tickets.map((t) => (
                <TicketRow
                  key={t.id}
                  ticket={t}
                  timeLabel={shortAgo(t.updatedAt)}
                  customerLabel={customerLabel(t.requester)}
                  properties={view.display.props}
                  density={view.display.density}
                  onClick={() => onOpenTicket?.(t.id)}
                />
              ))}
            </section>
          ))
        )}
      </div>
      {view.saveDialog}
    </ListPageTemplate>
  )
}
