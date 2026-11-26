import type { Meta, StoryObj } from '@storybook/react-vite'
import { Spinner } from './Spinner'

const meta = {
  title: 'Atoms/Spinner',
  component: Spinner,
  args: { size: 'md' },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-6">
      {(['sm', 'md', 'lg'] as const).map((s) => (
        <div key={s} className="flex flex-col items-center gap-2">
          <Spinner size={s} />
          <span className="text-caption text-muted-foreground">{s}</span>
        </div>
      ))}
    </div>
  ),
}

export const Tinted: Story = {
  render: () => (
    <div className="flex gap-4">
      <Spinner className="text-primary" />
      <Spinner className="text-muted-foreground" />
    </div>
  ),
}
