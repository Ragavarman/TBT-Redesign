import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, IconButton, StatusGlyph } from '@/components/atoms'
import { MeterRow } from '../meter-row'
import { Card } from './Card'

const meta = {
  title: 'Molecules/Card',
  component: Card,
  args: {
    title: 'Card title',
    description: 'Short description',
    action: <IconButton icon="dots" label="Card actions" size="sm" />,
    children: (
      <div className="flex h-24 items-center justify-center rounded-md border bg-muted text-small text-muted-foreground">
        Content
      </div>
    ),
  },
  argTypes: {
    action: { control: false },
    children: { control: false },
    footer: { control: false },
  },
  decorators: [(Story) => <div className="w-90">{Story()}</div>],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

/** Figma 08 · Card variant=default. */
export const Default: Story = {}

/** Figma 08 · Card variant=with-footer. */
export const WithFooter: Story = {
  args: {
    footer: (
      <>
        <Button variant="outline" size="sm">
          Cancel
        </Button>
        <Button size="sm">Save</Button>
      </>
    ),
  },
}

/** A real card: tickets by status. */
export const TicketsByStatus: Story = {
  args: {
    title: 'Tickets by status',
    description: 'Last 7 days',
    children: (
      <div className="flex flex-col gap-2.5">
        <MeterRow
          glyph={<StatusGlyph status="open" label={null} />}
          label="Open"
          value={42}
          max={60}
          tone="info"
        />
        <MeterRow
          glyph={<StatusGlyph status="investigating" label={null} />}
          label="Investigating"
          value={18}
          max={60}
          tone="warning"
        />
        <MeterRow
          glyph={<StatusGlyph status="waiting" label={null} />}
          label="Waiting"
          value={11}
          max={60}
        />
        <MeterRow
          glyph={<StatusGlyph status="resolved" label={null} />}
          label="Resolved"
          value={60}
          max={60}
          tone="success"
        />
      </div>
    ),
  },
}
