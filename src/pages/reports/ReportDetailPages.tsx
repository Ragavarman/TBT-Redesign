import { useState, type ReactNode } from 'react'
import { Avatar, Icon } from '@/components/atoms'
import {
  BarChart,
  ChartCard,
  ChartLegend,
  ChartNote,
  formatRange,
  KpiStrip,
  type DateRange,
} from '@/components/organisms'
import {
  wsAgentPerf,
  wsAppVolume,
  wsChannelStats,
  wsChannelWeekly,
  wsSlaPolicies,
  wsSlaWeekly,
} from '@/mocks'
import { cn } from '@/lib/utils'
import type { Ticket } from '@/types'
import { Meter, ReportShell, ReportTable, Spark } from './ReportKit'
import { change, last30, previousRange, scaled, seeded, total, volumeSeries } from './report-data'

/**
 * Figma Interface · Reports R1 Ticket volume, R2 SLA performance, R3 Agent performance,
 * R4 Channels. Live counts where the workspace has them (backlog, breached, at risk); the rest
 * is illustrative and scales with the period.
 */

interface ReportPageProps {
  sidebar: ReactNode
  tickets: Ticket[]
  initialRange?: DateRange
  exportOpen?: boolean
}

const isOpen = (t: Ticket) => t.status !== 'resolved' && t.status !== 'closed'
const pct = (n: number) => `${Math.round(n * 100)}%`
const trend = (seed: string) => Array.from({ length: 8 }, (_, i) => 3 + seeded(`${seed}${i}`) * 7)

/* ── R1 Ticket volume ──────────────────────────────────────────────────────────────── */

export function TicketVolumePage({ sidebar, tickets, initialRange, exportOpen }: ReportPageProps) {
  const [range, setRange] = useState(initialRange ?? last30())
  const { points, unit } = volumeSeries(range)
  const prev = volumeSeries(previousRange(range)).points
  const created = total(points, 'created')
  const resolved = total(points, 'resolved')
  const backlog = tickets.filter(isOpen).length
  return (
    <ReportShell
      sidebar={sidebar}
      icon="reports"
      title="Ticket volume"
      range={range}
      onRange={setRange}
      exportOpen={exportOpen}
    >
      <KpiStrip
        className="shrink-0"
        items={[
          {
            id: 'c',
            label: 'Created',
            value: created,
            support: `${change(created, total(prev, 'created'))} vs previous`,
          },
          {
            id: 'r',
            label: 'Resolved',
            value: resolved,
            support: change(resolved, total(prev, 'resolved')),
          },
          {
            id: 'b',
            label: 'Backlog',
            value: backlog,
            support: `${tickets.length} tickets in the workspace`,
          },
          { id: 'o', label: 'Reopened', value: '4%', support: 'No change' },
        ]}
      />
      <ChartCard
        className="shrink-0"
        title={`Created vs resolved per ${unit === 'Daily' ? 'day' : 'week'}`}
        meta={formatRange(range)}
        footer={
          <>
            <ChartLegend
              items={[
                { label: 'Created', swatch: 'bg-primary' },
                { label: 'Resolved', swatch: 'bg-chart-neutral' },
              ]}
            />
            <ChartNote>Illustrative values</ChartNote>
          </>
        }
      >
        <BarChart
          label={`Tickets created and resolved, ${formatRange(range)}`}
          data={points.map((p) => ({
            label: p.label,
            values: { created: p.created, resolved: p.resolved },
          }))}
          series={[
            { key: 'created', label: 'Created', fill: 'bg-primary' },
            { key: 'resolved', label: 'Resolved', fill: 'bg-chart-neutral' },
          ]}
        />
      </ChartCard>
      <ReportTable
        label="Volume by application"
        head={[
          { label: 'Application' },
          { label: 'Created', className: 'w-28' },
          { label: 'Resolved', className: 'w-28' },
          { label: 'Backlog', className: 'w-28' },
          { label: 'Share', className: 'w-44' },
          { label: 'Trend', className: 'w-28' },
        ]}
      >
        {wsAppVolume.map((a) => {
          const c = Math.round(created * a.share)
          const r = Math.round(c * a.resolvedRate)
          return (
            <tr key={a.app}>
              <td>{a.app}</td>
              <td className="tabular-nums">{c}</td>
              <td className="tabular-nums">{r}</td>
              <td className="tabular-nums">{c - r}</td>
              <td>
                <Meter value={a.share} tone="neutral" />
              </td>
              <td>
                <Spark values={trend(a.app)} label={`${a.app} trend`} />
              </td>
            </tr>
          )
        })}
      </ReportTable>
    </ReportShell>
  )
}

