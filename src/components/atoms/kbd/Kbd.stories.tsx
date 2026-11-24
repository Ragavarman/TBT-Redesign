import type { Meta, StoryObj } from '@storybook/react-vite'
import { Kbd } from './Kbd'

const meta = {
  title: 'Atoms/Kbd',
  component: Kbd,
  args: { children: 'K', tone: 'default' },
  argTypes: { tone: { control: 'inline-radio', options: ['default', 'inverse'] } },
} satisfies Meta<typeof Kbd>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Combos: Story = {
  render: () => (
    <div className="flex items-center gap-1 text-small text-muted-foreground">
      <Kbd>⌘</Kbd>
      <Kbd>K</Kbd>
      <span className="mx-2">or</span>
      <Kbd>Ctrl</Kbd>
      <Kbd>Enter</Kbd>
    </div>
  ),
}

/** `inverse` sits on solid fills such as a primary button. */
export const Inverse: Story = {
  render: () => (
    <div className="flex h-8 items-center gap-2 rounded-sm bg-primary px-3 text-label text-primary-foreground">
      New ticket <Kbd tone="inverse">K</Kbd>
    </div>
  ),
}
