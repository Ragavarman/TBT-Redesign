import type { Meta, StoryObj } from '@storybook/react-vite'
import { wsCounts, wsTickets } from '@/mocks'
import { MockSidebar } from '@/stories/shell'
import { TicketDetailPage } from './TicketDetailPage'

const meta = {
  title: 'Pages/Tickets/Ticket detail',
  component: TicketDetailPage,
  parameters: { layout: 'fullscreen' },
  args: {
    sidebar: <MockSidebar active="all" collapsed />,
    viewLabel: 'All tickets',
    viewCount: wsCounts.all,
    tickets: wsTickets,
    ticket: wsTickets[0]!,
    onBack: () => {},
    onOpenTicket: () => {},
  },
  argTypes: {
    sidebar: { control: false },
    tickets: { control: false },
    ticket: { control: false },
  },
} satisfies Meta<typeof TicketDetailPage>

export default meta
type Story = StoryObj<typeof meta>

/** The thread: customer messages, agent replies and internal notes, by day. */
export const Conversation: Story = {}

/** Figma T1 · the email that opened the ticket, with its attachments. */
export const OriginalEmail: Story = { args: { initialTab: 'email' } }

/** Figma T2 · every file on the ticket. */
export const Attachments: Story = { args: { initialTab: 'attachments' } }

/** Figma T3 · the full timeline with filter chips. */
export const FullTimeline: Story = { args: { initialTab: 'timeline' } }

/** A ticket with only generated detail (no email, no files). */
export const SparseTicket: Story = { args: { ticket: wsTickets[3]!, initialTab: 'timeline' } }
