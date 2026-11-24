import type { Meta, StoryObj } from '@storybook/react-vite'
import { TICKET_STATUSES } from '@/types'
import { TicketStatusBadge } from './TicketStatusBadge'

const meta = {
  title: 'Molecules/TicketStatusBadge',
  component: TicketStatusBadge,
  args: { status: 'investigating', variant: 'label' },
  argTypes: {
    status: { control: 'select', options: TICKET_STATUSES },
    variant: { control: 'inline-radio', options: ['glyph', 'label', 'pill'] },
  },
} satisfies Meta<typeof TicketStatusBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** status × style — same grid as Figma 10 · Ticket status. */
export const Matrix: Story = {
  render: () => (
    <table className="border-separate border-spacing-x-6 border-spacing-y-3">
      <thead>
        <tr>
          <th className="text-left text-caption font-normal text-muted-foreground">status</th>
          {(['glyph', 'label', 'pill'] as const).map((v) => (
            <th key={v} className="text-left text-caption font-normal text-muted-foreground">
              {v}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {TICKET_STATUSES.map((s) => (
          <tr key={s}>
            <td className="pr-2 text-caption text-muted-foreground">{s}</td>
            {(['glyph', 'label', 'pill'] as const).map((v) => (
              <td key={v}>
                <TicketStatusBadge status={s} variant={v} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
}
