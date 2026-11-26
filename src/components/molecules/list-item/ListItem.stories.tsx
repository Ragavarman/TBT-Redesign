import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Avatar, Badge } from '@/components/atoms'
import { ListItem } from './ListItem'

const meta = {
  title: 'Molecules/ListItem',
  component: ListItem,
  args: {
    title: 'List item title',
    description: 'Supporting text',
    leading: <Avatar name="Tara Lane" size="xs" />,
  },
  argTypes: { leading: { control: false }, trailing: { control: false } },
  decorators: [(Story) => <div className="w-90">{Story()}</div>],
} satisfies Meta<typeof ListItem>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** default / hover / selected — Figma 08 · List item. */
export const States: Story = {
  parameters: { pseudo: { hover: ['.state-hover button'] } },
  render: () => (
    <div className="flex flex-col gap-2">
      {(['default', 'hover', 'selected'] as const).map((s) => (
        <div key={s} className={`state-${s}`}>
          <ListItem
            title="List item title"
            description="Supporting text"
            leading={<Avatar name="Tara Lane" size="xs" />}
            selected={s === 'selected'}
          />
        </div>
      ))}
    </div>
  ),
}

export const CustomerList: Story = {
  render: () => {
    function Demo() {
      const [sel, setSel] = useState('Dana Whitfield')
      const people = [
        { name: 'Dana Whitfield', org: 'Northwind · 4 open tickets' },
        { name: 'Amir Malik', org: 'Contoso · 1 open ticket' },
        { name: 'Nia Park', org: 'Fabrikam · VIP' },
      ]
      return (
        <div className="flex flex-col gap-0.5 rounded-xl border bg-card p-1">
          {people.map((p) => (
            <ListItem
              key={p.name}
              title={p.name}
              description={p.org}
              leading={<Avatar name={p.name} size="sm" />}
              trailing={
                p.org.includes('VIP') ? (
                  <Badge variant="warning" size="sm">
                    VIP
                  </Badge>
                ) : undefined
              }
              selected={sel === p.name}
              onClick={() => setSel(p.name)}
            />
          ))}
        </div>
      )
    }
    return <Demo />
  },
}
