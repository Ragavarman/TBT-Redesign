import { useState, type ReactNode } from 'react'
import { Button, type IconName } from '@/components/atoms'
import { toast } from '@/components/molecules'
import {
  DateRangePicker,
  ExportDialog,
  formatRange,
  PageHeader,
  type DateRange,
} from '@/components/organisms'
import { DashboardTemplate } from '@/components/templates'
import { WS_NOW } from '@/mocks'
import { cn } from '@/lib/utils'

/** Shared frame for Reports pages: period picker + Export (Figma X19) in the header. */
export function ReportShell({
  sidebar,
  icon,
  title,
  range,
  onRange,
  extraActions,
  exportOpen: exportOpenProp,
  children,
}: {
  sidebar: ReactNode
  icon: IconName
  title: string
  range: DateRange
  onRange: (r: DateRange) => void
  extraActions?: ReactNode
  /** Stories: open Export on load. */
  exportOpen?: boolean
  children: ReactNode
}) {
  const [exporting, setExporting] = useState(exportOpenProp ?? false)
  return (
    <DashboardTemplate
      sidebar={sidebar}
      header={
        <PageHeader
          icon={icon}
          title={title}
          actions={
            <>
              <DateRangePicker
                value={range}
                compare={false}
                today={WS_NOW.slice(0, 10)}
                onApply={(v) => onRange(v.range)}
              />
              {extraActions}
              <Button variant="secondary" leadingIcon="download" onClick={() => setExporting(true)}>
                Export
              </Button>
            </>
          }
        />
      }
    >
      {children}
      <ExportDialog
        key={exporting ? 'open' : 'closed'}
        open={exporting}
        onOpenChange={setExporting}
        subject={`${title} · ${formatRange(range)}`}
        defaultRecipients={['tharsi@tbt.lk', 'support-leads@tbt.lk']}
        onDownload={(f) => toast.success(`${title} downloaded as ${f.toUpperCase()}`)}
        onSchedule={(f, s) =>
          toast.success(`Scheduled · ${f.toUpperCase()} ${s.every.toLowerCase()} at ${s.at}`, {
            description: `To ${s.to.join(', ')}`,
          })
        }
      />
    </DashboardTemplate>
  )
}

/** A thin share bar with its percentage (Share, Met, CSAT columns). */
export function Meter({
  value,
  tone = 'primary',
}: {
  value: number
  tone?: 'primary' | 'neutral'
}) {
  const pct = Math.round(value * 100)
  return (
    <span className="flex items-center gap-2">
      <span className="h-1.5 w-24 overflow-hidden rounded-full bg-muted" aria-hidden>
        <span
          className={cn(
            'block h-full rounded-full',
            tone === 'primary' ? 'bg-primary' : 'bg-muted-foreground',
          )}
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className="w-10 text-small text-muted-foreground tabular-nums">{pct}%</span>
    </span>
  )
}

/** Tiny bar trend for a table cell (Trend, Load). Values are relative. */
export function Spark({ values, label }: { values: number[]; label: string }) {
  const max = Math.max(...values, 1)
  return (
    <span role="img" aria-label={label} className="flex h-4 items-end gap-0.5">
      {values.map((v, i) => (
        <span
          key={i}
          className="w-1 rounded-t-[1px] bg-muted-foreground/60"
          style={{ height: `${Math.max(12, (v / max) * 100)}%` }}
        />
      ))}
    </span>
  )
}

/** Plain report table: header row and body, inside a card. */
export function ReportTable({
  label,
  head,
  children,
}: {
  label: string
  head: { label: string; className?: string }[]
  children: ReactNode
}) {
  return (
    <section aria-label={label} className="shrink-0 overflow-hidden rounded-xl border bg-card">
      <table className="w-full text-left text-body">
        <thead className="border-b bg-muted/40 text-small text-muted-foreground">
          <tr>
            {head.map((h, i) => (
              <th
                key={h.label}
                className={cn(
                  'h-10 font-normal',
                  i === 0 && 'ps-5',
                  i === head.length - 1 && 'pe-5',
                  h.className,
                )}
              >
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_td]:h-11 [&_td:first-child]:ps-5 [&_td:last-child]:pe-5 [&>tr]:border-b [&>tr:last-child]:border-b-0">
          {children}
        </tbody>
      </table>
    </section>
  )
}
