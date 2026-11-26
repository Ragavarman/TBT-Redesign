import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import { toast } from '@/components/molecules'
import { useHotkeys } from '@/hooks/useHotkeys'
import { wsNotifications, type AppNotification } from '@/mocks'
import { SessionExpiredDialog } from '@/pages/shared/AuthPages'
import { CommandMenu, type CommandAction } from '@/pages/shared/CommandMenu'
import { NotificationsPanel } from '@/pages/shared/NotificationsPanel'
import { ShortcutsDialog } from '@/pages/shared/ShortcutsDialog'
import { OfflineBanner } from '@/pages/shared/StatePages'
import { useCollection } from './collections-context'
import { useCustomers } from './customers-context'
import { searchAll } from './search-index'
import { ShellContext, type ShellValue } from './shell-context'
import { useInventoryItems, useNotes } from './stores'
import { useWorkspace } from './workspace-context'

/** G then a key — go to a module (Figma X13). */
const GO: Record<string, string> = {
  i: '/inbox',
  c: '/customers',
  r: '/reports',
  s: '/settings',
  k: '/knowledge',
  t: '/team',
}

const timeNow = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

/**
 * App-wide overlays and shortcuts (Figma Shared): Ctrl K command menu, notifications panel,
 * ? shortcuts, G-then-key navigation, offline banner (X26) and session expiry (X23).
 * Demo states: ?demo=offline · expired · search · notifications · shortcuts.
 */
export function ShellOverlays({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [params, setParams] = useSearchParams()
  const { tickets, newTicket } = useWorkspace()
  const { records, editCustomer } = useCustomers()
  const notes = useNotes()
  const items = useInventoryItems()
  const notifications = useCollection<AppNotification>('notifications', wsNotifications)

  const demo = params.get('demo')
  const [search, setSearch] = useState(demo === 'search')
  const [panel, setPanel] = useState(demo === 'notifications')
  const [shortcuts, setShortcuts] = useState(demo === 'shortcuts')
  const [offlineSince, setOfflineSince] = useState<string | null>(() =>
    typeof navigator !== 'undefined' && !navigator.onLine ? timeNow() : null,
  )
  const offline = offlineSince ?? (demo === 'offline' ? '10:42 AM' : null)
  const expired = demo === 'expired'

  const clearDemo = useCallback(() => {
    const next = new URLSearchParams(params)
    next.delete('demo')
    setParams(next, { replace: true })
  }, [params, setParams])

  // real connectivity
  useEffect(() => {
    const off = () => setOfflineSince(timeNow())
    const on = () => {
      setOfflineSince(null)
      toast.success('Back online')
    }
    window.addEventListener('offline', off)
    window.addEventListener('online', on)
    return () => {
      window.removeEventListener('offline', off)
      window.removeEventListener('online', on)
    }
  }, [])

  // Ctrl/⌘ K anywhere, even while typing
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPanel(false)
        setSearch((s) => !s)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // ? and G-then-key
  const pendingG = useRef(0)
  const go = (k: string) => () => {
    if (Date.now() - pendingG.current > 1200) return false
    pendingG.current = 0
    if (k === 'n') setPanel(true)
    else navigate(GO[k]!)
    return true
  }
  const goKeys = Object.fromEntries([...Object.keys(GO), 'n'].map((k) => [k, go(k)] as const))
  useHotkeys({
    g: () => {
      pendingG.current = Date.now()
    },
    'shift+?': () => setShortcuts(true),
    '?': () => setShortcuts(true),
  })
  // G-sequences run in the capture phase so a following C/I/… doesn't also trigger its own shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!pendingG.current || e.ctrlKey || e.metaKey || e.altKey) return
      const k = e.key.toLowerCase()
      if (k === 'g') return
      const handler = goKeys[k]
      if (handler && handler()) {
        e.preventDefault()
        e.stopImmediatePropagation()
      } else pendingG.current = 0
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  })

  const sources = useMemo(
    () => ({ tickets, records, notes: notes.items, items: items.items }),
    [tickets, records, notes.items, items.items],
  )
  const actions: CommandAction[] = [
    { id: 'new-ticket', label: 'New ticket', icon: 'plus', keys: 'C', run: () => newTicket() },
    {
      id: 'new-customer',
      label: 'Add customer',
      icon: 'customers',
      run: () => (navigate('/customers/all'), editCustomer()),
    },
    {
      id: 'reports',
      label: 'Go to Reports',
      icon: 'reports',
      keys: 'G R',
      run: () => navigate('/reports'),
    },
    {
      id: 'settings',
      label: 'Go to Settings',
      icon: 'settings',
      keys: 'G S',
      run: () => navigate('/settings'),
    },
    {
      id: 'notifications',
      label: 'Show notifications',
      icon: 'bell',
      keys: 'G N',
      run: () => setPanel(true),
    },
    {
      id: 'shortcuts',
      label: 'Keyboard shortcuts',
      icon: 'help',
      keys: '?',
      run: () => setShortcuts(true),
    },
    { id: 'setup', label: 'Setup checklist', icon: 'check', run: () => navigate('/welcome') },
    { id: 'sign-out', label: 'Sign out', icon: 'log-out', run: () => navigate('/signin') },
  ]

  const unread = notifications.items.filter((n) => n.unread).length
  const shell = useMemo<ShellValue>(
    () => ({
      openSearch: () => (setPanel(false), setSearch(true)),
      toggleNotifications: () => setPanel((p) => !p),
      openShortcuts: () => setShortcuts(true),
      unreadNotifications: unread,
    }),
    [unread],
  )
  const closePanel = useCallback(() => setPanel(false), [])

  return (
    <ShellContext.Provider value={shell}>
      {children}
      <CommandMenu
        open={search}
        onOpenChange={setSearch}
        search={(q) => searchAll(q, sources)}
        actions={actions}
        onOpenHit={(h) => navigate(h.path)}
        onSeeAll={(q) => navigate(`/search?q=${encodeURIComponent(q)}`)}
      />
      <NotificationsPanel
        open={panel}
        onClose={closePanel}
        items={notifications.items}
        onOpen={(n) => {
          notifications.update(n.id, { unread: false })
          setPanel(false)
          navigate(n.path)
        }}
        onMarkAllRead={() =>
          notifications.replace(notifications.items.map((n) => ({ ...n, unread: false })))
        }
        onSettings={() => (setPanel(false), navigate('/settings/notifications'))}
      />
      <ShortcutsDialog open={shortcuts} onOpenChange={setShortcuts} />
      {offline && (
        <OfflineBanner
          since={offline}
          queued={demo === 'offline' ? 1 : 0}
          onRetry={() => {
            if (navigator.onLine) {
              setOfflineSince(null)
              if (demo === 'offline') clearDemo()
              toast.success('Back online')
            } else toast.error('Still offline — we’ll keep trying')
          }}
        />
      )}
      <SessionExpiredDialog
        open={expired}
        email="lead@tbt.lk"
        draftNote={
          location.pathname.startsWith('/inbox/') ? 'your draft reply was saved' : undefined
        }
        onSignIn={() => (clearDemo(), toast.success('Signed in again'))}
        onOtherAccount={() => navigate('/signin')}
      />
    </ShellContext.Provider>
  )
}
