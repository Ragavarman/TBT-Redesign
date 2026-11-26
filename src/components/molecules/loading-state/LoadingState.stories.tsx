import type { Meta, StoryObj } from '@storybook/react-vite'
import { LoadingState } from './LoadingState'

const meta = {
  title: 'Molecules/LoadingState',
  component: LoadingState,
  args: { type: 'inline', label: 'Loading tickets…' },
  argTypes: { type: { control: 'inline-radio', options: ['inline', 'block'] } },
} satisfies Meta<typeof LoadingState>

export default meta
type Story = StoryObj<typeof meta>

export const Inline: Story = {}

export const Block: Story = {
  args: { type: 'block' },
  render: (args) => (
    <div className="w-80 rounded-xl border bg-card">
      <LoadingState {...args} />
    </div>
  ),
}
