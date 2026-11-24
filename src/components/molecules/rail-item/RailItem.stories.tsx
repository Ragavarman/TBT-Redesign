import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { IconName } from '@/components/atoms'
import { RailItem } from './RailItem'

const meta = {
  title: 'Molecules/RailItem',
  component: RailItem,
  args: { icon: 'inbox', label: 'Inbox', active: false, dot: false },
} satisfies Meta<typeof RailItem>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

const STATES = ['default', 'hover', 'active', 'focus'] as const

/** state — same as Figma 07 · Rail item. */
export const States: Story = {
  parameters: {
    pseudo: { hover: ['.state-hover button'], focusVisible: ['.state-focus button'] },
  },
  render: () => (
    <div className="flex gap-6">
      {STATES.map((s) => (
        <div key={s} className={`state-${s} flex flex-col items-center gap-2`}>
          <RailItem icon="inbox" label={s} active={s === 'active'} tooltip={false} />
          <span className="text-caption text-muted-foreground">{s}</span>
        </div>
      ))}
      <div className="flex flex-col items-center gap-2">
        <RailItem icon="bell" label="Notifications" dot tooltip={false} />
        <span className="text-caption text-muted-foreground">dot</span>
      </div>
    </div>
  ),
}

const MODULES: { id: string; icon: IconName; label: string; dot?: boolean }[] = [
  { id: 'inbox', icon: 'inbox', label: 'Inbox', dot: true },
  { id: 'customers', icon: 'customers', label: 'Customers' },
  { id: 'reports', icon: 'reports', label: 'Reports' },
  { id: 'knowledge', icon: 'knowledge', label: 'Knowledge' },
  { id: 'inventory', icon: 'inventory', label: 'Inventory' },
  { id: 'team', icon: 'team', label: 'Team' },
]

/** The collapsed sidebar: one rail item per module, label in a tooltip on hover. */
export const Rail: Story = {
  render: () => {
    function Demo() {
      const [active, setActive] = useState('inbox')
      return (
        <nav aria-label="Modules" className="flex flex-col gap-1 rounded-xl border bg-sidebar p-2">
          {MODULES.map((m) => (
            <RailItem
              key={m.id}
              icon={m.icon}
              label={m.label}
              dot={m.dot}
              active={active === m.id}
              onClick={() => setActive(m.id)}
            />
          ))}
        </nav>
      )
    }
    return <Demo />
  },
}
