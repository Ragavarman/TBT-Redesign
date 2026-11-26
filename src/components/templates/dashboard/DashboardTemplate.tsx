import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { AppShell, Panel, PanelBody, type AppShellProps } from '../app-shell'

export interface DashboardTemplateProps extends Omit<AppShellProps, 'children'> {
  /** <PageHeader /> with date range, filters and export. */
  header: ReactNode
  /** Rows of content: a KpiStrip, a <DashboardRow /> of ChartCards, a table card … */
  children: ReactNode
}

/**
 * Reports overview (Figma Interface · Reports): header over a scrolling content area,
 * 24px padding, 16px between rows.
 */
export function DashboardTemplate({ sidebar, header, children, ...props }: DashboardTemplateProps) {
  return (
    <AppShell sidebar={sidebar} data-template="dashboard" {...props}>
      <Panel>
        {header}
        <PanelBody className="flex flex-col gap-4 p-6">{children}</PanelBody>
      </Panel>
    </AppShell>
  )
}

/**
 * A row of cards. Give each child a `flex-[n]` (or a fixed width) to set the split —
 * Figma uses 694 : 360 for chart + breakdown.
 */
export function DashboardRow({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="dashboard-row"
      className={cn('flex shrink-0 items-stretch gap-4', className)}
      {...props}
    />
  )
}
