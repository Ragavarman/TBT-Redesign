import type { Meta, StoryObj } from '@storybook/react-vite'
import { HelperText } from './HelperText'

const meta = {
  title: 'Atoms/HelperText',
  component: HelperText,
  args: { children: 'Helper text', tone: 'default' },
  argTypes: { tone: { control: 'inline-radio', options: ['default', 'error', 'success'] } },
} satisfies Meta<typeof HelperText>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Tones: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <HelperText>We’ll never share this email.</HelperText>
      <HelperText tone="error">Enter a valid email address.</HelperText>
      <HelperText tone="success" icon>
        Email verified.
      </HelperText>
    </div>
  ),
}
