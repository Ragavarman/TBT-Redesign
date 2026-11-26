import { useState, type ReactNode } from 'react'
import { Badge, Button, Icon, Input } from '@/components/atoms'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  FormField,
  Select,
  toast,
} from '@/components/molecules'
import { BarChart, ChartCard, ChartLegend, PageHeader } from '@/components/organisms'
import { AppShell, Panel, PanelBody } from '@/components/templates'
import { cn } from '@/lib/utils'
import {
  CHARTS,
  DEFAULT_REPORT,
  FILTER_OPTIONS,
  GROUPS,
  MEASURES,
  RANGES,
  reportData,
  SPLITS,
  splitLabel,
  type SavedReport,
} from './custom-report'

/**
 * Figma Interface · R5 Reports — New custom report: settings on the left (name, measure,
 * group by, split by, time range, filters, chart type), a live preview on the right; Save adds
 * it under Saved reports in the sidebar.
 */

export interface CustomReportPageProps {
  sidebar: ReactNode
  /** Open an existing report; omit for a new one. */
  report?: SavedReport
  onSave: (r: SavedReport) => void
  onCancel: () => void
}

export function CustomReportPage({ sidebar, report, onSave, onCancel }: CustomReportPageProps) {
  const [r, setR] = useState<Omit<SavedReport, 'id'>>(report ?? DEFAULT_REPORT)
  const set = (patch: Partial<SavedReport>) => setR((x) => ({ ...x, ...patch }))
  const data = reportData(r)
  const split = splitLabel(r.splitBy)
  const sum = data.reduce((n, d) => n + d.all, 0)
  const measure = MEASURES.find((m) => m.value === r.measure)!.label
  const group = GROUPS.find((g) => g.value === r.groupBy)!.label
  const valid = r.name.trim().length > 0

  const save = () => {
    if (!valid) return
    onSave({ ...r, name: r.name.trim(), id: report?.id ?? `rep-${Date.now().toString(36)}` })
    toast.success(report ? `Saved “${r.name.trim()}”` : `“${r.name.trim()}” added to Saved reports`)
  }

  return (
    <AppShell sidebar={sidebar}>
      <Panel>
        <PageHeader
          icon={report ? 'reports' : 'plus'}
          title={report ? report.name : 'New report'}
          actions={
            <>
              <Button variant="secondary" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={save} disabled={!valid}>
                Save report
              </Button>
            </>
          }
        />
        <div className="flex min-h-0 flex-1">
          <form
            aria-label="Report settings"
            className="flex w-80 shrink-0 flex-col gap-4 overflow-y-auto border-r p-5"
            onSubmit={(e) => {
              e.preventDefault()
              save()
            }}
          >
            <FormField label="Name" required error={valid ? undefined : 'Give the report a name'}>
              <Input value={r.name} onChange={(e) => set({ name: e.target.value })} />
            </FormField>
            <FormField label="Measure">
              <Select
                value={r.measure}
                onValueChange={(v) => set({ measure: v as SavedReport['measure'] })}
                options={MEASURES}
              />
            </FormField>
            <FormField label="Group by">
              <Select
                value={r.groupBy}
                onValueChange={(v) => set({ groupBy: v as SavedReport['groupBy'] })}
                options={GROUPS}
              />
            </FormField>
            <FormField label="Split by">
              <Select
                value={r.splitBy}
                onValueChange={(v) => set({ splitBy: v as SavedReport['splitBy'] })}
                options={SPLITS}
              />
            </FormField>
            <FormField label="Time range">
              <Select
                value={r.range}
                onValueChange={(v) => set({ range: v as SavedReport['range'] })}
                options={RANGES}
              />
            </FormField>
            <div className="flex flex-col gap-2">
              <span className="text-label text-foreground">Filters</span>
              <div className="flex flex-wrap gap-1.5">
                {r.filters.map((f) => (
                  <Badge
                    key={f}
                    variant="outline"
                    onRemove={() => set({ filters: r.filters.filter((x) => x !== f) })}
                    removeLabel={`Remove ${f}`}
                  >
                    {f}
                  </Badge>
                ))}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" leadingIcon="plus">
                      Add filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64">
                    {FILTER_OPTIONS.filter((f) => !r.filters.includes(f)).map((f) => (
                      <DropdownMenuItem
                        key={f}
                        onSelect={() => set({ filters: [...r.filters, f] })}
                      >
                        {f}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <fieldset className="flex flex-col gap-2">
              <legend className="pb-2 text-label text-foreground">Chart</legend>
              <div role="radiogroup" aria-label="Chart" className="flex gap-1.5">
                {CHARTS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    role="radio"
                    aria-checked={r.chart === c.value}
                    onClick={() => set({ chart: c.value })}
                    className={cn(
                      'rounded-sm border px-3 py-1 text-small transition-colors duration-150 outline-none',
                      'hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring',
                      r.chart === c.value
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'text-muted-foreground',
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </fieldset>
          </form>

          <PanelBody className="flex flex-col gap-4 p-5">
            <div className="flex items-center gap-2 text-small text-muted-foreground">
              <span className="flex-1">Preview</span>
              <span>Updated just now · {sum} total</span>
            </div>
            <ChartCard
              className="shrink-0"
              title={r.name || 'Untitled report'}
              meta={`${measure} by ${group.toLowerCase()}`}
              footer={
                r.chart === 'bar' ? (
                  <ChartLegend
                    items={[
                      { label: split ? 'All' : measure, swatch: 'bg-primary' },
                      ...(split ? [{ label: split, swatch: 'bg-chart-neutral' }] : []),
                    ]}
                  />
                ) : undefined
              }
            >
              {r.chart === 'bar' ? (
                <BarChart
                  label={`${measure} by ${group}`}
                  data={data.map((d) => ({
                    label: d.label,
                    values: (split ? { all: d.all, part: d.part ?? 0 } : { all: d.all }) as Record<
                      string,
                      number
                    >,
                  }))}
                  series={[
                    { key: 'all', label: split ? 'All' : measure, fill: 'bg-primary' },
                    ...(split ? [{ key: 'part', label: split, fill: 'bg-chart-neutral' }] : []),
                  ]}
                />
              ) : r.chart === 'number' ? (
                <div className="flex flex-col items-center gap-1 py-10">
                  <span className="text-display text-foreground tabular-nums">{sum}</span>
                  <span className="text-small text-muted-foreground">
                    {measure} · {RANGES.find((x) => x.value === r.range)!.label}
                  </span>
                </div>
              ) : (
                <table className="w-full text-left text-body">
                  <thead className="border-b text-small text-muted-foreground">
                    <tr>
                      <th className="h-9 font-normal">{group}</th>
                      <th className="w-32 font-normal">{measure}</th>
                      {split && <th className="w-32 font-normal">{split}</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((d) => (
                      <tr key={d.label} className="border-b last:border-b-0">
                        <td className="h-10">{d.label}</td>
                        <td className="tabular-nums">{d.all}</td>
                        {split && <td className="tabular-nums">{d.part}</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </ChartCard>
            <p className="flex items-center gap-2 rounded-md bg-muted px-4 py-3 text-small text-muted-foreground">
              <Icon name="check" size={14} />
              Saved reports appear under “Saved reports” in the sidebar. Values are illustrative.
            </p>
          </PanelBody>
        </div>
      </Panel>
    </AppShell>
  )
}
