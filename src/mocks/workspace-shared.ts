/** Shared screens data (Figma Interface · H2 Notifications, X13 Shortcuts). */

export interface AppNotification {
  id: string
  kind: 'mention' | 'sla' | 'reply' | 'call' | 'assign' | 'report'
  /** Who or what it's from — initials go in the avatar. */
  from: string
  title: string
  detail: string
  when: string
  unread: boolean
  /** Where clicking it goes. */
  path: string
}

export const wsNotifications: AppNotification[] = [
  {
    id: 'nt1',
    kind: 'mention',
    from: 'Tharsi K.',
    title: 'Tharsi mentioned you on T-221',
    detail: '“Can you check the firmware?”',
    when: '5m',
    unread: true,
    path: '/inbox/all/T-221',
  },
  {
    id: 'nt2',
    kind: 'sla',
    from: 'SLA',
    title: 'SLA at risk on T-219',
    detail: 'Resolve within 30 minutes',
    when: '12m',
    unread: true,
    path: '/inbox/all/T-219',
  },
  {
    id: 'nt3',
    kind: 'reply',
    from: 'Dennis Davenport',
    title: 'Dennis replied on T-221',
    detail: '“Any update on this?”',
    when: '1h',
    unread: true,
    path: '/inbox/all/T-221',
  },
  {
    id: 'nt4',
    kind: 'call',
    from: 'RingCentral',
    title: 'Missed call from (415) 265-3075',
    detail: 'Ticket T-222 created',
    when: '2h',
    unread: true,
    path: '/inbox/all/T-222',
  },
  {
    id: 'nt5',
    kind: 'assign',
    from: 'Arun M.',
    title: 'Arun assigned T-217 to you',
    detail: 'Reset password',
    when: 'Yesterday',
    unread: false,
    path: '/inbox/all/T-217',
  },
  {
    id: 'nt6',
    kind: 'report',
    from: 'System',
    title: 'Weekly summary is ready',
    detail: 'Reports · Nov 11 – 18',
    when: 'Mon',
    unread: false,
    path: '/reports/weekly',
  },
  {
    id: 'nt7',
    kind: 'mention',
    from: 'Dilini F.',
    title: 'Dilini mentioned you on T-214',
    detail: '“Callback booked for Friday”',
    when: 'Mon',
    unread: false,
    path: '/inbox/all/T-214',
  },
]

export interface ShortcutGroup {
  title: string
  items: { label: string; keys: string[] }[]
}

export const SHORTCUTS: ShortcutGroup[] = [
  {
    title: 'Navigation',
    items: [
      { label: 'Command menu', keys: ['Ctrl', 'K'] },
      { label: 'Search', keys: ['/'] },
      { label: 'Go to inbox', keys: ['G', 'I'] },
      { label: 'Go to customers', keys: ['G', 'C'] },
      { label: 'Go to reports', keys: ['G', 'R'] },
      { label: 'Go to settings', keys: ['G', 'S'] },
      { label: 'Next / previous ticket', keys: ['J', 'K'] },
      { label: 'Notifications', keys: ['G', 'N'] },
      { label: 'Close panel or dialog', keys: ['Esc'] },
    ],
  },
  {
    title: 'Tickets',
    items: [
      { label: 'New ticket', keys: ['C'] },
      { label: 'Reply', keys: ['R'] },
      { label: 'Internal note', keys: ['N'] },
      { label: 'Canned reply', keys: ['/'] },
      { label: 'Change status', keys: ['S'] },
      { label: 'Change priority', keys: ['P'] },
      { label: 'Assign to me', keys: ['I'] },
      { label: 'Resolve', keys: ['E'] },
      { label: 'Snooze', keys: ['H'] },
      { label: 'Select ticket', keys: ['X'] },
    ],
  },
]
