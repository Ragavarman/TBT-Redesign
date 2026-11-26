import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { toast } from '@/components/molecules'
import { ForgotPasswordPage, SignInPage } from '@/pages/shared/AuthPages'
import { PersonCell, ResourceListPage } from '@/pages/kit/ResourceListPage'
import { SearchResultsPage } from '@/pages/shared/SearchResultsPage'
import {
  ForbiddenPage,
  ListErrorPage,
  ListLoadingPage,
  NotFoundPage,
  SetupChecklistPage,
} from '@/pages/shared/StatePages'
import { AppSidebar } from './AppSidebar'
import { useCustomers } from './customers-context'
import { didYouMean, searchAll } from './search-index'
import { useShell } from './shell-context'
import {
  useApplications,
  useInventoryItems,
  useInvites,
  useNotes,
  useRingCentralDoc,
  useZendeskDoc,
} from './stores'
import { useWorkspace } from './workspace-context'

/** /search?q= (Figma X28, H7). */
export function SearchRoute() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const { tickets } = useWorkspace()
  const { records } = useCustomers()
  const notes = useNotes()
  const items = useInventoryItems()
  const sources = { tickets, records, notes: notes.items, items: items.items }
  const hits = searchAll(q, sources)
  return (
    <SearchResultsPage
      key={q}
      sidebar={<AppSidebar />}
      query={q}
      onQuery={(next) => setParams(next ? { q: next } : {})}
      hits={hits}
      suggestions={hits.length ? [] : didYouMean(q, sources)}
      onOpen={(h) => navigate(h.path)}
    />
  )
}

/** /welcome (Figma X29) — each step reflects the workspace's real state. */
export function WelcomeRoute() {
  const navigate = useNavigate()
  const apps = useApplications()
  const invites = useInvites()
  const [zendesk, saveZendesk] = useZendeskDoc()
  const [rc, saveRc] = useRingCentralDoc()
  const zd = zendesk
  const ring = rc
  return (
    <SetupChecklistPage
      sidebar={<AppSidebar />}
      onSkip={() => navigate('/inbox/my-tickets')}
      steps={[
        {
          id: 'ws',
          title: 'Create your workspace',
          detail: 'TBT Support · MDI Solutions',
          done: true,
          icon: 'settings',
          action: 'Open',
          onAction: () => navigate('/settings/general'),
        },
        {
          id: 'apps',
          title: 'Add applications',
          detail:
            apps.items.map((a) => a.name).join(', ') || 'Products your customers get support for',
          done: apps.items.length > 0,
          icon: 'inventory',
          action: 'Add',
          onAction: () => navigate('/settings/applications'),
        },
        {
          id: 'zd',
          title: 'Connect Zendesk',
          detail: 'Import tickets and customers, matched by phone',
          done: zd.connected === true,
          icon: 'mail',
          action: 'Connect',
          onAction: () => (
            saveZendesk({ ...zd, connected: true, lastSync: 'just now' }),
            toast.success('Zendesk connected')
          ),
        },
        {
          id: 'rc',
          title: 'Connect RingCentral',
          detail: 'Turn calls and voicemails into tickets',
          done: ring.connected === true,
          icon: 'phone',
          action: 'Connect',
          onAction: () => (
            saveRc({ ...ring, connected: true }),
            toast.success('RingCentral connected')
          ),
        },
        {
          id: 'team',
          title: 'Invite your team',
          detail: invites.items.length
            ? `${invites.items.length} invites pending`
            : 'Agents get an email to set a password',
          done: invites.items.length > 2,
          icon: 'team',
          action: 'Invite',
          onAction: () => navigate('/team/invites'),
        },
      ]}
    />
  )
}

