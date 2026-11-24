import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, Input, Switch, Textarea } from '@/components/atoms'
import { Select } from '../select'
import { FormField } from './FormField'

const meta = {
  title: 'Molecules/FormField',
  component: FormField,
  args: {
    label: 'Label',
    helper: 'Helper text',
    required: false,
    optional: false,
    disabled: false,
    children: <Input placeholder="Placeholder" />,
  },
  argTypes: { children: { control: false }, error: { control: 'text' } },
} satisfies Meta<typeof FormField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  decorators: [(Story) => <div className="w-72">{Story()}</div>],
}

/** state — same as Figma 06 · Field (default / error / disabled). */
export const States: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-8">
      <div className="w-60">
        <FormField label="Label" helper="Helper text">
          <Input placeholder="Placeholder" />
        </FormField>
      </div>
      <div className="w-60">
        <FormField label="Label" error="Helper text">
          <Input defaultValue="Placeholder" />
        </FormField>
      </div>
      <div className="w-60">
        <FormField label="Label" helper="Helper text" disabled>
          <Input placeholder="Placeholder" />
        </FormField>
      </div>
    </div>
  ),
}

export const WithOtherControls: Story = {
  decorators: [(Story) => <div className="w-72">{Story()}</div>],
  render: () => (
    <div className="flex flex-col gap-4">
      <FormField label="Status" helper="Customers see this on the portal.">
        <Select
          options={[
            { value: 'open', label: 'Open' },
            { value: 'waiting', label: 'Waiting' },
            { value: 'resolved', label: 'Resolved' },
          ]}
        />
      </FormField>
      <FormField label="Internal note" optional>
        <Textarea placeholder="Add a note…" />
      </FormField>
    </div>
  ),
}

/** Figma 06 · In context — settings form, fields stacked with 16px gap, actions right-aligned. */
export const InContext: Story = {
  render: () => (
    <form className="flex w-96 flex-col gap-4 rounded-xl border bg-card p-5">
      <h3 className="text-heading-2">New customer</h3>
      <FormField label="Name" required helper="As it should appear on tickets.">
        <Input placeholder="Dana Whitfield" />
      </FormField>
      <FormField label="Email" required error="Enter a valid email address.">
        <Input type="email" defaultValue="dana@" />
      </FormField>
      <FormField label="Plan" optional>
        <Select
          placeholder="Choose a plan"
          options={[
            { value: 'starter', label: 'Starter' },
            { value: 'team', label: 'Team' },
            { value: 'enterprise', label: 'Enterprise' },
          ]}
        />
      </FormField>
      <Switch label="Send welcome email" defaultChecked />
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="outline" type="button">
          Cancel
        </Button>
        <Button type="submit">Create customer</Button>
      </div>
    </form>
  ),
}
