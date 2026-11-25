import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Avatar, Button, Checkbox, PriorityGlyph, StatusGlyph } from '@/components/atoms'
import {
  BulkActionBar,
  createDataTableColumns,
  DataTable,
  PageHeader,
  type RowSelectionState,
} from '@/components/organisms'
import { ListPageTemplate } from '@/components/templates'
import { customerLabel, shortAgo, wsCounts, wsTickets } from '@/mocks'
import { MockSidebar } from '@/stories/shell'
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
    header: 'ID',
    meta: { width: 80 },
    cell: ({ getValue }) => <span className="tabular-nums">{formatTicketId(getValue())}</span>,
  }),
  col.accessor('subject', {
    header: 'Subject',
    cell: ({ getValue }) => getValue(),
  }),
  col.accessor((r) => customerLabel(r.requester), {
    id: 'customer',
    header: 'Customer',
    meta: { width: 170 },
    cell: ({ getValue }) => <PersonText name={getValue()} />,
  }),
  col.accessor('status', {
    header: 'Status',
    meta: { width: 160 },
    cell: ({ getValue }) => (
      <span className="flex items-center gap-2 text-muted-foreground">
        <StatusGlyph status={getValue()} label={null} />
        {TICKET_STATUS_LABEL[getValue()]}
      </span>
    ),
  }),
  col.accessor('priority', {
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
  col.accessor((r) => r.assignee?.name ?? '', {
    id: 'assignee',
    header: 'Assignee',
    meta: { width: 150 },
    cell: ({ row }) => <PersonText name={row.original.assignee?.name} />,
  }),
  col.accessor('updatedAt', {
    header: 'Updated',
    meta: { width: 90 },
    cell: ({ getValue }) => <span className="tabular-nums">{shortAgo(getValue())}</span>,
  }),
])

const header = (
  <PageHeader
    icon="inbox"
    title="All tickets"
    count={wsCounts.all}
    actions={
      <>
        <Button variant="ghost" leadingIcon="filter" shortcut="F">
          Filters
        </Button>
        <Button variant="ghost" leadingIcon="display" shortcut="V">
          Display
        </Button>
        <Button leadingIcon="plus">New ticket</Button>
      </>
    }
  />
)

function TableViewPage({ initialSelection = {} }: { initialSelection?: RowSelectionState }) {
  const [selection, setSelection] = useState<RowSelectionState>(initialSelection)
  const count = Object.values(selection).filter(Boolean).length
  const all = count === wsTickets.length
  return (
    <ListPageTemplate
      sidebar={<MockSidebar active="all" />}
      header={header}
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
                    all ? {} : Object.fromEntries(wsTickets.map((t) => [String(t.id), true])),
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
      <DataTable
        appearance="flush"
        label="All tickets"
        itemLabel="tickets"
        columns={columns}
        data={wsTickets}
        getRowId={(t) => String(t.id)}
        selectable
        rowSelection={selection}
        onRowSelectionChange={setSelection}
        pageSize={false}
        onRowClick={() => {}}
      />
    </ListPageTemplate>
  )
}

const meta = {
  title: 'Pages/Tickets/Table view',
  component: TableViewPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof TableViewPage>

export default meta
type Story = StoryObj<typeof meta>

/** As in Figma: three rows selected, so the bulk-action strip is showing. */
export const ThreeSelected: Story = {
  args: { initialSelection: { '222': true, '221': true, '220': true } },
}

/** Nothing selected — the strip hides and the table moves up under the header. */
export const Default: Story = {}
