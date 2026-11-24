import type { Meta, StoryObj } from '@storybook/react-vite'
import { Separator } from './Separator'

const meta = {
  title: 'Atoms/Separator',
  component: Separator,
  args: { orientation: 'horizontal' },
  argTypes: { orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] } },
} satisfies Meta<typeof Separator>

export default meta
type Story = StoryObj<typeof meta>

export const Horizontal: Story = {
  render: (args) => (
    <div className="flex w-64 flex-col gap-3 text-small">
      <span>Assign to me</span>
      <Separator {...args} />
      <span>Delete ticket</span>
    </div>
  ),
}

export const Vertical: Story = {
  render: () => (
    <div className="flex h-5 items-center gap-3 text-small">
      <span>Inbox</span>
      <Separator orientation="vertical" />
      <span>Assigned to me</span>
      <Separator orientation="vertical" />
      <span>Unassigned</span>
    </div>
  ),
}
