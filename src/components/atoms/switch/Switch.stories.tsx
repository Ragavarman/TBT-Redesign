import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Switch } from './Switch'

const meta = {
  title: 'Atoms/Switch',
  component: Switch,
  args: { label: 'Notifications', size: 'md', disabled: false, onCheckedChange: fn() },
  argTypes: { size: { control: 'inline-radio', options: ['md', 'sm'] } },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithDescription: Story = {
  args: {
    label: 'Send welcome email',
    description: 'Applies immediately to new customers.',
    defaultChecked: true,
  },
}

const STATES = ['default', 'hover', 'focus', 'disabled'] as const
const ROWS = [
  { size: 'md', checked: false },
  { size: 'md', checked: true },
  { size: 'sm', checked: false },
  { size: 'sm', checked: true },
] as const

/** size × checked × state — same grid as Figma 06 · Switch. */
export const Matrix: Story = {
  parameters: {
    layout: 'padded',
    pseudo: { hover: ['.state-hover button'], focusVisible: ['.state-focus button'] },
  },
  render: () => (
    <table className="border-separate border-spacing-x-6 border-spacing-y-3">
      <thead>
        <tr>
          <th className="text-left text-caption font-normal text-muted-foreground">
            size / checked
          </th>
          {STATES.map((s) => (
            <th key={s} className="text-left text-caption font-normal text-muted-foreground">
              {s}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {ROWS.map((r) => (
          <tr key={`${r.size}-${r.checked}`}>
            <td className="pr-2 text-caption text-muted-foreground">
              {r.size} / {String(r.checked)}
            </td>
            {STATES.map((state) => (
              <td key={state} className={`state-${state}`}>
                <Switch
                  size={r.size}
                  label="Notifications"
                  checked={r.checked}
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
