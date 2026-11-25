import { useMemo, useRef, useState, type ReactNode } from 'react'
import { Avatar, Badge, Button, Checkbox, PriorityGlyph, StatusGlyph } from '@/components/atoms'
import { SlaBadge } from '@/components/molecules'
import {
  BulkActionBar,
  createDataTableColumns,
  DataTable,
  PageHeader,
  type RowSelectionState,
} from '@/components/organisms'
import { ListPageTemplate } from '@/components/templates'
import { useHotkeys } from '@/hooks/useHotkeys'
import { customerLabel, shortAgo, wsCounts, wsTickets } from '@/mocks'
import type { SavedView } from './ticket-view'
import { useTicketView } from './useTicketView'
import {
  formatTicketId,
  TICKET_PRIORITIES,
  TICKET_PRIORITY_LABEL,
  TICKET_STATUS_LABEL,
  type Ticket,
} from '@/types'

/**
 * Figma Interface · 02 Tickets — Table view (227:22597).
 * Sidebar on "All tickets", header with Filters / Display / New ticket, a bulk-action strip
 * while rows are selected, and the full-bleed sortable table.
 */

// Avatar + muted name, as the Customer and Assignee columns show it.
function PersonText({ name }: { name?: string }) {
  if (!name) return <span className="text-muted-foreground">Unassigned</span>
  return (
    <span className="flex min-w-0 items-center gap-2">
      <Avatar name={name} size="xs" aria-hidden />
      <span className="truncate text-muted-foreground">{name}</span>
    </span>
  )
}

const col = createDataTableColumns<Ticket>()
const columns = col.columns([
  col.accessor('id', {
    id: 'id',
    header: 'ID',
    meta: { width: 72 },
    cell: ({ getValue }) => <span className="tabular-nums">{formatTicketId(getValue())}</span>,
  }),
  col.accessor('subject', {
    id: 'subject',
    header: 'Subject',
    cell: ({ getValue }) => getValue(),
  }),
  col.accessor((r) => customerLabel(r.requester), {
    id: 'customer',
    header: 'Customer',
    meta: { width: 150 },
    cell: ({ getValue }) => <PersonText name={getValue()} />,
  }),
  col.accessor('status', {
    id: 'status',
    header: 'Status',
    meta: { width: 136 },
    cell: ({ getValue }) => (
      <span className="flex items-center gap-2 text-muted-foreground">
        <StatusGlyph status={getValue()} label={null} />
        {TICKET_STATUS_LABEL[getValue()]}
      </span>
    ),
  }),
  col.accessor('priority', {
    id: 'priority',
    header: 'Priority',
    meta: { width: 100 },
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
  col.accessor((r) => r.assignee?.name ?? '', {
    id: 'assignee',
    header: 'Assignee',
    meta: { width: 128 },
    cell: ({ row }) => <PersonText name={row.original.assignee?.name} />,
  }),
  col.accessor((r) => r.sla?.state ?? '', {
    id: 'sla',
    header: 'SLA',
    meta: { width: 150 },
    cell: ({ row }) => {
      const sla = row.original.sla
      if (!sla) return <span className="text-muted-foreground">—</span>
      return sla.state === 'on-track' ? (
        <span className="text-muted-foreground">{sla.label}</span>
      ) : (
        <SlaBadge state={sla.state}>{sla.label}</SlaBadge>
      )
    },
  }),
  col.accessor((r) => r.tags.join(', '), {
    id: 'labels',
    header: 'Labels',
    meta: { width: 140 },
    cell: ({ row }) => (
      <span className="flex gap-1">
        {row.original.tags.map((t) => (
          <Badge key={t} variant="outline">
            {t}
          </Badge>
        ))}
      </span>
    ),
  }),
  col.accessor('updatedAt', {
    id: 'updated',
    header: 'Updated',
    meta: { width: 88 },
    cell: ({ getValue }) => <span className="tabular-nums">{shortAgo(getValue())}</span>,
  }),
])

export interface TicketsTablePageProps {
  /** The app sidebar (route-aware in the app, mock in Storybook). */
  sidebar: ReactNode
  initialSelection?: RowSelectionState
  /** Row click — open the ticket. */
  onOpenTicket?: (id: number) => void
  onSaveView?: (view: SavedView) => void
  /** The workspace's tickets (defaults to the mock set). */
  tickets?: Ticket[]
  /** New ticket button (C opens it from anywhere in the app). */
  onNewTicket?: () => void
  /** Stories: open a control on load. */
  initialOpen?: 'filters' | 'display' | 'save'
}

/** Columns that are always shown; the rest follow Display → Properties. */
const FIXED = new Set(['subject', 'status'])

export function TicketsTablePage({
  sidebar,
  initialSelection = {},
  onOpenTicket,
  onSaveView,
  initialOpen,
  tickets = wsTickets,
  onNewTicket,
}: TicketsTablePageProps) {
  const view = useTicketView({
    tickets,
    layout: 'table',
    title: 'All tickets',
    initialDisplay: { props: ['id', 'customer', 'priority', 'assignee', 'updated'] },
    onSaveView,
    initialOpen,
  })
  const visibleColumns = useMemo(
    () =>
      columns.filter((c) => {
        const id = (c as { id?: string }).id ?? ''
        return FIXED.has(id) || view.display.props.includes(id as never)
      }),
    [view.display.props],
  )
  const [selection, setSelection] = useState<RowSelectionState>(initialSelection)
  const count = Object.values(selection).filter(Boolean).length
  const all = count === view.shown.length
  const table = useRef<HTMLDivElement>(null)

  // J / K move between rows (Enter opens the focused one), Esc clears the selection.
  const moveRow = (by: number) => {
    const rows = [...(table.current?.querySelectorAll<HTMLElement>('tbody tr[tabindex]') ?? [])]
    const at = rows.findIndex((r) => r === document.activeElement)
    rows[
      at === -1 ? (by > 0 ? 0 : rows.length - 1) : Math.min(rows.length - 1, Math.max(0, at + by))
    ]?.focus()
  }
  useHotkeys({
    j: () => moveRow(1),
    k: () => moveRow(-1),
    escape: () => setSelection({}),
  })

  return (
    <ListPageTemplate
      sidebar={sidebar}
      header={
        <PageHeader
          icon="inbox"
          title="All tickets"
          count={wsCounts.all}
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
        count > 0 ? (
          <BulkActionBar
            position="strip"
            count={count}
            onClear={() => setSelection({})}
            leading={
              <Checkbox
                aria-label={all ? 'Deselect all' : 'Select all'}
                checked={all ? true : 'indeterminate'}
                onCheckedChange={() =>
                  setSelection(
                    all ? {} : Object.fromEntries(view.shown.map((t) => [String(t.id), true])),
                  )
                }
                className="me-2"
              />
            }
            actions={
              <>
                <Button variant="ghost" size="sm">
                  Assign
                </Button>
                <Button variant="ghost" size="sm">
                  Change status
                </Button>
                <Button variant="ghost" size="sm">
                  Merge
                </Button>
                <Button variant="ghost" size="sm">
                  Close
                </Button>
              </>
            }
          />
        ) : undefined
      }
    >
      <div ref={table} className="contents">
        <DataTable
          appearance="flush"
          label="All tickets"
          itemLabel="tickets"
          columns={visibleColumns}
          data={view.shown}
          getRowId={(t) => String(t.id)}
          selectable
          rowSelection={selection}
          onRowSelectionChange={setSelection}
          pageSize={false}
          onRowClick={onOpenTicket && ((t) => onOpenTicket(t.id))}
        />
      </div>
      {view.saveDialog}
    </ListPageTemplate>
  )
}
