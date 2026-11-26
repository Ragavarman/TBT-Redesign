import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, Radio, RadioGroup, Textarea } from '@/components/atoms'
import { FormField, Select, TicketStatusBadge } from '@/components/molecules'
import { agents, ticket, tickets } from '@/mocks'
import { Dialog, DialogClose } from './Dialog'

const meta = {
  title: 'Organisms/Dialog',
  component: Dialog,
  args: {
    title: 'Merge tickets',
    description: 'Combine duplicates into one ticket. Conversations are kept on the primary.',
    size: 'md',
    children: null,
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    trigger: { control: false },
    footer: { control: false },
    children: { control: false },
  },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

const duplicates = tickets.filter((t) => [4821, 4812, 4817].includes(t.id))

function MergeBody() {
  return (
    <RadioGroup
      defaultValue={String(duplicates[0]!.id)}
      aria-label="Primary ticket"
      className="gap-1"
    >
      {duplicates.map((t) => (
        <label
          key={t.id}
          className="flex cursor-pointer items-center gap-3 rounded-md border bg-card px-3 py-2.5 has-data-[state=checked]:border-primary"
        >
          <Radio value={String(t.id)} aria-label={`#${t.id}`} />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-body-strong">
              #{t.id} · {t.subject}
            </span>
            <span className="truncate text-small text-muted-foreground">
              {t.requester.name} · {t.messageCount} messages
            </span>
          </span>
          <TicketStatusBadge status={t.status} variant="pill" />
        </label>
      ))}
    </RadioGroup>
  )
}

const footer = (label: string) => (
  <>
    <DialogClose asChild>
      <Button variant="outline">Cancel</Button>
    </DialogClose>
    <Button>{label}</Button>
  </>
)

/** Figma 09 · Dialog — merge duplicates (open by default). */
export const MergeTickets: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <Dialog {...args} footer={footer('Merge')}>
      <MergeBody />
    </Dialog>
  ),
}

/** A form dialog wired to mock agents. */
export const ReassignTicket: Story = {
  args: {
    defaultOpen: true,
    size: 'sm',
    title: `Reassign #${ticket.id}`,
    description: ticket.subject,
  },
  render: (args) => {
    function Demo() {
      const [assignee, setAssignee] = useState(ticket.assignee?.id)
      return (
        <Dialog {...args} footer={footer('Reassign')}>
          <div className="flex flex-col gap-4">
            <FormField label="Assignee" required>
              <Select
                value={assignee}
                onValueChange={setAssignee}
                leadingIcon="user"
                options={agents.map((a) => ({ value: a.id, label: `${a.name} · ${a.team}` }))}
              />
            </FormField>
            <FormField label="Note for the new assignee" optional>
              <Textarea placeholder="Context, what’s been tried…" />
            </FormField>
          </div>
        </Dialog>
      )
    }
    return <Demo />
  },
}

/** Opened from a trigger button. */
export const WithTrigger: Story = {
  render: (args) => (
    <div className="p-8">
      <Dialog
        {...args}
        trigger={<Button leadingIcon="link">Merge tickets</Button>}
        footer={footer('Merge')}
      >
        <MergeBody />
      </Dialog>
    </div>
  ),
}

/** sm 400 · md 520 · lg 720 — Figma sizes. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex gap-2 p-8">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Dialog
          key={size}
          {...args}
          size={size}
          trigger={<Button variant="outline">{size}</Button>}
          footer={footer('Merge')}
        >
          <MergeBody />
        </Dialog>
      ))}
    </div>
  ),
}
