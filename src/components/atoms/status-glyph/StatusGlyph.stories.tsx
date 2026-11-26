import type { Meta, StoryObj } from '@storybook/react-vite'
import { TICKET_STATUSES, TICKET_STATUS_LABEL } from '@/types'
import { PriorityGlyph } from '../priority-glyph'
import { StatusGlyph } from './StatusGlyph'

const meta = {
  title: 'Atoms/StatusGlyph',
  component: StatusGlyph,
  args: { status: 'open', size: 14 },
  argTypes: {
    status: { control: 'select', options: TICKET_STATUSES },
    size: { control: 'inline-radio', options: [12, 14, 16, 20] },
  },
} satisfies Meta<typeof StatusGlyph>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Figma 10 · Status & priority glyphs. Shape alone tells the states apart. */
export const AllGlyphs: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex gap-6">
        {TICKET_STATUSES.map((s) => (
          <div key={s} className="flex w-20 flex-col items-center gap-2">
            <StatusGlyph status={s} size={20} label={null} />
            <span className="text-caption text-muted-foreground">{TICKET_STATUS_LABEL[s]}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-6">
        {(['low', 'medium', 'high', 'urgent'] as const).map((p) => (
          <div key={p} className="flex w-20 flex-col items-center gap-2">
            <PriorityGlyph priority={p} size={20} label={null} />
            <span className="text-caption text-muted-foreground capitalize">{p}</span>
          </div>
        ))}
      </div>
    </div>
  ),
}
