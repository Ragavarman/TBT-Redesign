import type { ReactNode } from 'react'
import { AppShell, Panel, PanelBody, type AppShellProps } from '../app-shell'

export interface SettingsTemplateProps extends Omit<AppShellProps, 'children' | 'title'> {
  /** <PageHeader /> with the page name and Save changes. */
  header: ReactNode
  /** Page heading (Heading 1) at the top of the column. */
  title: ReactNode
  /** One line under the heading (Body, muted). */
  description?: ReactNode
  /** <SettingsSection />s. */
  children: ReactNode
}

/**
 * Settings pages (Figma Interface · S1 Settings): header over a centred 760px column with
 * 32px top/bottom padding and 16px between groups.
 */
export function SettingsTemplate({
  sidebar,
  header,
  title,
  description,
  children,
  ...props
}: SettingsTemplateProps) {
  return (
    <AppShell sidebar={sidebar} data-template="settings" {...props}>
      <Panel>
        {header}
        <PanelBody className="px-6">
          <div className="mx-auto flex w-full max-w-190 flex-col gap-4 py-8">
            <div className="flex flex-col gap-1">
              <h2 className="text-heading-1 text-foreground">{title}</h2>
              {description && <p className="text-body text-muted-foreground">{description}</p>}
            </div>
            {children}
          </div>
        </PanelBody>
      </Panel>
    </AppShell>
  )
}
