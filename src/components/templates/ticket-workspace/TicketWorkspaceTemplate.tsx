import type { ReactNode } from 'react'
import { AppShell, Panel, PanelBody, type AppShellProps } from '../app-shell'

export interface TicketWorkspaceTemplateProps extends Omit<AppShellProps, 'children'> {
  /** Left panel (320): a list header + TicketListItems. Omit for a focused ticket view. */
  list?: ReactNode
  /** Conversation header: breadcrumb, subject and Snooze / Resolve actions. */
  header: ReactNode
  /** Tabs under the header (Conversation · Original email · Attachments · Timeline). */
  tabs?: ReactNode
  /** The conversation or timeline. Scrolls; leaves room at the bottom for the composer. */
  children: ReactNode
  /** <ComposerBar /> floating over the bottom of the conversation. */
  composer?: ReactNode
  /** Right column (300): stacked cards — ticket details, customer, linked records. */
  details?: ReactNode
}

/**
 * Ticket detail (Figma Interface · T3 Ticket): list 320 · conversation · details 300.
 * The sidebar is usually collapsed to the rail here to give the conversation room.
 */
export function TicketWorkspaceTemplate({
  sidebar,
  list,
  header,
  tabs,
  children,
  composer,
  details,
  ...props
}: TicketWorkspaceTemplateProps) {
  return (
    <AppShell sidebar={sidebar} data-template="ticket-workspace" {...props}>
      {list && <Panel width={320}>{list}</Panel>}
      <Panel className="relative">
        {header}
        {tabs && <div className="shrink-0 border-b">{tabs}</div>}
        <PanelBody className={composer ? 'pb-20' : undefined}>{children}</PanelBody>
        {composer && <div className="absolute inset-x-0 bottom-0">{composer}</div>}
      </Panel>
      {details && (
        <Panel width={300} surface="plain">
          {details}
        </Panel>
      )}
    </AppShell>
  )
}
