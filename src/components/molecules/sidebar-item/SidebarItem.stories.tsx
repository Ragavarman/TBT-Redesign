import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Separator, StatusGlyph } from '@/components/atoms'
import { SidebarGroupLabel, SidebarItem } from './SidebarItem'

const meta = {
  title: 'Molecules/SidebarItem',
  component: SidebarItem,
  args: { label: 'My tickets', icon: 'inbox', count: 8, level: 0, active: false, unread: false },
  argTypes: { level: { control: 'inline-radio', options: [0, 1] } },
  decorators: [(Story) => <div className="w-56">{Story()}</div>],
} satisfies Meta<typeof SidebarItem>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

const STATES = ['default', 'hover', 'active', 'focus', 'disabled'] as const

/** level × state — same grid as Figma 07 · Sidebar. */
export const Matrix: Story = {
  decorators: [(Story) => <>{Story()}</>],
  parameters: {
    layout: 'padded',
    pseudo: { hover: ['.state-hover button'], focusVisible: ['.state-focus button'] },
  },
  render: () => (
    <table className="border-separate border-spacing-x-4 border-spacing-y-2">
      <thead>
        <tr>
          <th className="text-left text-caption font-normal text-muted-foreground">level</th>
          {STATES.map((s) => (
            <th key={s} className="text-left text-caption font-normal text-muted-foreground">
              {s}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {([0, 1] as const).map((level) => (
          <tr key={level}>
            <td className="pr-2 text-caption text-muted-foreground">{level}</td>
            {STATES.map((state) => (
              <td key={state} className={`state-${state} w-56`}>
                <SidebarItem
                  label="My tickets"
                  icon="inbox"
                  count={8}
                  level={level}
                  active={state === 'active'}
                  disabled={state === 'disabled'}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
}

/** A sidebar section: group labels, modules, and saved views with status glyphs. */
export const InContext: Story = {
  decorators: [(Story) => <>{Story()}</>],
  render: () => {
    function Demo() {
      const [active, setActive] = useState('mine')
      const [open, setOpen] = useState(true)
      const item = (id: string) => ({ active: active === id, onClick: () => setActive(id) })
      return (
        <nav
          aria-label="Inbox"
          className="flex w-60 flex-col gap-0.5 rounded-xl border bg-sidebar p-2"
        >
          <SidebarItem label="My tickets" icon="inbox" count={8} unread {...item('mine')} />
          <SidebarItem label="Unassigned" icon="user" count={14} {...item('unassigned')} />
          <SidebarItem label="Mentions" icon="chat" count={2} {...item('mentions')} />
          <Separator className="my-2" />
          <SidebarGroupLabel
            label="Views"
            collapsible
            open={open}
            onOpenChange={setOpen}
            action={{ label: 'New view', onClick: fn() }}
          />
          {open && (
            <>
              <SidebarItem
                level={1}
                label="Open"
                icon={<StatusGlyph status="open" label={null} />}
                count={31}
                {...item('open')}
              />
              <SidebarItem
                level={1}
                label="Investigating"
                icon={<StatusGlyph status="investigating" label={null} />}
                count={6}
                {...item('investigating')}
              />
              <SidebarItem
                level={1}
                label="Waiting"
                icon={<StatusGlyph status="waiting" label={null} />}
                count={9}
                {...item('waiting')}
              />
            </>
          )}
        </nav>
      )
    }
    return <Demo />
  },
}
