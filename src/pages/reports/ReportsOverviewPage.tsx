import { useMemo, useState, type ReactNode } from 'react'
import { Avatar, Badge, Button, Icon, StatusGlyph } from '@/components/atoms'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  EmptyState,
  toast,
} from '@/components/molecules'
import {
  BarChart,
  ChartCallout,
  ChartCard,
  ChartLegend,
  ChartNote,
  DateRangePicker,
  ExportDialog,
  formatRange,
  KpiStrip,
  PageHeader,
  STATUS_PICKER_LABEL,
  STATUS_FILL,
  StatusBreakdown,
  type BarSeries,
  type DateRange,
} from '@/components/organisms'
import { DashboardRow, DashboardTemplate } from '@/components/templates'
import { WS_NOW } from '@/mocks'
import { formatTicketId, TICKET_STATUSES, type Ticket } from '@/types'
import { change, previousRange, total, volumeSeries } from './report-data'

/**
 * Figma Interface · X18 Reports — Overview (and its date range picker): period, team and export
 * in the header; KPIs, created vs resolved, tickets by status, and agent workload.
 * KPIs, status and agents are live from the workspace; volume is illustrative.
 */

const TEAMS = ['Support Team Alpha', 'Technical Team Beta', 'Sales Team Gamma']
const isOpen = (t: Ticket) => t.status !== 'resolved' && t.status !== 'closed'
const series: BarSeries[] = [
  { key: 'created', label: 'Created', fill: 'bg-chart-neutral' },
  { key: 'resolved', label: 'Resolved', fill: 'bg-success' },
]

export interface ReportsOverviewPageProps {
  sidebar: ReactNode
  /** Every ticket in the workspace. */
  tickets: Ticket[]
  initialRange?: DateRange
  /** Stories: open the date picker on load (Figma X18 variant). */
  pickerOpen?: boolean
  /** Stories: open Export & schedule on load (Figma X19). */
  exportOpen?: boolean
  onOpenTicket?: (id: number) => void
}

