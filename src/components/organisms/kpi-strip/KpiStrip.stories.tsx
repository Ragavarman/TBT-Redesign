import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from '@/components/atoms'
import { reportKpis as k } from '@/mocks'
import { KpiStrip } from './KpiStrip'

const meta = {
  title: 'Organisms/KpiStrip',
  component: KpiStrip,
  parameters: { layout: 'padded' },
  argTypes: { items: { control: false } },
} satisfies Meta<typeof KpiStrip>

export default meta
type Story = StoryObj<typeof meta>

/** Reports · Overview KPI summary: five joined cells. */
export const Overview: Story = {
  args: {
    items: [
      {
        id: 'open',
        label: 'Open tickets',
        value: k.open.value,
        badge: (
          <Badge size="sm" aria-label={`${k.open.delta} vs last week`}>
            {k.open.delta}
          </Badge>
        ),
        support: k.open.caption,
      },
      {
        id: 'first-response',
        label: 'Needs first response',
        value: k.needsFirstResponse.value,
        support: k.needsFirstResponse.caption,
      },
      { id: 'resolved', label: 'Resolved', value: k.resolved.value, support: k.resolved.caption },
      {
        id: 'breached',
        label: 'SLA breached',
        value: k.slaBreached.value,
        tone: 'destructive',
        support: (
          <Badge variant="destructive" size="sm" dot>
            {k.slaBreached.caption}
          </Badge>
        ),
      },
      {
        id: 'median',
        label: 'Median first response',
        value: k.medianFirstResponse.value,
        support: k.medianFirstResponse.caption,
      },
    ],
  },
}

/** Three cells share the width equally. */
export const ThreeUp: Story = {
  args: {
    items: Overview.args!.items!.slice(0, 3),
  },
}
