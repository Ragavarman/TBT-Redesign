/** Knowledge section data (Figma Interface · K1–K5). */

export const KNOWLEDGE_FOLDERS = [
  'Printers & POS',
  'Billing',
  'Accounts & access',
  'Onboarding',
  'General',
]

/** Sidebar folder views → folder name. */
export const FOLDER_VIEW: Record<string, string> = {
  printers: 'Printers & POS',
  billing: 'Billing',
  accounts: 'Accounts & access',
  onboarding: 'Onboarding',
}

export interface KnowledgeNote {
  id: string
  title: string
  folder: string
  updatedBy: string
  /** "2m ago", "Nov 16". */
  updated: string
  usedIn: number
  /** Markdown-ish body: paragraphs, "1." steps, "> " callout. */
  body: string
  published: boolean
}

const PRINTER_BODY = `Use this when a printer shows "Offline" in the POS after the v4.2.1 update. It takes about 5 minutes and keeps the printer's settings.

## Steps
1. Turn the printer off and unplug it for 30 seconds.
2. Hold FEED while plugging it back in, until the light blinks twice.
3. In the POS, open Settings → Devices and remove the printer.
4. Add it again and print a test receipt.

> If the light keeps blinking, the board may be damaged. Link the asset and ship a replacement.`

export const wsNotes: KnowledgeNote[] = [
  {
    id: 'kn1',
    title: 'Reset a receipt printer after firmware update',
    folder: 'Printers & POS',
    updatedBy: 'Tharsi K.',
    updated: '2m ago',
    usedIn: 14,
    body: PRINTER_BODY,
    published: true,
  },
  {
    id: 'kn2',
    title: 'Card reader rejects contactless payments',
    folder: 'Printers & POS',
    updatedBy: 'Arun M.',
    updated: '1h ago',
    usedIn: 9,
    body: 'Check the reader firmware and re-pair it with the till.\n\n## Steps\n1. Restart the reader.\n2. Re-pair it from Settings → Payments.',
    published: true,
  },
  {
    id: 'kn3',
    title: 'Refund a duplicate card charge',
    folder: 'Billing',
    updatedBy: 'Kavya S.',
    updated: 'Yesterday',
    usedIn: 22,
    body: 'Find both charges in the payment gateway and refund the later one.',
    published: true,
  },
  {
    id: 'kn4',
    title: 'Change an invoice VAT rate',
    folder: 'Billing',
    updatedBy: 'Kavya S.',
    updated: 'Nov 16',
    usedIn: 6,
    body: 'Invoices can be re-issued with a new VAT rate within 30 days.',
    published: true,
  },
  {
    id: 'kn5',
    title: 'Unlock an agent account',
    folder: 'Accounts & access',
    updatedBy: 'Dilini F.',
    updated: 'Nov 14',
    usedIn: 11,
    body: 'Team leads can unlock accounts from Team → Agents.',
    published: true,
  },
  {
    id: 'kn6',
    title: 'Add a new branch location',
    folder: 'Onboarding',
    updatedBy: 'Nimal P.',
    updated: 'Nov 10',
    usedIn: 3,
    body: 'Create the location in Inventory → Locations first.',
    published: false,
  },
  {
    id: 'kn7',
    title: 'Sync delay between branches',
    folder: 'Printers & POS',
    updatedBy: 'Arun M.',
    updated: 'Nov 8',
    usedIn: 5,
    body: 'Stock sync runs every 15 minutes; force it from Settings → Sync.',
    published: true,
  },
  {
    id: 'kn8',
    title: 'Export customers to CSV',
    folder: 'Accounts & access',
    updatedBy: 'Tharsi K.',
    updated: 'Nov 2',
    usedIn: 2,
    body: 'Settings → Backup & export → Customers.',
    published: true,
  },
]

export interface CannedReplyRecord {
  id: string
  name: string
  /** Without the slash, e.g. "printer". */
  shortcut: string
  folder: string
  message: string
  used: number
  updated: string
  allTeams: boolean
  /** Status to set after sending, if any. */
  setStatus?: string
}

