import type { Meta, StoryObj } from '@storybook/react-vite'
import { TICKET_PRIORITIES } from '@/types'
import { ConditionBadge } from '../condition-badge'
import { SlaBadge } from '../sla-badge'
import { PriorityBadge } from './PriorityBadge'

const meta = {
  title: 'Molecules/PriorityBadge',
  component: PriorityBadge,
  args: { priority: 'high', variant: 'label' },
  argTypes: {
    priority: { control: 'inline-radio', options: TICKET_PRIORITIES },
    variant: { control: 'inline-radio', options: ['glyph', 'label'] },
  },
} satisfies Meta<typeof PriorityBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** level × style — Figma 10 · Priority. */
export const Matrix: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {(['glyph', 'label'] as const).map((v) => (
        <div key={v} className="flex items-center gap-6">
          <span className="w-12 text-caption text-muted-foreground">{v}</span>
          {TICKET_PRIORITIES.map((p) => (
            <PriorityBadge key={p} priority={p} variant={v} />
          ))}
        </div>
      ))}
    </div>
  ),
}

/** Figma 10 · Priority · SLA · Condition — the three helpdesk capsules together. */
export const PrioritySlaCondition: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        {TICKET_PRIORITIES.map((p) => (
          <PriorityBadge key={p} priority={p} />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <SlaBadge state="on-track">1h 20m left</SlaBadge>
        <SlaBadge state="at-risk">18m left</SlaBadge>
        <SlaBadge state="breached">Breached 12m ago</SlaBadge>
      </div>
      <div className="flex items-center gap-2">
        <ConditionBadge condition="good" />
        <ConditionBadge condition="needs-repair" />
        <ConditionBadge condition="retired" />
      </div>
    </div>
  ),
}
