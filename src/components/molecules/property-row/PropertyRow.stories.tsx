import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Avatar, Badge, IconButton } from '@/components/atoms'
import { PriorityBadge } from '../priority-badge'
import { SlaBadge } from '../sla-badge'
import { TicketStatusBadge } from '../ticket-status-badge'
import { PropertyRow } from './PropertyRow'

const meta = {
  title: 'Molecules/PropertyRow',
  component: PropertyRow,
  args: { label: 'Team', children: 'Support Team Alpha' },
  decorators: [(Story) => <div className="w-80">{Story()}</div>],
} satisfies Meta<typeof PropertyRow>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** All seven value types — Figma 10 · Property row — as they stack in the ticket panel. */
export const TicketProperties: Story = {
  render: () => (
    <div className="flex flex-col rounded-xl border bg-card px-4 py-2">
      <PropertyRow label="Status">
        <TicketStatusBadge status="investigating" />
      </PropertyRow>
      <PropertyRow label="Priority">
        <PriorityBadge priority="medium" />
      </PropertyRow>
      <PropertyRow label="Assignee">
        <Avatar name="Nila P" size="sm" />
        Nila P.
      </PropertyRow>
      <PropertyRow label="Team">Support Team Alpha</PropertyRow>
      <PropertyRow label="Tags">
        <Badge variant="outline" size="sm">
          printer
        </Badge>
        <Badge variant="outline" size="sm">
          floor-3
        </Badge>
        <IconButton icon="plus" label="Add tag" size="sm" className="size-5" />
      </PropertyRow>
      <PropertyRow label="SLA">
        <SlaBadge state="on-track">1h 20m left</SlaBadge>
      </PropertyRow>
      <PropertyRow label="Due date" action={{ label: 'Set due date', onClick: fn() }} />
      <PropertyRow label="Source" />
    </div>
  ),
}
