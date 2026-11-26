import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, Checkbox } from '@/components/atoms'
import { FormField } from '../form-field'
import { Select } from '../select'
import { Popover } from './Popover'

const meta = {
  title: 'Molecules/Popover',
  component: Popover,
  args: {
    title: 'Filter tickets',
    trigger: (
      <Button variant="outline" leadingIcon="filter">
        Filters
      </Button>
    ),
    children: null,
  },
  argTypes: {
    trigger: { control: false },
    children: { control: false },
    footer: { control: false },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

/** Figma 09 · Popover — header with close, body, footer with Reset + Apply. */
export const FilterTickets: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <div className="h-80">
      <Popover
        {...args}
        footer={
          <>
            <Button variant="ghost" size="sm">
              Reset
            </Button>
            <Button size="sm">Apply</Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <FormField label="Status">
            <Select
              placeholder="Any status"
              options={[
                { value: 'open', label: 'Open' },
                { value: 'waiting', label: 'Waiting' },
              ]}
            />
          </FormField>
          <Checkbox label="Only unassigned" />
          <Checkbox label="Breaching SLA" defaultChecked />
        </div>
      </Popover>
    </div>
  ),
}

export const Bare: Story = {
  args: { title: undefined, defaultOpen: true, className: 'w-56' },
  render: (args) => (
    <div className="h-40">
      <Popover {...args}>
        <p className="text-small text-muted-foreground">
          A bare panel — no header or footer. Press Esc to close.
        </p>
      </Popover>
    </div>
  ),
}
