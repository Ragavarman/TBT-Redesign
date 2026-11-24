import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Select, SelectGroup, SelectItem, SelectLabel, SelectSeparator } from './Select'

const OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'investigating', label: 'Investigating' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed', disabled: true },
]

const meta = {
  title: 'Molecules/Select',
  component: Select,
  args: {
    placeholder: 'Select…',
    size: 'md',
    invalid: false,
    disabled: false,
    options: OPTIONS,
    'aria-label': 'Status',
    onValueChange: fn(),
  },
  argTypes: { size: { control: 'inline-radio', options: ['md', 'sm'] } },
  decorators: [(Story) => <div className="w-56">{Story()}</div>],
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** The list is a Menu content panel (Figma 06 · "Opens a Menu content popover"). */
export const Open: Story = {
  args: { defaultOpen: true, defaultValue: 'waiting' },
  decorators: [(Story) => <div className="h-56">{Story()}</div>],
}

export const WithIconsAndGroups: Story = {
  args: { options: undefined, leadingIcon: 'user', placeholder: 'Assignee' },
  render: (args) => (
    <Select {...args}>
      <SelectGroup>
        <SelectLabel>Team</SelectLabel>
        <SelectItem value="me" icon="user">
          Assign to me
        </SelectItem>
        <SelectItem value="tara" icon="user">
          Tara Lane
        </SelectItem>
      </SelectGroup>
      <SelectSeparator />
      <SelectItem value="none" icon="x">
        Unassigned
      </SelectItem>
    </Select>
  ),
}

const STATES = ['default', 'hover', 'focus', 'error', 'disabled'] as const
const ROWS = [
  { size: 'md', filled: false },
  { size: 'md', filled: true },
  { size: 'sm', filled: false },
  { size: 'sm', filled: true },
] as const

/** size × value × state — same grid as Figma 06 · Select (open: see the Open story). */
export const Matrix: Story = {
  decorators: [(Story) => <>{Story()}</>],
  parameters: {
    layout: 'padded',
    pseudo: { hover: ['.state-hover button'], focusVisible: ['.state-focus button'] },
  },
  render: () => (
    <table className="border-separate border-spacing-x-4 border-spacing-y-3">
      <thead>
        <tr>
          <th className="text-left text-caption font-normal text-muted-foreground">size / value</th>
          {STATES.map((s) => (
            <th key={s} className="text-left text-caption font-normal text-muted-foreground">
              {s}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {ROWS.map((r) => (
          <tr key={`${r.size}-${r.filled}`}>
            <td className="pr-2 text-caption text-muted-foreground">
              {r.size} / {r.filled ? 'filled' : 'placeholder'}
            </td>
            {STATES.map((state) => (
              <td key={state} className={`state-${state} w-40`}>
                <Select
                  size={r.size}
                  aria-label="Status"
                  options={OPTIONS}
                  defaultValue={r.filled ? 'open' : undefined}
                  invalid={state === 'error'}
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
