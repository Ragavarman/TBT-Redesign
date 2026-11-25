import type { Meta, StoryObj } from '@storybook/react-vite'
import { Input, Switch, Textarea } from '@/components/atoms'
import { FormField, Select } from '@/components/molecules'
import { SettingsSection } from './SettingsSection'

const meta = {
  title: 'Organisms/SettingsSection',
  component: SettingsSection,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div className="max-w-190">{Story()}</div>],
  argTypes: { children: { control: false }, action: { control: false } },
} satisfies Meta<typeof SettingsSection>

export default meta
type Story = StoryObj<typeof meta>

/** Two columns of fields (Figma Settings · Preferences). */
export const TwoColumns: Story = {
  args: {
    title: 'Preferences',
    children: (
      <>
        <FormField label="Language">
          <Select
            value="en"
            options={[
              { value: 'en', label: 'English' },
              { value: 'ta', label: 'Tamil' },
              { value: 'si', label: 'Sinhala' },
            ]}
          />
        </FormField>
        <FormField label="Time zone">
          <Select
            value="colombo"
            options={[{ value: 'colombo', label: '(GMT+5:30) Colombo' }]}
          />
        </FormField>
        <FormField label="Display name" helper="Shown in replies to customers">
          <Input defaultValue="Tharsi" />
        </FormField>
        <FormField label="Email">
          <Input type="email" defaultValue="tharsi@tbt.example" />
        </FormField>
      </>
    ),
  },
}

/** One column with a description (Figma Settings · Email signature). */
export const OneColumn: Story = {
  args: {
    title: 'Email signature',
    description: 'Added to the end of email replies.',
    columns: 1,
    children: (
      <FormField label="Signature">
        <Textarea defaultValue={'Tharsi\nTBT Support · +94 11 234 5678'} rows={2} />
      </FormField>
    ),
  },
}

/** A group-level switch in the header. */
export const WithAction: Story = {
  args: {
    title: 'Desktop notifications',
    description: 'Get a browser notification when a ticket is assigned to you.',
    action: <Switch defaultChecked aria-label="Desktop notifications" />,
    columns: 1,
    children: null,
  },
}
