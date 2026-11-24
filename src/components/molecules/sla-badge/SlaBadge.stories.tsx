import type { Meta, StoryObj } from '@storybook/react-vite'
import { SLA_STATES } from '@/types'
import { SlaBadge } from './SlaBadge'

const meta = {
  title: 'Molecules/SlaBadge',
  component: SlaBadge,
  args: { state: 'on-track', children: '1h 20m left' },
  argTypes: { state: { control: 'inline-radio', options: SLA_STATES } },
} satisfies Meta<typeof SlaBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Figma 10 · SLA badge. */
export const States: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <SlaBadge state="on-track">1h 20m left</SlaBadge>
      <SlaBadge state="at-risk">18m left</SlaBadge>
      <SlaBadge state="breached">Breached 12m ago</SlaBadge>
    </div>
  ),
}
