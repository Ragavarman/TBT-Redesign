import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { AppShell, Panel, PanelBody, type AppShellProps } from '../app-shell'

export interface ListPageTemplateProps extends Omit<AppShellProps, 'children'> {
  /** <PageHeader /> with the view's title, count and actions. */
  header: ReactNode
  /**
   * Strip between the header and the list: status tabs, a notice, or a BulkActionBar
   * when rows are selected.
   */
  toolbar?: ReactNode
  /** The list itself: a DataTable or rows. It runs edge to edge and scrolls. */
  children: ReactNode
  /** Under the list, outside the scroll area, e.g. Pagination. */
  footer?: ReactNode
  /** Right-hand panel, e.g. a record preview. */
  aside?: ReactNode
  /** Width of the aside panel. Default 360. */
  asideWidth?: number
}

/**
 * Tickets table, Customers, Inventory, Knowledge (Figma Interface · list pages):
 * one main panel with header, optional toolbar, full-bleed scrolling list and footer.
 */
export function ListPageTemplate({
  sidebar,
  header,
  toolbar,
  children,
  footer,
  aside,
  asideWidth = 360,
  ...props
}: ListPageTemplateProps) {
  return (
    <AppShell sidebar={sidebar} data-template="list-page" {...props}>
      <Panel>
        {header}
        {toolbar && <div className="shrink-0 border-b">{toolbar}</div>}
        <PanelBody>{children}</PanelBody>
        {footer && (
          <div className={cn('flex shrink-0 items-center border-t px-4 py-2')}>{footer}</div>
        )}
      </Panel>
      {aside && <Panel width={asideWidth}>{aside}</Panel>}
    </AppShell>
  )
}
