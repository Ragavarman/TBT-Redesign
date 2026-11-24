import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Badge, Button } from '@/components/atoms'
import {
  ConditionBadge,
  DropdownMenuItem,
  DropdownMenuSeparator,
  EmptyState,
  PriorityBadge,
  SlaBadge,
  TicketStatusBadge,
} from '@/components/molecules'
import { ago, assets, customers, tickets } from '@/mocks'
import type { Asset, Customer, Ticket } from '@/types'
import { MutedCell, PersonCell, TwoLineCell } from './cells'
import type { RowSelectionState } from '@tanstack/react-table'
import { DataTable } from './DataTable'
import { createDataTableColumns } from './features'

// ── Tickets (Figma 08 · Table in context) ───────────────────────────────────
const t = createDataTableColumns<Ticket>()
const ticketColumns = t.columns([
  t.accessor('subject', {
    header: 'Subject',
    cell: ({ row }) => (
      <TwoLineCell
        primary={
          <span className={row.original.unread ? 'text-body-strong' : undefined}>
            {row.original.subject}
          </span>
        }
        secondary={`#${row.original.id} · ${row.original.requester.name}`}
      />
    ),
  }),
  t.accessor((r) => r.assignee?.name ?? '', {
    id: 'assignee',
    header: 'Assignee',
    meta: { width: 160 },
    cell: ({ row }) => <PersonCell name={row.original.assignee?.name} />,
  }),
  t.accessor('status', {
    header: 'Status',
    meta: { width: 140 },
    cell: ({ getValue }) => <TicketStatusBadge status={getValue()} />,
  }),
  t.accessor('priority', {
    header: 'Priority',
    meta: { width: 110 },
    sortFn: (a, b) =>
      ['low', 'medium', 'high', 'urgent'].indexOf(a.original.priority) -
      ['low', 'medium', 'high', 'urgent'].indexOf(b.original.priority),
    cell: ({ getValue }) => <PriorityBadge priority={getValue()} />,
  }),
  t.accessor('channel', {
    header: 'Channel',
    meta: { width: 100 },
    cell: ({ getValue }) => (
      <Badge variant="outline" size="sm" className="capitalize">
        {getValue()}
      </Badge>
    ),
  }),
  t.display({
    id: 'sla',
    header: 'SLA',
    meta: { width: 172 },
    cell: ({ row }) =>
      row.original.sla ? (
        <SlaBadge state={row.original.sla.state}>{row.original.sla.label}</SlaBadge>
      ) : (
        <MutedCell>—</MutedCell>
      ),
  }),
  t.accessor('updatedAt', {
    header: 'Updated',
    meta: { width: 100, align: 'right' },
    cell: ({ getValue }) => <MutedCell>{ago(getValue())}</MutedCell>,
  }),
])

const ticketActions = () => (
  <>
    <DropdownMenuItem icon="user" shortcut="I">
      Assign to me
    </DropdownMenuItem>
    <DropdownMenuItem icon="clock" shortcut="H">
      Snooze
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem icon="trash" destructive>
      Delete ticket
    </DropdownMenuItem>
  </>
)

const meta = {
  title: 'Organisms/DataTable',
  component: DataTable<Ticket>,
  parameters: { layout: 'padded' },
  args: {
    label: 'Tickets',
    columns: ticketColumns,
    data: tickets,
    getRowId: (r: Ticket) => String(r.id),
    itemLabel: 'tickets',
  },
  argTypes: {
    columns: { control: false },
    data: { control: false },
    getRowId: { control: false },
    empty: { control: false },
  },
} satisfies Meta<typeof DataTable<Ticket>>

export default meta
type Story = StoryObj<typeof meta>

/** Inbox table: sortable columns, selection (Shift+click for ranges), row menu, paging. */
export const Tickets: Story = {
  args: { selectable: true, pageSize: 5, initialSorting: [{ id: 'updatedAt', desc: true }] },
  render: (args) => {
    function Demo() {
      const [selection, setSelection] = useState<RowSelectionState>({})
      const count = Object.keys(selection).length
      return (
        <div className="flex flex-col gap-3">
          <p className="text-small text-muted-foreground" aria-live="polite">
            {count ? `${count} selected` : 'Select rows with the checkboxes · click a row to open'}
          </p>
          <DataTable
            {...args}
            rowSelection={selection}
            onRowSelectionChange={setSelection}
            rowActions={ticketActions}
            onRowClick={fn()}
          />
        </div>
      )
    }
    return <Demo />
  },
}

export const Loading: Story = { args: { loading: true, selectable: true, pageSize: 5 } }

export const Empty: Story = {
  args: {
    data: [],
    selectable: true,
    empty: (
      <EmptyState
        type="empty"
        title="No tickets yet"
        description="New conversations from email, chat and the portal land here."
        action={
          <Button size="sm" leadingIcon="plus">
            New ticket
          </Button>
        }
      />
    ),
  },
}

// ── Customers ───────────────────────────────────────────────────────────────
const c = createDataTableColumns<Customer>()
const customerColumns = c.columns([
  c.accessor('name', {
    header: 'Name',
    cell: ({ row }) => <PersonCell name={row.original.name} avatarUrl={row.original.avatarUrl} />,
  }),
  c.accessor('organization', { header: 'Organization', meta: { width: 180 } }),
  c.accessor('email', {
    header: 'Email',
    cell: ({ getValue }) => <MutedCell>{getValue()}</MutedCell>,
  }),
  c.accessor('openTickets', { header: 'Open', meta: { width: 90, align: 'right' } }),
  c.accessor((r) => (r.vip ? 1 : 0), {
    id: 'vip',
    header: 'Tier',
    meta: { width: 90 },
    cell: ({ row }) =>
      row.original.vip ? (
        <Badge variant="warning" size="sm">
          VIP
        </Badge>
      ) : (
        <MutedCell>Standard</MutedCell>
      ),
  }),
])

/** Same organism, a different dataset. */
export const Customers: StoryObj<typeof DataTable<Customer>> = {
  render: () => (
    <DataTable
      label="Customers"
      columns={customerColumns}
      data={customers}
      getRowId={(r) => r.id}
      itemLabel="customers"
      initialSorting={[{ id: 'openTickets', desc: true }]}
    />
  ),
}

// ── Inventory ───────────────────────────────────────────────────────────────
const a = createDataTableColumns<Asset>()
const assetColumns = a.columns([
  a.accessor('name', {
    header: 'Asset',
    cell: ({ row }) => (
      <TwoLineCell
        primary={row.original.name}
        secondary={`${row.original.model} · ${row.original.serial}`}
      />
    ),
  }),
  a.accessor('condition', {
    header: 'Condition',
    meta: { width: 150 },
    cell: ({ getValue }) => <ConditionBadge condition={getValue()} />,
  }),
  a.accessor('location', { header: 'Location', meta: { width: 160 } }),
  a.accessor((r) => r.assignedTo?.name ?? '', {
    id: 'assignedTo',
    header: 'Assigned to',
    meta: { width: 180 },
    cell: ({ row }) => <PersonCell name={row.original.assignedTo?.name} />,
  }),
])

export const Inventory: StoryObj<typeof DataTable<Asset>> = {
  render: () => (
    <DataTable
      label="Inventory"
      columns={assetColumns}
      data={assets}
      getRowId={(r) => r.id}
      selectable
      pageSize={false}
    />
  ),
}