export const wsCannedReplyRecords: CannedReplyRecord[] = [
  {
    id: 'cr1',
    name: 'Printer offline — first steps',
    shortcut: 'printer',
    folder: 'Printers & POS',
    message:
      'Hi {customer.first_name},\n\nSorry the printer is offline. Please turn it off, unplug it for 30 seconds and plug it back in while holding FEED.\n\nIf it still shows "Offline", reply here and {agent.first_name} will call you.',
    used: 186,
    updated: '2d ago',
    allTeams: true,
    setStatus: 'Waiting for customer',
  },
  {
    id: 'cr2',
    name: 'Refund confirmed',
    shortcut: 'refund',
    folder: 'Billing',
    message:
      'Hi {customer.first_name}, your refund is on its way and should arrive in 3–5 business days.',
    used: 142,
    updated: 'Nov 15',
    allTeams: true,
  },
  {
    id: 'cr3',
    name: 'Waiting for screenshot',
    shortcut: 'screenshot',
    folder: 'General',
    message: 'Could you send us a screenshot of the error so we can take a closer look?',
    used: 118,
    updated: 'Nov 12',
    allTeams: true,
    setStatus: 'Waiting for customer',
  },
  {
    id: 'cr4',
    name: 'Password reset link',
    shortcut: 'reset',
    folder: 'Accounts & access',
    message: 'Here is a new password reset link: {reset_link}. It works for 30 minutes.',
    used: 97,
    updated: 'Nov 9',
    allTeams: false,
  },
  {
    id: 'cr5',
    name: 'Replacement shipped',
    shortcut: 'shipped',
    folder: 'Printers & POS',
    message: 'Good news — a replacement is on its way and should arrive within 2 business days.',
    used: 64,
    updated: 'Nov 3',
    allTeams: true,
  },
  {
    id: 'cr6',
    name: 'Closing — no reply in 3 days',
    shortcut: 'close',
    folder: 'General',
    message: "We haven't heard back, so we'll close this ticket. Reply any time to reopen it.",
    used: 51,
    updated: 'Oct 30',
    allTeams: true,
    setStatus: 'Closed',
  },
  {
    id: 'cr7',
    name: 'Invoice re-issued',
    shortcut: 'invoice',
    folder: 'Billing',
    message: 'We have re-issued invoice {ticket.id} with the corrected details.',
    used: 38,
    updated: 'Oct 28',
    allTeams: true,
  },
]

export const CANNED_VARIABLES = [
  '{customer.first_name}',
  '{agent.first_name}',
  '{ticket.id}',
  '{application}',
]

export interface SmsMessage {
  id: string
  from: 'customer' | 'agent'
  text: string
  /** "10:02". */
  time: string
  agent?: string
}

export interface SmsThread {
  id: string
  name: string
  phone: string
  ticketId?: number
  /** "2m", "1d". */
  last: string
  unread: boolean
  messages: SmsMessage[]
}

export const wsSmsThreads: SmsThread[] = [
  {
    id: 'sm1',
    name: 'Dennis D.',
    phone: '(909) 802-3652',
    ticketId: 222,
    last: '2m',
    unread: true,
    messages: [
      {
        id: 'a',
        from: 'agent',
        agent: 'Tharsi',
        time: '10:02',
        text: 'Hi Dennis, this is Tharsi from TBT Support. Could you hold FEED while plugging the printer back in?',
      },
      { id: 'b', from: 'customer', time: '10:04', text: 'Ok trying now' },
      { id: 'c', from: 'customer', time: '10:05', text: 'The light blinked twice' },
      {
        id: 'd',
        from: 'agent',
        agent: 'Tharsi',
        time: '10:08',
        text: 'Great — now remove and re-add it under Settings → Devices.',
      },
      { id: 'e', from: 'customer', time: '10:12', text: "Thanks, it's printing again!" },
    ],
  },
  {
    id: 'sm2',
    name: 'Dana W.',
    phone: '(626) 446-5263',
    ticketId: 219,
    last: '40m',
    unread: true,
    messages: [{ id: 'a', from: 'customer', time: '10:20', text: 'Can you call me back?' }],
  },
  {
    id: 'sm3',
    name: 'Shanthi R.',
    phone: '(081) 341-2290',
    ticketId: 214,
    last: '1h',
    unread: true,
    messages: [{ id: 'a', from: 'customer', time: '09:58', text: 'Got the reset link' }],
  },
  {
    id: 'sm4',
    name: 'Asha P.',
    phone: '(011) 555-0148',
    last: '3h',
    unread: false,
    messages: [{ id: 'a', from: 'customer', time: '08:01', text: 'Friday works' }],
  },
  {
    id: 'sm5',
    name: 'Ravi S.',
    phone: '(310) 555-0199',
    ticketId: 220,
    last: '1d',
    unread: false,
    messages: [
      {
        id: 'a',
        from: 'agent',
        agent: 'Nimal',
        time: 'Yesterday',
        text: 'Your refund is confirmed',
      },
    ],
  },
  {
    id: 'sm6',
    name: '(415) 265-3075',
    phone: '(415) 265-3075',
    last: '2d',
    unread: false,
    messages: [
      {
        id: 'a',
        from: 'agent',
        agent: 'Tharsi',
        time: 'Nov 23',
        text: 'Hi, this is TBT Support — returning your call.',
      },
    ],
  },
]
