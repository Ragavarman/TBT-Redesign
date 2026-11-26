import type { Meta, StoryObj } from '@storybook/react-vite'
import { TicketStatusBadge } from '../ticket-status-badge'
import { TimelineEvent } from './TimelineEvent'

const meta = {
  title: 'Molecules/TimelineEvent',
  component: TimelineEvent,
  args: {
    type: 'comment',
    actor: 'Tharsan L.',
    action: 'replied',
    time: '2h ago',
    timeTitle: '2026-11-25T09:14',
    children: 'I restarted the print spooler and the queue is moving again.',
    last: true,
  },
  argTypes: {
    type: { control: 'inline-radio', options: ['comment', 'status', 'assignment', 'system'] },
  },
  decorators: [
    (Story) => (
      <ol className="w-[26rem]">
        <Story />
      </ol>
    ),
  ],
} satisfies Meta<typeof TimelineEvent>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** The four event types — Figma 10 · Timeline event — as a ticket activity feed. */
export const ActivityFeed: Story = {
  render: () => (
    <>
      <TimelineEvent
        type="comment"
        actor="Tharsan L."
        action="replied"
        time="2h ago"
        timeTitle="2026-11-25T09:14"
      >
        I restarted the print spooler and the queue is moving again.
      </TimelineEvent>
      <TimelineEvent
        type="status"
        actor="Tharsan L."
        action="changed status to"
        target={<TicketStatusBadge status="investigating" />}
        time="2h ago"
      />
      <TimelineEvent
        type="assignment"
        actor="Tharsan L."
        action="assigned to"
        target="Nila P."
        time="3h ago"
      />
      <TimelineEvent type="system" action="SLA timer started" time="3h ago" last />
    </>
  ),
}