/** /signin and /forgot (Figma H3, H4) — outside the app shell. */
export function SignInRoute() {
  const navigate = useNavigate()
  return (
    <SignInPage
      onSignIn={() => (navigate('/inbox/my-tickets'), toast.success('Welcome back'))}
      onForgot={(email) => navigate(`/forgot${email ? `?email=${encodeURIComponent(email)}` : ''}`)}
    />
  )
}
export function ForgotRoute() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  return (
    <ForgotPasswordPage
      initialEmail={params.get('email') ?? ''}
      onBack={() => navigate('/signin')}
    />
  )
}

/** Any address that doesn't exist (Figma X24). */
export function NotFoundRoute() {
  const navigate = useNavigate()
  const shell = useShell()
  return (
    <NotFoundPage
      sidebar={<AppSidebar />}
      onHome={() => navigate('/inbox/my-tickets')}
      onSearch={shell.openSearch}
      onContact={() => toast.success('Message sent to your admins')}
    />
  )
}

/** /settings/billing — admin only (Figma X25). */
export function BillingRoute() {
  const navigate = useNavigate()
  const [requested, setRequested] = useState(false)
  return (
    <ForbiddenPage
      sidebar={<AppSidebar />}
      area="Billing"
      requested={requested}
      onRequest={() => (setRequested(true), toast.success('Request sent to your admins'))}
      onBack={() => navigate('/settings/general')}
    />
  )
}

/** Inbox ?demo=loading | ?demo=error (Figma H5, H6). */
export function InboxDemoState({ demo, title }: { demo: string; title: string }) {
  const [params, setParams] = useSearchParams()
  const clear = () => {
    const next = new URLSearchParams(params)
    next.delete('demo')
    setParams(next, { replace: true })
  }
  if (demo === 'loading') return <ListLoadingPage sidebar={<AppSidebar />} title={title} />
  return (
    <ListErrorPage
      sidebar={<AppSidebar />}
      title={title}
      onRetry={clear}
      onStatus={() => toast('status.tbt.lk — all systems normal')}
    />
  )
}

/** /customers/locations — customers grouped by where they are. */
export function CustomerLocationsRoute() {
  const navigate = useNavigate()
  const { records } = useCustomers()
  const { tickets } = useWorkspace()
  const items = useInventoryItems()
  const byLocation = new Map<string, typeof records>()
  for (const r of records) {
    const loc = r.profile.location || 'Unknown'
    byLocation.set(loc, [...(byLocation.get(loc) ?? []), r])
  }
  const rows = [...byLocation.entries()].map(([name, rs]) => {
    const ids = new Set(rs.map((r) => r.customer.id))
    return {
      id: name,
      name,
      customers: rs.length,
      main: rs[0]!.customer.name,
      open: tickets.filter(
        (t) => ids.has(t.requester.id) && t.status !== 'resolved' && t.status !== 'closed',
      ).length,
      assets:
        rs.reduce((n, r) => n + r.profile.assets.length, 0) +
        items.items.filter((i) => i.location === name).length,
    }
  })
  return (
    <ResourceListPage
      sidebar={<AppSidebar />}
      icon="customers"
      title="Locations"
      rows={rows}
      getId={(r) => r.id}
      searchText={(r) => r.name}
      onRowClick={(r) => navigate(`/customers/all?q=${encodeURIComponent(r.main)}`)}
      columns={[
        { key: 'name', label: 'Location', sort: (r) => r.name, render: (r) => r.name },
        {
          key: 'main',
          label: 'Main contact',
          className: 'w-48',
          render: (r) => <PersonCell name={r.main} />,
        },
        {
          key: 'customers',
          label: 'Customers',
          className: 'w-28',
          sort: (r) => r.customers,
          render: (r) => <span className="tabular-nums">{r.customers}</span>,
        },
        {
          key: 'open',
          label: 'Open tickets',
          className: 'w-28',
          sort: (r) => r.open,
          render: (r) => <span className="tabular-nums">{r.open}</span>,
        },
        {
          key: 'assets',
          label: 'Assets',
          className: 'w-24',
          sort: (r) => r.assets,
          render: (r) => <span className="tabular-nums">{r.assets}</span>,
        },
      ]}
    />
  )
}
