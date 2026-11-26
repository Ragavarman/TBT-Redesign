import type { Meta, StoryObj } from '@storybook/react-vite'
import { StatusGlyph } from '@/components/atoms'
import { createdVsResolved, createdVsResolvedPeak, reportRange, ticketsByStatus } from '@/mocks'
import { BarChart, type BarSeries } from './BarChart'
import { ChartCallout, ChartCard, ChartLegend, ChartNote } from './ChartCard'
import { STATUS_FILL } from './status-fill'
import { StatusBreakdown } from './StatusBreakdown'

const meta = {
  title: 'Organisms/ChartCard',
  component: ChartCard,
  parameters: { layout: 'padded' },
  argTypes: {
    action: { control: false },
    footer: { control: false },
    children: { control: false },
  },
} satisfies Meta<typeof ChartCard>

export default meta
type Story = StoryObj<typeof meta>

// Created is a neutral series; Resolved wears success. chart-neutral (base-400 / dark base-600)
// passes the dataviz CVD check against success; muted-foreground does not.
const series: BarSeries[] = [
  { key: 'created', label: 'Created', fill: 'bg-chart-neutral' },
  { key: 'resolved', label: 'Resolved', fill: 'bg-success' },
]
const peak = createdVsResolved[createdVsResolvedPeak]!

/** Reports · Created vs resolved: grouped bars, the peak day in primary. Hover a day for values. */
export const CreatedVsResolved: Story = {
  args: {
    title: 'Created vs resolved',
    meta: `Daily · ${reportRange.short}`,
    className: 'max-w-[694px]',
    action: <ChartCallout>Peak · {peak.label}</ChartCallout>,
    footer: (
      <>
        <ChartLegend
          items={[
            { label: 'Created', swatch: 'bg-chart-neutral' },
            { label: 'Peak day', swatch: 'bg-primary' },
            { label: 'Resolved', swatch: 'bg-success' },
          ]}
        />
        <ChartNote>Illustrative values</ChartNote>
      </>
    ),
    children: (
      <BarChart
        label={`Tickets created and resolved per day, ${reportRange.label}`}
        data={createdVsResolved}
        series={series}
        highlight={{ index: createdVsResolvedPeak, series: 'created', fill: 'bg-primary' }}
      />
    ),
  },
}

const total = ticketsByStatus.reduce((n, s) => n + s.value, 0)

/** Reports · By status: distribution bar + glyph rows with count and share. */
export const ByStatus: Story = {
  args: {
    title: 'By status',
    meta: `${total} tickets`,
    className: 'max-w-[360px]',
    children: (
      <StatusBreakdown
        label={`Open tickets by status, ${total} in total`}
        items={ticketsByStatus.map((s) => ({
          id: s.status,
          label: s.label,
          value: s.value,
          fill: STATUS_FILL[s.status],
          glyph: <StatusGlyph status={s.status} label={null} />,
        }))}
      />
    ),
  },
}

/** The two cards side by side, as on the Overview page. */
export const ChartsRow: Story = {
  args: { title: '' },
  render: () => (
    <div className="flex gap-4">
      <ChartCard
        {...CreatedVsResolved.args}
        title={CreatedVsResolved.args!.title!}
        className="flex-[694]"
      />
      <ChartCard {...ByStatus.args} title={ByStatus.args!.title!} className="flex-[360]" />
    </div>
  ),
}
