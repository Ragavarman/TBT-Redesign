import type { ReactNode } from 'react'
import { AppShell, Panel, PanelBody, type AppShellProps } from '../app-shell'

export interface ProfileTemplateProps extends Omit<AppShellProps, 'children'> {
  /** <PageHeader /> — usually a breadcrumb title and Merge / Edit / New ticket. */
  header: ReactNode
  /** Who it is: avatar, name, contact line, tags. */
  intro: ReactNode
  /** Tabs under the intro (Tickets · Notes · Assets · Calls). */
  tabs?: ReactNode
  /** The active tab. Scrolls. */
  children: ReactNode
  /** Right column (300): Details / Activity cards. Scrolls on its own. */
  aside?: ReactNode
}

/**
 * Record profile (Figma Interface · 05b Customer — Profile): one panel with a header, then the
 * main column (intro · tabs · content) beside a 300px details column split by a rule.
 */
export function ProfileTemplate({
  sidebar,
  header,
  intro,
  tabs,
  children,
  aside,
  ...props
}: ProfileTemplateProps) {
  return (
    <AppShell sidebar={sidebar} data-template="profile" {...props}>
      <Panel>
        {header}
        <div className="flex min-h-0 flex-1">
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="shrink-0 px-5 pt-5">{intro}</div>
            {tabs && <div className="shrink-0 border-b px-4 pt-3 pb-2">{tabs}</div>}
            <PanelBody>{children}</PanelBody>
          </div>
          {aside && (
            <aside className="flex w-75 shrink-0 flex-col gap-3 overflow-y-auto border-l p-4">
              {aside}
            </aside>
          )}
        </div>
      </Panel>
    </AppShell>
  )
}