export function ReportsOverviewPage({
  sidebar,
  tickets: all,
  initialRange = { start: '2026-11-11', end: '2026-11-18' },
  pickerOpen,
  exportOpen,
  onOpenTicket,
}: ReportsOverviewPageProps) {
  const [range, setRange] = useState(initialRange)
  const [compare, setCompare] = useState(false)
  const [team, setTeam] = useState('all')
  const [exporting, setExporting] = useState(exportOpen ?? false)

  const tickets = useMemo(
    () => (team === 'all' ? all : all.filter((t) => t.team === team)),
    [all, team],
  )
  const open = tickets.filter(isOpen)
  const firstResponse = tickets.filter((t) => t.status === 'open')
  const done = tickets.filter((t) => !isOpen(t))
  const breached = open.filter((t) => t.sla?.state === 'breached')
  const oldest = firstResponse.reduce<string | undefined>(
    (m, t) => (!m || t.createdAt < m ? t.createdAt : m),
    undefined,
  )
  const oldestDays = oldest
    ? Math.max(1, Math.round((Date.parse(WS_NOW) - Date.parse(oldest)) / 86_400_000))
    : 0

  const { points, unit } = useMemo(() => volumeSeries(range, team), [range, team])
  const prev = useMemo(() => volumeSeries(previousRange(range), team).points, [range, team])
  const peak = points.reduce((best, p, i) => (p.created > points[best]!.created ? i : best), 0)
  const created = total(points, 'created')

  // agent workload: open tickets per assignee
  const agents = (() => {
    const by = new Map<string, { name: string; open: number; breached: number }>()
    for (const t of open) {
      const name = t.assignee?.name ?? 'Unassigned'
      const row = by.get(name) ?? { name, open: 0, breached: 0 }
      row.open++
      if (t.sla?.state === 'breached') row.breached++
      by.set(name, row)
    }
    return [...by.values()].sort((a, b) => b.open - a.open)
  })()

  const statusItems = TICKET_STATUSES.map((s) => ({
    id: s,
    label: STATUS_PICKER_LABEL[s],
    value: tickets.filter((t) => t.status === s).length,
    fill: STATUS_FILL[s],
    glyph: <StatusGlyph status={s} label={null} />,
  }))

  return (
    <DashboardTemplate
      sidebar={sidebar}
      header={
        <PageHeader
          icon="reports"
          title="Overview"
          actions={
            <>
              <DateRangePicker
                value={range}
                compare={compare}
                today={WS_NOW.slice(0, 10)}
                defaultOpen={pickerOpen}
                onApply={(v) => {
                  setRange(v.range)
                  setCompare(v.compare)
                }}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" leadingIcon="team">
                    {team === 'all' ? 'All teams' : team}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuRadioGroup value={team} onValueChange={setTeam}>
                    <DropdownMenuRadioItem value="all">All teams</DropdownMenuRadioItem>
                    {TEAMS.map((t) => (
                      <DropdownMenuRadioItem key={t} value={t}>
                        {t}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="secondary" leadingIcon="download" onClick={() => setExporting(true)}>
                Export
              </Button>
            </>
          }
        />
      }
    >
      <KpiStrip
        className="shrink-0"
        items={[
          {
            id: 'open',
            label: 'Open tickets',
            value: open.length,
            badge: compare ? <Badge>{change(created, total(prev, 'created'))}</Badge> : undefined,
            support: compare
              ? 'created vs previous period'
              : `of ${tickets.length} in the workspace`,
          },
          {
            id: 'first',
            label: 'Needs first response',
            value: firstResponse.length,
            support: firstResponse.length ? (
              <>
                <Icon name="clock" size={14} /> oldest {oldestDays}d
              </>
            ) : (
              'all answered'
            ),
          },
          {
            id: 'resolved',
            label: 'Resolved',
            value: done.length,
            support: (
              <>
                <span className="h-1 w-16 overflow-hidden rounded-full bg-muted" aria-hidden>
                  <span
                    className="block h-full rounded-full bg-success"
                    style={{
                      width: `${tickets.length ? (done.length / tickets.length) * 100 : 0}%`,
                    }}
                  />
                </span>
                {tickets.length ? Math.round((done.length / tickets.length) * 100) : 0}% done
              </>
            ),
          },
          {
            id: 'breached',
            label: 'SLA breached',
            value: breached.length,
            tone: breached.length ? 'destructive' : 'default',
            support: breached.length ? (
              <span className="flex flex-wrap gap-1">
                {breached.slice(0, 2).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onOpenTicket?.(t.id)}
                    className="cursor-pointer rounded-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Badge variant="destructive">{formatTicketId(t.id)}</Badge>
                  </button>
                ))}
              </span>
            ) : (
              'none'
            ),
          },
          {
            id: 'median',
            label: 'Median first response',
            value: '—',
            tone: 'muted',
            support: 'not tracked yet',
          },
        ]}
      />

      <DashboardRow>
        <ChartCard
          className="flex-[694]"
          title="Created vs resolved"
          meta={`${unit} · ${formatRange(range)}`}
          action={<ChartCallout>Peak · {points[peak]?.label}</ChartCallout>}
          footer={
            <>
              <ChartLegend
                items={[
                  { label: 'Created', swatch: 'bg-chart-neutral' },
                  { label: 'Peak', swatch: 'bg-primary' },
                  { label: 'Resolved', swatch: 'bg-success' },
                ]}
              />
              <ChartNote>
                Illustrative values
                {compare
                  ? ` · ${created} created, ${change(created, total(prev, 'created'))} vs previous`
                  : ''}
              </ChartNote>
            </>
          }
        >
          <BarChart
            label={`Tickets created and resolved, ${unit.toLowerCase()}, ${formatRange(range)}`}
            data={points.map((p) => ({
              label: p.label,
              values: { created: p.created, resolved: p.resolved },
            }))}
            series={series}
            highlight={{ index: peak, series: 'created', fill: 'bg-primary' }}
          />
        </ChartCard>
        <ChartCard className="flex-[360]" title="By status" meta={`${tickets.length} tickets`}>
          {tickets.length ? (
            <StatusBreakdown
              label={`Tickets by status, ${tickets.length} in total`}
              items={statusItems}
            />
          ) : (
            <EmptyState title="No tickets" description="This team has no tickets yet." />
          )}
        </ChartCard>
      </DashboardRow>

      <ChartCard
        className="shrink-0"
        title="Agents"
        meta={`${agents.length} ${agents.length === 1 ? 'agent' : 'agents'} · open workload`}
        flush
      >
        {agents.length ? (
          <table className="w-full text-left text-body">
            <thead className="text-overline text-muted-foreground">
              <tr className="border-b">
                <th className="h-10 ps-5 font-normal">Agent</th>
                <th className="w-28 font-normal">Open</th>
                <th className="w-36 font-normal">SLA breached</th>
                <th className="w-64 pe-5 font-normal">Share of open</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((a) => {
                const share = open.length ? Math.round((a.open / open.length) * 100) : 0
                return (
                  <tr key={a.name} className="border-b last:border-b-0">
                    <td className="h-11 ps-5">
                      <span className="flex items-center gap-2">
                        <Avatar name={a.name} size="xs" aria-hidden />
                        {a.name}
                      </span>
                    </td>
                    <td className="tabular-nums">
                      {a.open} <span className="text-muted-foreground">open</span>
                    </td>
                    <td className={a.breached ? 'text-destructive' : 'text-muted-foreground'}>
                      {a.breached ? `${a.breached} breached` : '—'}
                    </td>
                    <td className="pe-5">
                      <span className="flex items-center gap-3">
                        <span
                          className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
                          aria-hidden
                        >
                          <span
                            className="block h-full rounded-full bg-primary"
                            style={{ width: `${share}%` }}
                          />
                        </span>
                        <span className="w-10 text-end text-small text-muted-foreground tabular-nums">
                          {share}%
                        </span>
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-6">
            <EmptyState title="No open tickets" description="Nobody has open work in this team." />
          </div>
        )}
      </ChartCard>
      <ExportDialog
        key={exporting ? 'open' : 'closed'}
        open={exporting}
        onOpenChange={setExporting}
        subject={`Overview · ${formatRange(range)}`}
        defaultRecipients={['tharsi@tbt.lk', 'support-leads@tbt.lk']}
        onDownload={(f) => toast.success(`Overview downloaded as ${f.toUpperCase()}`)}
        onSchedule={(f, s) =>
          toast.success(`Scheduled · ${f.toUpperCase()} ${s.every.toLowerCase()} at ${s.at}`, {
            description: `To ${s.to.join(', ')}`,
          })
        }
      />
    </DashboardTemplate>
  )
}
