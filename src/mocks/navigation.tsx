import { StatusGlyph } from '@/components/atoms'
import type { NavSection, RailModule } from '@/components/organisms'

/** App rail modules (Figma 07 · App rail). */
export const railModules: RailModule[] = [
  { id: 'inbox', label: 'Inbox', icon: 'inbox', dot: true },
  { id: 'customers', label: 'Customers', icon: 'customers' },
  { id: 'reports', label: 'Reports', icon: 'reports' },
  { id: 'knowledge', label: 'Knowledge', icon: 'knowledge' },
  { id: 'inventory', label: 'Inventory', icon: 'inventory' },
  { id: 'team', label: 'Team', icon: 'team' },
]

export const railFooterModules: RailModule[] = [
  { id: 'search', label: 'Search', icon: 'search' },
  { id: 'notifications', label: 'Notifications', icon: 'bell' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
]

const glyph = (s: Parameters<typeof StatusGlyph>[0]['status']) => (
  <StatusGlyph status={s} label={null} />
)
const noop = () => {}

/** Sub-navigation per module — labels and counts from Figma 07 · Sub navigation / *. */
export const moduleNav: Record<string, { title: string; sections: NavSection[] }> = {
  inbox: {
    title: 'TBT Support',
    sections: [
      {
        id: 'mine',
        items: [
          { id: 'my-tickets', label: 'My tickets', icon: 'inbox', count: 8, unread: true },
          { id: 'mentions', label: 'Mentions', icon: 'bell', count: 2 },
          { id: 'created', label: 'Created by me', icon: 'plus', count: 4 },
        ],
      },
      {
        id: 'lifecycle',
        label: 'Lifecycle',
        collapsible: true,
        items: [
          {
            id: 'all',
            label: 'All tickets',
            icon: 'knowledge',
            count: 67,
            children: [
              {
                id: 'needs-response',
                label: 'Needs first response',
                icon: glyph('open'),
                count: 8,
              },
              {
                id: 'investigating',
                label: 'Investigating',
                icon: glyph('investigating'),
                count: 41,
              },
              { id: 'waiting', label: 'Waiting for customer', icon: glyph('waiting'), count: 12 },
              { id: 'on-hold', label: 'On hold', icon: glyph('on-hold'), count: 0 },
              { id: 'resolved', label: 'Resolved', icon: glyph('resolved'), count: 4 },
              { id: 'closed', label: 'Closed', icon: glyph('closed'), count: 2 },
            ],
          },
          { id: 'unassigned', label: 'Unassigned', icon: 'customers', count: 8 },
        ],
      },
      {
        id: 'views',
        label: 'Views',
        action: { label: 'New view', onClick: noop },
        items: [
          { id: 'sla-risk', label: 'SLA at risk', icon: 'reports', count: 3 },
          { id: 'high-urgent', label: 'High & urgent', icon: 'reports', count: 1 },
        ],
      },
      {
        id: 'favorites',
        label: 'Favorites',
        items: [{ id: 'team-alpha', label: 'Support Team Alpha', icon: 'team', count: 41 }],
      },
      {
        id: 'browse',
        label: 'Browse',
        items: [
          { id: 'teams', label: 'Teams', icon: 'team', chevron: true },
          { id: 'channels', label: 'Channels', icon: 'bell', chevron: true },
          { id: 'applications', label: 'Applications', icon: 'inventory', chevron: true },
          { id: 'customer-tags', label: 'Customer tags', icon: 'customers', chevron: true },
        ],
      },
    ],
  },
  reports: {
    title: 'Reports',
    sections: [
      {
        id: 'main',
        items: [
          { id: 'overview', label: 'Overview', icon: 'reports' },
          { id: 'volume', label: 'Ticket volume', icon: 'reports' },
          { id: 'sla', label: 'SLA performance', icon: 'reports' },
          { id: 'agents', label: 'Agents', icon: 'team' },
          { id: 'channels', label: 'Channels', icon: 'bell' },
        ],
      },
      {
        id: 'saved',
        label: 'Saved reports',
        items: [
          { id: 'weekly', label: 'Weekly summary', icon: 'knowledge' },
          { id: 'new', label: 'New report', icon: 'plus' },
        ],
      },
    ],
  },
  customers: {
    title: 'Customers',
    sections: [
      {
        id: 'main',
        items: [
          { id: 'all', label: 'All customers', icon: 'customers', count: 190 },
          { id: 'review', label: 'Needs review', icon: 'bell', count: 184 },
          { id: 'vip', label: 'VIP', icon: 'reports', count: 4 },
          { id: 'frequent', label: 'Frequent callers', icon: 'inbox', count: 12 },
        ],
      },
      {
        id: 'browse',
        label: 'Browse',
        items: [
          { id: 'companies', label: 'Companies', icon: 'inventory', count: 2 },
          { id: 'locations', label: 'Locations', icon: 'inventory', count: 4 },
          { id: 'tags', label: 'Tags', icon: 'knowledge', count: 6 },
        ],
      },
    ],
  },
  team: {
    title: 'Team',
    sections: [
      {
        id: 'main',
        items: [
          { id: 'agents', label: 'Agents', icon: 'team', count: 9 },
          { id: 'teams', label: 'Teams', icon: 'customers', count: 4 },
        ],
      },
      {
        id: 'teams-list',
        label: 'Teams',
        items: [
          { id: 'alpha', label: 'Support Team Alpha', icon: 'team', count: 2 },
          { id: 'beta', label: 'Technical Team Beta', icon: 'team', count: 2 },
          { id: 'gamma', label: 'Sales Team Gamma', icon: 'team', count: 2 },
        ],
      },
      {
        id: 'access',
        label: 'Access',
        items: [
          { id: 'roles', label: 'Roles & permissions', icon: 'settings' },
          { id: 'invites', label: 'Invites', icon: 'plus', count: 2 },
        ],
      },
    ],
  },
  inventory: {
    title: 'Inventory',
    sections: [
      {
        id: 'main',
        items: [
          { id: 'items', label: 'Items', icon: 'inventory', count: 12 },
          { id: 'brands', label: 'Brands', icon: 'knowledge', count: 5 },
          { id: 'categories', label: 'Categories', icon: 'customers', count: 6 },
          { id: 'locations', label: 'Locations', icon: 'inventory', count: 4 },
        ],
      },
      {
        id: 'condition',
        label: 'Condition',
        items: [
          { id: 'good', label: 'Good', icon: 'reports', count: 9 },
          { id: 'repair', label: 'Needs repair', icon: 'bell', count: 1 },
          { id: 'retired', label: 'Retired', icon: 'knowledge', count: 2 },
        ],
      },
    ],
  },
  knowledge: {
    title: 'Knowledge',
    sections: [
      {
        id: 'main',
        items: [
          { id: 'notes', label: 'Notes', icon: 'knowledge', count: 34 },
          { id: 'canned', label: 'Canned replies', icon: 'chat', count: 52 },
          { id: 'messages', label: 'Messages', icon: 'mail', count: 3 },
        ],
      },
      {
        id: 'folders',
        label: 'Folders',
        items: [
          { id: 'printers', label: 'Printers & POS', icon: 'layers', count: 12 },
          { id: 'billing', label: 'Billing', icon: 'layers', count: 9 },
          { id: 'accounts', label: 'Accounts & access', icon: 'layers', count: 8 },
          { id: 'onboarding', label: 'Onboarding', icon: 'layers', count: 5 },
        ],
      },
    ],
  },
  settings: {
    title: 'Settings',
    sections: [
      {
        id: 'account',
        label: 'Account',
        items: [
          { id: 'profile', label: 'Profile', icon: 'customers' },
          { id: 'security', label: 'Security', icon: 'settings' },
          { id: 'notifications', label: 'Notifications', icon: 'bell' },
        ],
      },
      {
        id: 'workspace',
        label: 'Workspace',
        items: [
          { id: 'general', label: 'General', icon: 'settings' },
          { id: 'applications', label: 'Applications', icon: 'inventory', count: 4 },
          { id: 'organizations', label: 'Organizations', icon: 'inventory', count: 2 },
          { id: 'sla-policies', label: 'SLA policies', icon: 'reports', count: 3 },
          { id: 'fields', label: 'Ticket fields', icon: 'knowledge' },
          { id: 'tags', label: 'Customer tags', icon: 'customers', count: 6 },
          { id: 'routing', label: 'Auto-routing', icon: 'team', count: 3 },
        ],
      },
      {
        id: 'integrations',
        label: 'Integrations',
        items: [
          { id: 'zendesk', label: 'Zendesk', icon: 'bell' },
          { id: 'ringcentral', label: 'RingCentral', icon: 'bell' },
        ],
      },
      {
        id: 'data',
        label: 'Data',
        items: [{ id: 'backup', label: 'Backup & export', icon: 'knowledge' }],
      },
    ],
  },
}
