import type { Meta, StoryObj } from '@storybook/react-vite'
import { ASSET_CONDITIONS } from '@/types'
import { ConditionBadge } from './ConditionBadge'

const meta = {
  title: 'Molecules/ConditionBadge',
  component: ConditionBadge,
  args: { condition: 'good' },
  argTypes: { condition: { control: 'inline-radio', options: ASSET_CONDITIONS } },
} satisfies Meta<typeof ConditionBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Figma 10 · Condition badge (inventory assets). */
export const Conditions: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      {ASSET_CONDITIONS.map((c) => (
        <ConditionBadge key={c} condition={c} />
      ))}
    </div>
  ),
}
