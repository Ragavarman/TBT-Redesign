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

/** Figma X1 · Status picker open (S). 1–6 pick a status; type to search. */
export const StatusPicker: Story = { args: { initialPicker: 'status' } }

/** Figma X2 · Assignee picker open (⇧A). A assigns the ticket to you without opening it. */
export const AssigneePicker: Story = { args: { initialPicker: 'assignee' } }

/** Figma X5 · Snooze menu open (H): presets, or a day and time. */
export const Snooze: Story = { args: { initialPicker: 'snooze' } }

/** Figma X6 · Email reply open (R) with the "/" canned-reply menu: ↑ ↓, Enter inserts. */
export const ReplyCannedMenu: Story = {
  args: { initialComposer: 'reply', initialComposerText: 'Hi Dennis,\n/print' },
}

/** The open reply, empty: To / Cc / Bcc, formatting, attach, Send or Send & set Waiting. */
export const Reply: Story = { args: { initialComposer: 'reply' } }

/** Figma X7 · Internal note (N) with the "@" mention menu. */
export const NoteMention: Story = {
  args: {
    initialComposer: 'note',
    initialComposerText: 'Can you check the firmware on this one @ar',
  },
}

/** More → Log a call. */
export const CallLog: Story = { args: { initialComposer: 'call' } }

/** Figma X8 · Resolve dialog (Resolve button or ⇧E; E resolves without it). */
export const Resolve: Story = { args: { initialResolve: true } }

/** Figma X9 · Closed, read-only: banner with Reopen, no composer until it's reopened (E). */
export const Closed: Story = {
  args: { ticket: wsTickets.find((t) => t.status === 'closed')! },
}

/** Resolved (not yet closed): banner, but replies are still allowed. */
export const Resolved: Story = {
  args: { ticket: wsTickets.find((t) => t.status === 'resolved')! },
}

/** Figma X10 · SLA breached: red banner with Escalate; replying clears it. */
export const SlaBreached: Story = {
  args: { ticket: wsTickets.find((t) => t.sla?.state === 'breached')! },
}

/** A ticket with only generated detail (no email, no files). */
export const SparseTicket: Story = { args: { ticket: wsTickets[3]!, initialTab: 'timeline' } }
