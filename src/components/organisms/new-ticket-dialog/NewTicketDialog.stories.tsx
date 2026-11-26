import { useState, type ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '@/components/atoms'
import { wsAgents, wsCurrentAgent, wsCustomers } from '@/mocks'
import { NewTicketDialog } from './NewTicketDialog'

const customers = Object.values(wsCustomers).map((c) => ({
  id: c.id,
  name: c.organization ? `${c.name} · ${c.organization}` : c.name,
  detail: c.phone ?? c.email,
}))

const meta = {
  title: 'Organisms/NewTicketDialog',
  component: NewTicketDialog,
  parameters: { layout: 'centered' },
  args: {
    open: true,
    onOpenChange: () => {},
    customers,
    agents: Object.values(wsAgents),
    meId: wsCurrentAgent.id,
    teams: ['Support Team Alpha', 'Technical Team Beta', 'Sales Team Gamma'],
    applications: ['Customer Portal', 'POS', 'Inventory', 'Payments'],
    labels: ['Voicemail', 'Hardware', 'Billing', 'Payments', 'Access'],
    onCreate: () => {},
  },
  argTypes: {
    customers: { control: false },
    agents: { control: false },
  },
} satisfies Meta<typeof NewTicketDialog>

export default meta
type Story = StoryObj<typeof meta>

/** Figma T7 · New ticket: customer + channel, subject, description, property chips. */
export const Default: Story = {}

/** Opened from a call — the caller is already picked. */
export const FromCall: Story = { args: { defaultCustomerId: wsCustomers.dennis.id } }

/** Working: opens from a button; "Create another" keeps it open and clears the form. */
export const Interactive: Story = {
  args: { open: false },
  render: (args) => <InteractiveDemo {...args} />,
}

function InteractiveDemo(args: ComponentProps<typeof NewTicketDialog>) {
  const [open, setOpen] = useState(false)
  const [made, setMade] = useState<string[]>([])
  return (
    <div className="flex flex-col items-center gap-3">
      <Button leadingIcon="plus" shortcut="C" onClick={() => setOpen(true)}>
        New ticket
      </Button>
      {made.length > 0 && (
        <p className="text-small text-muted-foreground">Created: {made.join(', ')}</p>
      )}
      <NewTicketDialog
        {...args}
        open={open}
        onOpenChange={setOpen}
        onCreate={(t) => setMade((m) => [...m, t.subject])}
      />
    </div>
  )
}