/* ── R2 SLA performance ────────────────────────────────────────────────────────────── */

export function SlaPerformancePage({
  sidebar,
  tickets,
  initialRange,
  exportOpen,
}: ReportPageProps) {
  const [range, setRange] = useState(initialRange ?? last30())
  const open = tickets.filter(isOpen)
  const breached = open.filter((t) => t.sla?.state === 'breached').length
  const atRisk = open.filter((t) => t.sla?.state === 'at-risk').length
  const met = wsSlaWeekly.reduce((n, v) => n + v, 0) / wsSlaWeekly.length
  return (
    <ReportShell
      sidebar={sidebar}
      icon="clock"
      title="SLA performance"
      range={range}
      onRange={setRange}
      exportOpen={exportOpen}
    >
      <KpiStrip
        className="shrink-0"
        items={[
          {
            id: 'f',
            label: 'First response met',
            value: '—',
            tone: 'muted',
            support: 'Tracking starts with response events',
          },
          { id: 'r', label: 'Resolution met', value: pct(met), support: '↑ 3 pts' },
          {
            id: 'b',
            label: 'Breached',
            value: breached,
            tone: breached ? 'destructive' : 'default',
            support: 'Open tickets past their SLA',
          },
          { id: 'a', label: 'At risk now', value: atRisk, support: 'Due within 2 hours' },
        ]}
      />
      <ChartCard
        className="shrink-0"
        title="Resolution SLA met, by week"
        meta={formatRange(range)}
        footer={
          <>
            <ChartLegend items={[{ label: 'Resolution met %', swatch: 'bg-primary' }]} />
            <ChartNote>Illustrative values</ChartNote>
          </>
        }
      >
        <BarChart
          label="Resolution SLA met per week, W40 to W47"
          data={wsSlaWeekly.map((v, i) => ({
            label: `W${40 + i}`,
            values: { met: Math.round(v * 100) },
          }))}
          series={[{ key: 'met', label: 'Resolution met', fill: 'bg-primary' }]}
          format={(v) => `${v}%`}
        />
      </ChartCard>
      <ReportTable
        label="SLA by policy"
        head={[
          { label: 'Policy' },
          { label: 'Applies to' },
          { label: 'Target', className: 'w-40' },
          { label: 'Met', className: 'w-40' },
          { label: 'Breached', className: 'w-24' },
          { label: 'Avg. time', className: 'w-28' },
        ]}
      >
        {wsSlaPolicies.map((p) => (
          <tr key={p.id}>
            <td>{p.name}</td>
            <td className="text-muted-foreground">{p.appliesTo}</td>
            <td>{p.target}</td>
            <td>
              {p.met !== undefined ? (
                <Meter value={p.met} />
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </td>
            <td className="tabular-nums">
              {p.breached !== undefined ? scaled(p.breached, range) : '—'}
            </td>
            <td className="text-muted-foreground tabular-nums">{p.avgTime ?? '—'}</td>
          </tr>
        ))}
      </ReportTable>
    </ReportShell>
  )
}

/* ── R3 Agent performance ──────────────────────────────────────────────────────────── */

export function AgentPerformancePage({ sidebar, initialRange, exportOpen }: ReportPageProps) {
  const [range, setRange] = useState(initialRange ?? last30())
  const rows = wsAgentPerf.map((a) => ({
    ...a,
    assigned: scaled(a.assigned, range),
    resolved: scaled(a.resolved, range),
  }))
  const perAgent = Math.round(rows.reduce((n, a) => n + a.assigned, 0) / rows.length)
  const csat = rows.reduce((n, a) => n + a.csat, 0) / rows.length
  return (
    <ReportShell
      sidebar={sidebar}
      icon="team"
      title="Agent performance"
      range={range}
      onRange={setRange}
      exportOpen={exportOpen}
    >
      <KpiStrip
        className="shrink-0"
        items={[
          { id: 'a', label: 'Agents active', value: rows.length },
          { id: 't', label: 'Tickets per agent', value: perAgent, support: '↑ 5' },
          { id: 'm', label: 'Median resolution', value: '7h 20m', support: '↓ 12% faster' },
          { id: 'c', label: 'CSAT', value: pct(csat), support: '↑ 1 pt' },
        ]}
      />
      <ReportTable
        label="Agent performance"
        head={[
          { label: 'Agent' },
          { label: 'Team', className: 'w-40' },
          { label: 'Assigned', className: 'w-24' },
          { label: 'Resolved', className: 'w-24' },
          { label: 'Resolution', className: 'w-28' },
          { label: 'CSAT', className: 'w-40' },
          { label: 'Load', className: 'w-24' },
        ]}
      >
        {rows.map((a) => (
          <tr key={a.name}>
            <td>
              <span className="flex items-center gap-2">
                <Avatar name={a.name} size="xs" aria-hidden />
                {a.name}
              </span>
            </td>
            <td className="text-muted-foreground">{a.team}</td>
            <td className="tabular-nums">{a.assigned}</td>
            <td className="tabular-nums">{a.resolved}</td>
            <td className="tabular-nums">{a.resolution}</td>
            <td>
              <Meter value={a.csat} />
            </td>
            <td>
              <Spark values={trend(a.name)} label={`${a.name} daily load`} />
            </td>
          </tr>
        ))}
      </ReportTable>
    </ReportShell>
  )
}

/* ── R4 Channels ───────────────────────────────────────────────────────────────────── */

const CHANNEL_ICON = { Phone: 'phone', Email: 'mail', Chat: 'chat', SMS: 'chat' } as const
const CHANNEL_BAR = ['bg-success', 'bg-primary', 'bg-warning', 'bg-foreground']

export function ChannelsPage({ sidebar, initialRange, exportOpen }: ReportPageProps) {
  const [range, setRange] = useState(initialRange ?? last30())
  const rows = wsChannelStats.map((c) => ({ ...c, tickets: scaled(c.tickets, range) }))
  const sum = rows.reduce((n, c) => n + c.tickets, 0) || 1
  return (
    <ReportShell
      sidebar={sidebar}
      icon="chat"
      title="Channels"
      range={range}
      onRange={setRange}
      exportOpen={exportOpen}
    >
      <section aria-label="Channels" className="grid shrink-0 grid-cols-4 gap-3">
        {rows.map((c, i) => (
          <div key={c.channel} className="flex flex-col gap-2 rounded-xl border bg-card p-4">
            <span className="flex items-center gap-2 text-small text-muted-foreground">
              <Icon name={CHANNEL_ICON[c.channel as keyof typeof CHANNEL_ICON]} size={14} />
              {c.channel}
            </span>
            <span className="flex items-baseline gap-2">
              <span className="text-heading-1 text-foreground tabular-nums">{c.tickets}</span>
              <span className="text-small text-muted-foreground">
                {Math.round((c.tickets / sum) * 100)}%
              </span>
            </span>
            <span className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
              <span
                className={cn('block h-full rounded-full', CHANNEL_BAR[i])}
                style={{ width: `${(c.tickets / sum) * 100}%` }}
              />
            </span>
            <span className="text-small text-muted-foreground">{c.note}</span>
          </div>
        ))}
      </section>
      <ChartCard
        className="shrink-0"
        title="Tickets by channel per week"
        meta={formatRange(range)}
        footer={
          <>
            <ChartLegend
              items={[
                { label: 'Phone', swatch: 'bg-primary' },
                { label: 'Email', swatch: 'bg-chart-neutral' },
              ]}
            />
            <ChartNote>Illustrative values</ChartNote>
          </>
        }
      >
        <BarChart
          label="Phone and email tickets per week, W40 to W47"
          data={wsChannelWeekly.map((w) => ({
            label: w.label,
            values: { phone: w.phone, email: w.email },
          }))}
          series={[
            { key: 'phone', label: 'Phone', fill: 'bg-primary' },
            { key: 'email', label: 'Email', fill: 'bg-chart-neutral' },
          ]}
        />
      </ChartCard>
      <ReportTable
        label="Channel performance"
        head={[
          { label: 'Channel' },
          { label: 'Tickets', className: 'w-28' },
          { label: 'First reply', className: 'w-32' },
          { label: 'Resolution', className: 'w-32' },
          { label: 'CSAT', className: 'w-44' },
        ]}
      >
        {rows.map((c) => (
          <tr key={c.channel}>
            <td>{c.channel}</td>
            <td className="tabular-nums">{c.tickets}</td>
            <td className="text-muted-foreground tabular-nums">{c.firstReply}</td>
            <td className="tabular-nums">{c.resolution}</td>
            <td>
              <Meter value={c.csat} />
            </td>
          </tr>
        ))}
      </ReportTable>
    </ReportShell>
  )
}
