import type { Meta, StoryObj } from '@storybook/react-vite'
import { PresenceDot } from './PresenceDot'

const meta = {
  title: 'Atoms/PresenceDot',
  component: PresenceDot,
  args: { state: 'online' },
  argTypes: { state: { control: 'inline-radio', options: ['online', 'away', 'offline'] } },
} satisfies Meta<typeof PresenceDot>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const States: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      {(['online', 'away', 'offline'] as const).map((s) => (
        <span key={s} className="flex items-center gap-2 text-small">
          <PresenceDot state={s} label={null} />
          {s}
        </span>
      ))}
    </div>
  ),
}
