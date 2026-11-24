import type { Meta, StoryObj } from '@storybook/react-vite'
import { TICKET_PRIORITIES } from '@/types'
import { PriorityGlyph } from './PriorityGlyph'

const meta = {
  title: 'Atoms/PriorityGlyph',
  component: PriorityGlyph,
  args: { priority: 'high', size: 14 },
  argTypes: {
    priority: { control: 'inline-radio', options: TICKET_PRIORITIES },
    size: { control: 'inline-radio', options: [12, 14, 16, 20] },
  },
} satisfies Meta<typeof PriorityGlyph>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const All: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      {TICKET_PRIORITIES.map((p) => (
        <PriorityGlyph key={p} priority={p} />
      ))}
    </div>
  ),
}
