import type { Meta, StoryObj } from '@storybook/react-vite'
import { wsCurrentAgent, wsTickets } from '@/mocks'
import { MockSidebar } from '@/stories/shell'
import type { FilterCondition } from './ticket-view'
import { TicketsListPage } from './TicketsListPage'

const mine = wsTickets.filter(
  (t) => t.assignee?.id === wsCurrentAgent.id || t.sla?.state === 'breached',
)

/** Figma X3: Status is Open, Investigating · SLA is At risk, Breached. */
const figmaFilters: FilterCondition[] = [
  { id: 's1', field: 'status', op: 'any', values: ['open', 'investigating'] },
  { id: 's2', field: 'sla', op: 'any', values: ['at-risk', 'breached'] },
]

const meta = {
  title: 'Pages/Tickets/List view',
  component: TicketsListPage,
  parameters: { layout: 'fullscreen' },
  args: {
    sidebar: <MockSidebar active="my-tickets" />,
    title: 'My tickets',
    tickets: mine,
    onOpenTicket: () => {},
    onSaveView: () => {},
  },
  argTypes: { sidebar: { control: false }, tickets: { control: false } },
} satisfies Meta<typeof TicketsListPage>

export default meta
type Story = StoryObj<typeof meta>

/** Grouped by status, Breached SLA pinned first. J / K move, Enter opens. */
export const MyTickets: Story = {}

/** Figma X3 · Filter builder open (F) with two conditions and the live match count. */
export const FilterBuilder: Story = {
  args: { initialFilters: figmaFilters, initialOpen: 'filters' },
}

/** Figma X4 · Display options open (V): grouping, ordering, density, row properties. */
export const DisplayOptions: Story = { args: { initialOpen: 'display' } }

/** Figma T6 · Save view dialog for the current filters. */
export const SaveView: Story = {
  args: { initialFilters: figmaFilters, initialOpen: 'save' },
}

/** Compact rows, grouped by priority, labels shown. */
export const CompactByPriority: Story = {
  args: {
    initialDisplay: {
      grouping: 'priority',
      density: 'compact',
      props: ['id', 'customer', 'labels', 'sla', 'assignee', 'updated'],
    },
  },
}

/** Figma X27 · inbox zero: nothing open, so offer the unassigned queue and all statuses. */
export const InboxZero: Story = {
  args: {
    tickets: wsTickets.filter((t) => t.status === 'resolved' || t.status === 'closed'),
    caughtUpAction: { label: 'View unassigned (8)', onClick: () => {} },
  },
}

/** Filters that match nothing. */
export const NoMatches: Story = {
  args: {
    initialFilters: [
      { id: 'n1', field: 'channel', op: 'any', values: ['portal'] },
      { id: 'n2', field: 'priority', op: 'any', values: ['low'] },
    ],
  },
}
