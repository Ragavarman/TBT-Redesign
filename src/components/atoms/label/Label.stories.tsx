import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../button'
import { HelperText } from '../helper-text'
import { Input } from '../input'
import { Switch } from '../switch'
import { Label } from './Label'

const meta = {
  title: 'Atoms/Label',
  component: Label,
  args: { children: 'Label', required: false, optional: false },
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Markers: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Label>Label</Label>
      <Label required>Email</Label>
      <Label optional>Phone</Label>
    </div>
  ),
}

/**
 * Figma 06 · In context — a settings form, fields stacked with 16px gap, actions right-aligned.
 * (The composed `FormField` molecule arrives in Step 4.)
 */
export const InContext: Story = {
  render: () => (
    <form className="flex w-96 flex-col gap-4 rounded-xl border bg-card p-5">
      <h3 className="text-heading-2">New customer</h3>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name" required>
          Name
        </Label>
        <Input id="name" placeholder="Dana Whitfield" required aria-describedby="name-help" />
        <HelperText id="name-help">As it should appear on tickets.</HelperText>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email" required>
          Email
        </Label>
        <Input
          id="email"
          type="email"
          defaultValue="dana@"
          invalid
          required
          aria-describedby="email-error"
        />
        <HelperText id="email-error" tone="error">
          Enter a valid email address.
        </HelperText>
      </div>
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
