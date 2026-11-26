import type { ReactNode } from 'react'
import { Button, Icon, Progress, Skeleton, type IconName } from '@/components/atoms'
import { EmptyState } from '@/components/molecules'
import { PageHeader } from '@/components/organisms'
import { AppShell, Panel, PanelBody } from '@/components/templates'
import { cn } from '@/lib/utils'

function StateShell({
  sidebar,
  icon,
  title,
  children,
}: {
  sidebar?: ReactNode
  icon: IconName
  title: string
  children: ReactNode
}) {
  return (
    <AppShell sidebar={sidebar}>
      <Panel>
        <PageHeader icon={icon} title={title} />
        <PanelBody className="grid place-items-center">{children}</PanelBody>
      </Panel>
    </AppShell>
  )
}

/** Figma X24 · 404. */
export function NotFoundPage({
  sidebar,
  onHome,
  onSearch,
  onContact,
}: {
  sidebar?: ReactNode
  onHome: () => void
  onSearch: () => void
  onContact: () => void
}) {
  return (
    <StateShell sidebar={sidebar} icon="help" title="Not found">
      <EmptyState
        type="no-results"
        title="We can’t find that page"
        description="The link may be old, or the ticket was merged or deleted. Check the address or search for it."
        action={
          <div className="flex flex-col items-center gap-3">
            <Button size="sm" onClick={onHome}>
              Go to My tickets
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onSearch}>
                Search tickets
              </Button>
              <Button variant="ghost" size="sm" onClick={onContact}>
                Contact an admin
              </Button>
            </div>
          </div>
        }
      />
    </StateShell>
  )
}

/** Figma X25 · 403. */
export function ForbiddenPage({
  sidebar,
  area,
  onRequest,
  onBack,
  requested,
}: {
  sidebar?: ReactNode
  area: string
  onRequest: () => void
  onBack: () => void
  requested?: boolean
}) {
  return (
    <StateShell sidebar={sidebar} icon="lock" title={area}>
      <EmptyState
        type="no-access"
        title={`You don’t have access to ${area}`}
        description="Only admins can see billing and backups. Ask an admin to change your role in Team → Roles & permissions."
        action={
          <div className="flex flex-col items-center gap-3">
            <Button size="sm" disabled={requested} onClick={onRequest}>
              {requested ? 'Access requested' : 'Request access'}
            </Button>
            <Button variant="ghost" size="sm" onClick={onBack}>
              Back to settings
            </Button>
          </div>
        }
      />
    </StateShell>
  )
}

/** Figma H5 · Loading — skeleton rows shaped like the ticket list. */
export function ListLoadingPage({
  sidebar,
  title,
  icon = 'inbox',
}: {
  sidebar?: ReactNode
  title: string
  icon?: IconName
}) {
  return (
    <AppShell sidebar={sidebar}>
      <Panel aria-busy="true">
        <PageHeader icon={icon} title={title} />
        <PanelBody>
          <span className="sr-only">Loading tickets…</span>
          {Array.from({ length: 14 }, (_, i) => (
            <div key={i} className="flex h-10 items-center gap-4 border-b px-4">
              <Skeleton shape="circle" className="size-3.5" />
              <Skeleton className={cn('h-3', ['w-28', 'w-40', 'w-32'][i % 3])} />
              <Skeleton className={cn('h-3', ['w-80', 'w-60', 'w-96', 'w-72'][i % 4])} />
              <span className="flex-1" />
              <Skeleton className="h-3 w-10" />
              <Skeleton shape="circle" className="size-5" />
              <Skeleton className="h-3 w-8" />
            </div>
          ))}
        </PanelBody>
      </Panel>
    </AppShell>
  )
}

