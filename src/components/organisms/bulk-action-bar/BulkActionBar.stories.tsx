import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Button } from '@/components/atoms'
import { PriorityBadge, TicketStatusBadge, Toaster, toast } from '@/components/molecules'
import { ago, tickets as allTickets } from '@/mocks'
import type { Ticket } from '@/types'
import { ConfirmationModal } from '../confirmation-modal'
import {
  createDataTableColumns,
  DataTable,
  PersonCell,
  type RowSelectionState,
} from '../data-table'
import { BulkActionBar } from './BulkActionBar'

const actions = (
  <>
    <Button variant="ghost" size="sm" leadingIcon="user">
      Assign
    </Button>
    <Button variant="ghost" size="sm" leadingIcon="layers">
      Status
    </Button>
    <Button variant="ghost" size="sm" leadingIcon="check">
      Close
    </Button>
    <Button variant="destructive" size="sm" leadingIcon="trash">
      Delete
    </Button>
  </>
)

const meta = {
  title: 'Organisms/BulkActionBar',
  component: BulkActionBar,
  args: { count: 3, actions, onClear: fn(), position: 'inline' },
  argTypes: {
    actions: { control: false },
    position: { control: 'inline-radio', options: ['floating', 'inline'] },
  },
} satisfies Meta<typeof BulkActionBar>

export default meta
type Story = StoryObj<typeof meta>

/** Figma 10 · Bulk action bar. */
export const Default: Story = {}

const col = createDataTableColumns<Ticket>()
const columns = col.columns([
  col.accessor('subject', { header: 'Subject' }),
  col.accessor((r) => r.assignee?.name ?? '', {
    id: 'assignee',
    header: 'Assignee',
    meta: { width: 150 },
    cell: ({ row }) => <PersonCell name={row.original.assignee?.name} />,
  }),
  col.accessor('status', {
    header: 'Status',
    meta: { width: 140 },
    cell: ({ getValue }) => <TicketStatusBadge status={getValue()} />,
  }),
  col.accessor('priority', {
    header: 'Priority',
    meta: { width: 110 },
    cell: ({ getValue }) => <PriorityBadge priority={getValue()} />,
  }),
  col.accessor('updatedAt', {
    header: 'Updated',
    meta: { width: 100, align: 'right' },
    cell: ({ getValue }) => (
      <span className="text-small text-muted-foreground">{ago(getValue())}</span>
    ),
  }),
])

/**
 * In context: select tickets in the table → the floating bar appears. Close and Delete
 * act on the mock data (Delete asks first), with a toast to confirm.
 */
export const WithDataTable: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    function Demo() {
      const [data, setData] = useState(allTickets)
      // start with three tickets selected so the bar is visible
      const [selection, setSelection] = useState<RowSelectionState>({
        '4821': true,
        '4820': true,
        '4812': true,
      })
      const ids = Object.keys(selection)
      const clear = () => setSelection({})
      const closeSelected = () => {
        setData((d) => d.map((t) => (ids.includes(String(t.id)) ? { ...t, status: 'closed' } : t)))
        toast.success(`${ids.length} tickets closed`)
        clear()
      }
      const deleteSelected = () =>
        new Promise<void>((resolve) =>
          setTimeout(() => {
            setData((d) => d.filter((t) => !ids.includes(String(t.id))))
            toast.success(`${ids.length} tickets deleted`)
            clear()
            resolve()
          }, 800),
        )

      return (
        <div className="min-h-[40rem] p-6">
          <Toaster />
          <DataTable
            label="Tickets"
            columns={columns}
            data={data}
            getRowId={(r) => String(r.id)}
            selectable
            rowSelection={selection}
            onRowSelectionChange={setSelection}
            itemLabel="tickets"
          />
          <BulkActionBar
            count={ids.length}
            onClear={clear}
            actions={
              <>
                <Button variant="ghost" size="sm" leadingIcon="user">
                  Assign
                </Button>
                <Button variant="ghost" size="sm" leadingIcon="layers">
                  Status
                </Button>
                <Button variant="ghost" size="sm" leadingIcon="check" onClick={closeSelected}>
                  Close
                </Button>
                <ConfirmationModal
                  variant="destructive"
                  title={`Delete ${ids.length} tickets?`}
                  description="This permanently removes the tickets and their conversation history. This can’t be undone."
                  confirmLabel="Delete"
                  onConfirm={deleteSelected}
                  trigger={
                    <Button variant="destructive" size="sm" leadingIcon="trash">
                      Delete
                    </Button>
                  }
                />
              </>
            }
          />
        </div>
      )
    }
    return <Demo />
  },
}
