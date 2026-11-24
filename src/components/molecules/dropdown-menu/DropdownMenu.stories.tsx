import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { IconButton } from '@/components/atoms'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './DropdownMenu'

const meta = {
  title: 'Molecules/DropdownMenu',
  component: DropdownMenu,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DropdownMenu>

export default meta
type Story = StoryObj<typeof meta>

/** Figma 07 · Menu content — ticket actions: label, items with shortcuts, submenu, separator, destructive. */
export const TicketActions: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <div className="h-64">
      <DropdownMenu {...args}>
        <DropdownMenuTrigger asChild>
          <IconButton icon="dots" label="Ticket actions" variant="outline" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Ticket</DropdownMenuLabel>
          <DropdownMenuItem icon="user" shortcut="I">
            Assign to me
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger icon="layers">Change status</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Open</DropdownMenuItem>
              <DropdownMenuItem>Waiting</DropdownMenuItem>
              <DropdownMenuItem>Resolved</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem icon="clock" shortcut="H">
            Snooze
          </DropdownMenuItem>
          <DropdownMenuItem icon="link" disabled>
            Merge (no duplicates)
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem icon="trash" destructive>
            Delete ticket
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
}

/** Figma type=checkbox — toggle rows, e.g. visible columns. */
export const CheckboxItems: Story = {
  args: { defaultOpen: true },
  render: (args) => {
    function Demo() {
      const [cols, setCols] = useState({ status: true, priority: true, sla: false })
      const toggle = (k: keyof typeof cols) => (v: boolean) => setCols((c) => ({ ...c, [k]: v }))
      return (
        <div className="h-48">
          <DropdownMenu {...args}>
            <DropdownMenuTrigger asChild>
              <IconButton icon="display" label="Display options" variant="outline" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Columns</DropdownMenuLabel>
              <DropdownMenuCheckboxItem checked={cols.status} onCheckedChange={toggle('status')}>
                Status
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={cols.priority}
                onCheckedChange={toggle('priority')}
              >
                Priority
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={cols.sla} onCheckedChange={toggle('sla')}>
                SLA
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
    return <Demo />
  },
}