/** Figma H6 · Couldn't load. */
export function ListErrorPage({
  sidebar,
  title,
  icon = 'inbox',
  onRetry,
  onStatus,
}: {
  sidebar?: ReactNode
  title: string
  icon?: IconName
  onRetry: () => void
  onStatus: () => void
}) {
  return (
    <StateShell sidebar={sidebar} icon={icon} title={title}>
      <div className="flex flex-col items-center gap-2">
        <EmptyState
          type="error"
          title="Couldn’t load your tickets"
          description="The server didn’t respond. Your work is safe — nothing was lost."
          action={
            <div className="flex gap-2">
              <Button size="sm" onClick={onRetry}>
                Try again
              </Button>
              <Button variant="secondary" size="sm" onClick={onStatus}>
                Status page
              </Button>
            </div>
          }
        />
        <p className="text-small text-muted-foreground">Error 503 · request id 8f2c-41ab</p>
      </div>
    </StateShell>
  )
}

/** Figma X26 · Offline banner over the page, with a queued-replies pill. */
export function OfflineBanner({
  since,
  queued,
  onRetry,
}: {
  since: string
  queued: number
  onRetry: () => void
}) {
  return (
    <>
      <div
        role="alert"
        className="fixed inset-x-0 top-16 z-50 mx-auto w-[min(52rem,calc(100%-2rem))] overflow-hidden rounded-lg border border-warning/40 bg-card shadow-lg"
      >
        <div className="flex items-center gap-3 bg-warning-soft px-4 py-2.5">
          <Icon name="warning" size={16} className="text-warning" />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-body-strong text-warning">You’re offline</span>
            <span className="text-small text-foreground">
              Showing tickets from {since}. Replies you send are queued and go out when you
              reconnect.
            </span>
          </span>
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Retry now
          </Button>
        </div>
      </div>
      {queued > 0 && (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-primary px-4 py-1.5 text-small text-primary-foreground">
          {queued} {queued === 1 ? 'reply' : 'replies'} queued · reconnecting…
        </div>
      )}
    </>
  )
}

export interface SetupStep {
  id: string
  title: string
  detail: string
  done: boolean
  icon: IconName
  action: string
  onAction: () => void
}

/** Figma X29 · Set up your helpdesk. */
export function SetupChecklistPage({
  sidebar,
  steps,
  onSkip,
}: {
  sidebar?: ReactNode
  steps: SetupStep[]
  onSkip: () => void
}) {
  const done = steps.filter((s) => s.done).length
  const next = steps.find((s) => !s.done)
  return (
    <AppShell sidebar={sidebar}>
      <Panel>
        <PageHeader icon="check" title="Welcome to TBT Support" />
        <PanelBody className="px-6">
          <div className="mx-auto flex w-full max-w-150 flex-col gap-4 py-12">
            <div className="flex flex-col gap-1">
              <h2 className="text-heading-1 text-foreground">
                {done === steps.length ? 'Your helpdesk is ready' : 'Set up your helpdesk'}
              </h2>
              <p className="text-body text-muted-foreground">
                Five steps, about 15 minutes. You can skip any of them and come back from Settings.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Progress
                value={(done / steps.length) * 100}
                className="flex-1"
                aria-label="Setup progress"
              />
              <span className="text-small text-muted-foreground tabular-nums">
                {done} of {steps.length} done
              </span>
            </div>
            <ol className="overflow-hidden rounded-lg border">
              {steps.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0"
                >
                  <span
                    className={cn(
                      'grid size-6 place-items-center rounded-full',
                      s.done
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    <Icon name={s.done ? 'check' : s.icon} size={14} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-body text-foreground">{s.title}</span>
                    <span className="truncate text-small text-muted-foreground">{s.detail}</span>
                  </span>
                  {s.done ? (
                    <span className="text-small text-muted-foreground">Done</span>
                  ) : (
                    <Button
                      size="sm"
                      variant={s === next ? 'primary' : 'secondary'}
                      onClick={s.onAction}
                    >
                      {s.action}
                    </Button>
                  )}
                </li>
              ))}
            </ol>
            <div className="flex items-center justify-between text-small text-muted-foreground">
              <span>Need help? Book a 20-minute setup call.</span>
              <Button variant="ghost" size="sm" onClick={onSkip}>
                {done === steps.length ? 'Go to inbox' : 'Skip for now'}
              </Button>
            </div>
          </div>
        </PanelBody>
      </Panel>
    </AppShell>
  )
}
