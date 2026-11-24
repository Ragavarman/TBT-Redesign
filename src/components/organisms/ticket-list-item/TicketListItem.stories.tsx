import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ago, ticket, tickets } from '@/mocks'
import { TicketRow } from '../ticket-row'
import { TicketListItem } from './TicketListItem'

/** "2h ago" → "2h" — list rows use the short form. */
const short = (iso: string) => ago(iso).replace(' ago', '')

const meta = {
  title: 'Organisms/TicketListItem',
  component: TicketListItem,
  args: { ticket, timeLabel: short(ticket.updatedAt), selected: false, showPreview: true },
  argTypes: { ticket: { control: false } },
  decorators: [(Story) => <div className="w-95 border-x border-t">{Story()}</div>],
} satisfies Meta<typeof TicketListItem>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** default / hover / selected / unread — Figma 10 · Ticket list item. */
export const States: Story = {
  parameters: { pseudo: { hover: ['.state-hover button'] } },
  render: () => {
    const read = tickets.find((t) => !t.unread)!
    const unread = tickets.find((t) => t.unread)!
    return (
      <>
        <div>
          <TicketListItem ticket={read} timeLabel={short(read.updatedAt)} />
        </div>
        <div className="state-hover">
          <TicketListItem ticket={read} timeLabel={short(read.updatedAt)} />
        </div>
        <TicketListItem ticket={read} timeLabel={short(read.updatedAt)} selected />
        <TicketListItem ticket={unread} timeLabel={short(unread.updatedAt)} />
      </>
    )
  },
}

/** The inbox list — click to open a ticket. */
export const InboxList: Story = {
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(tickets[0]!.id)
      return (
        <div role="list" aria-label="Tickets" className="h-[36rem] overflow-y-auto">
          {[...tickets]
            .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
            .map((t) => (
              <div role="listitem" key={t.id}>
                <TicketListItem
                  ticket={t}
                  timeLabel={short(t.updatedAt)}
                  selected={t.id === open}
                  onClick={() => setOpen(t.id)}
                />
              </div>
            ))}
        </div>
      )
    }
    return <Demo />
  },
}

/** Figma 10 · Ticket row — the dense alternative for wide screens. */
export const DenseRows: StoryObj<typeof TicketRow> = {
  decorators: [(Story) => <div className="w-[67.5rem] border-x border-t">{Story()}</div>],
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(tickets[2]!.id)
      return (
        <>
          {tickets.map((t) => (
            <TicketRow
              key={t.id}
              ticket={t}
              timeLabel={short(t.updatedAt)}
              selected={t.id === open}
              onClick={() => setOpen(t.id)}
            />
          ))}
        </>
      )
    }
    return <Demo />
  },
}
