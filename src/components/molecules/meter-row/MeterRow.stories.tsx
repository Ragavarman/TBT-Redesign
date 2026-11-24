import type { Meta, StoryObj } from '@storybook/react-vite'
import { PriorityGlyph, StatusGlyph } from '@/components/atoms'
import { MeterRow } from './MeterRow'

const meta = {
  title: 'Molecules/MeterRow',
  component: MeterRow,
  args: {
    glyph: <StatusGlyph status="open" label={null} />,
    label: 'Open',
    value: 42,
    max: 70,
    tone: 'info',
  },
  argTypes: { glyph: { control: false } },
  decorators: [(Story) => <div className="w-90">{Story()}</div>],
} satisfies Meta<typeof MeterRow>

export default meta
type Story = StoryObj<typeof meta>

/** Figma 08 · Meter row. */
export const Default: Story = {}

export const ByPriority: Story = {
  render: () => (
    <div className="flex flex-col gap-2.5">
      <MeterRow
        glyph={<PriorityGlyph priority="urgent" label={null} />}
        label="Urgent"
        value={4}
        max={40}
        tone="destructive"
      />
      <MeterRow
        glyph={<PriorityGlyph priority="high" label={null} />}
        label="High"
        value={17}
        max={40}
        tone="warning"
      />
      <MeterRow
        glyph={<PriorityGlyph priority="medium" label={null} />}
        label="Medium"
        value={40}
        max={40}
      />
      <MeterRow
        glyph={<PriorityGlyph priority="low" label={null} />}
        label="Low"
        value={22}
        max={40}
      />
    </div>
  ),
}
