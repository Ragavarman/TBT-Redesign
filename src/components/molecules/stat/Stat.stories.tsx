import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stat } from './Stat'

const meta = {
  title: 'Molecules/Stat',
  component: Stat,
  args: {
    label: 'Open tickets',
    value: '128',
    icon: 'ticket',
    delta: { value: '+12%', trend: 'up', caption: 'vs last week' },
  },
} satisfies Meta<typeof Stat>

export default meta
type Story = StoryObj<typeof meta>

const narrow: NonNullable<Story['decorators']> = [(Story) => <div className="w-56">{Story()}</div>]

export const Playground: Story = { decorators: narrow }

/** delta up / down / neutral — Figma 08 · Stat. */
export const Deltas: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <Stat
        label="Open tickets"
        value="128"
        icon="ticket"
        delta={{ value: '+12%', trend: 'up', caption: 'vs last week' }}
      />
      <Stat
        label="Open tickets"
        value="128"
        icon="ticket"
        delta={{ value: '−8%', trend: 'down', caption: 'vs last week' }}
      />
      <Stat
        label="Open tickets"
        value="128"
        icon="ticket"
        delta={{ value: '0%', trend: 'neutral', caption: 'vs last week' }}
      />
    </div>
  ),
}

/** For “lower is better” metrics, set goodDirection="down": a drop shows as success. */
export const LowerIsBetter: Story = {
  decorators: narrow,
  args: {
    label: 'First response',
    value: '14m',
    icon: 'clock',
    goodDirection: 'down',
    delta: { value: '−3m', trend: 'down', caption: 'vs last week' },
  },
}
