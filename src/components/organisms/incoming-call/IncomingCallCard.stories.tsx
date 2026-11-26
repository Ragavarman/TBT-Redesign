import type { Meta, StoryObj } from '@storybook/react-vite'
import { IncomingCallCard } from './IncomingCallCard'

const meta = {
  title: 'Organisms/IncomingCallCard',
  component: IncomingCallCard,
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <div className="h-dvh bg-background">{Story()}</div>],
  args: {
    caller: { name: 'Dennis Davenport', phone: '(909) 802-3652' },
    tags: ['VIP', 'Frequent caller'],
    source: 'RingCentral · main line',
    openTickets: [
      {
        id: 221,
        label: 'T-221',
        subject: 'Voice message from (909) 802-3652',
        status: 'investigating',
      },
      { id: 220, label: 'T-220', subject: 'Call from (909) 802-3652', status: 'open' },
    ],
    startedSeconds: 7,
    onOpenTicket: () => {},
    onNewTicket: () => {},
    onDismiss: () => {},
  },
} satisfies Meta<typeof IncomingCallCard>

export default meta
type Story = StoryObj<typeof meta>

/** Figma X11 · a known caller with open tickets: Open T-221 · New ticket · Dismiss. */
export const KnownCaller: Story = {}

/** A first-time caller: no tickets, so New ticket is the main action. */
export const NewCaller: Story = {
  args: {
    caller: { name: '(626) 446-5263', phone: 'Unknown caller' },
    tags: [],
    openTickets: [],
  },
}
