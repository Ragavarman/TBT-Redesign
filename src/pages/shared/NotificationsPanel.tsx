import { useEffect, useRef, useState } from 'react'
import { Avatar, Button } from '@/components/atoms'
import { EmptyState } from '@/components/molecules'
import { useHotkeys } from '@/hooks/useHotkeys'
import { cn } from '@/lib/utils'
import type { AppNotification } from '@/mocks'

const TABS = ['All', 'Mentions', 'Unread'] as const

export interface NotificationsPanelProps {
  open: boolean
  onClose: () => void
  items: AppNotification[]
  onOpen: (n: AppNotification) => void
  onMarkAllRead: () => void
  onSettings: () => void
}

/** Figma H2 · Notifications — a panel next to the rail's bell. */
export function NotificationsPanel({
  open,
  onClose,
  items,
  onOpen,
  onMarkAllRead,
  onSettings,
}: NotificationsPanelProps) {
  const [tab, setTab] = useState<(typeof TABS)[number]>('All')
  const ref = useRef<HTMLDivElement>(null)

  useHotkeys({ escape: onClose }, open)
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement
      if (ref.current?.contains(t) || t.closest('button[aria-label="Notifications"]')) return
      onClose()
    }
    document.addEventListener('pointerdown', onDown)
    ref.current?.focus()
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open, onClose])

  if (!open) return null
  const count = (t: (typeof TABS)[number]) =>
    t === 'Mentions'
      ? items.filter((n) => n.kind === 'mention').length
      : t === 'Unread'
        ? items.filter((n) => n.unread).length
        : 0
  const shown = items.filter((n) =>
    tab === 'Mentions' ? n.kind === 'mention' : tab === 'Unread' ? n.unread : true,
  )

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Notifications"
      tabIndex={-1}
      className="fixed bottom-16 left-16 z-50 flex max-h-[min(36rem,calc(100vh-6rem))] w-96 flex-col rounded-xl border bg-popover shadow-lg outline-none"
    >
      <header className="flex items-center gap-2 px-4 pt-3 pb-2">
        <h2 className="flex-1 text-body-strong text-foreground">Notifications</h2>
        <Button variant="ghost" size="sm" disabled={!count('Unread')} onClick={onMarkAllRead}>
          Mark all read
        </Button>
      </header>
      <div role="tablist" className="flex gap-1 border-b px-3 pb-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              'rounded-md px-2 py-1 text-small',
              tab === t
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t}
            {count(t) > 0 && (
              <span className="ms-1 text-muted-foreground tabular-nums">{count(t)}</span>
            )}
          </button>
        ))}
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto py-1">
        {shown.map((n) => (
          <li key={n.id}>
            <button
              type="button"
              onClick={() => onOpen(n)}
              className="flex w-full items-start gap-3 px-4 py-2.5 text-start outline-none hover:bg-accent focus-visible:bg-accent"
            >
              <Avatar name={n.from} size="sm" aria-hidden />
              <span className="flex min-w-0 flex-1 flex-col">
                <span
                  className={cn(
                    'truncate text-body',
                    n.unread ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {n.title}
                </span>
                <span className="truncate text-small text-muted-foreground">{n.detail}</span>
              </span>
              <span className="flex flex-col items-end gap-1.5">
                <span className="text-small whitespace-nowrap text-muted-foreground">{n.when}</span>
                {n.unread && (
                  <span aria-label="Unread" className="size-1.5 rounded-full bg-primary" />
                )}
              </span>
            </button>
          </li>
        ))}
        {!shown.length && (
          <EmptyState
            title="You’re all caught up"
            description="New mentions, replies and SLA alerts show up here."
          />
        )}
      </ul>
      <footer className="border-t px-2 py-1.5">
        <Button variant="ghost" size="sm" onClick={onSettings}>
          Notification settings
        </Button>
      </footer>
    </div>
  )
}
