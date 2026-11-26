import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { ICON_NAMES } from '../icon'
import { Input } from './Input'

const meta = {
  title: 'Atoms/Input',
  component: Input,
  args: {
    placeholder: 'Placeholder',
    type: 'text',
    size: 'md',
    invalid: false,
    disabled: false,
    readOnly: false,
    onChange: fn(),
  },
  argTypes: {
    type: { control: 'inline-radio', options: ['text', 'search', 'email', 'password'] },
    size: { control: 'inline-radio', options: ['md', 'sm'] },
    leadingIcon: { control: 'select', options: [undefined, null, ...ICON_NAMES] },
    shortcut: { control: 'text' },
  },
  decorators: [(Story) => <div className="w-72">{Story()}</div>],
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Search: leading icon, "/" hint while empty, clear button once there is a value. */
export const Search: Story = {
  render: (args) => {
    function SearchDemo() {
      const [q, setQ] = useState('')
      return (
        <Input
          {...args}
          type="search"
          placeholder="Search tickets"
          shortcut="/"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onClear={() => setQ('')}
        />
      )
    }
    return <SearchDemo />
  },
}

const ROWS = [
  { type: 'text', size: 'md', filled: false },
  { type: 'text', size: 'md', filled: true },
  { type: 'text', size: 'sm', filled: false },
  { type: 'text', size: 'sm', filled: true },
  { type: 'search', size: 'md', filled: false },
  { type: 'search', size: 'md', filled: true },
  { type: 'search', size: 'sm', filled: false },
  { type: 'search', size: 'sm', filled: true },
] as const
const STATES = ['default', 'hover', 'focus', 'error', 'disabled', 'read-only'] as const

/** type × size × value × state — same grid as Figma 06 · Text & search input. */
export const Matrix: Story = {
  decorators: [(Story) => <>{Story()}</>],
  parameters: {
    layout: 'padded',
    pseudo: {
      hover: ['.state-hover [data-slot=input]'],
      focusVisible: ['.state-focus input'],
    },
  },
  render: () => (
    <table className="border-separate border-spacing-x-4 border-spacing-y-3">
      <thead>
        <tr>
          <th className="text-left text-caption font-normal text-muted-foreground">
            type / size / value
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
          <tr key={`${r.type}-${r.size}-${r.filled}`}>
            <td className="pr-2 text-caption whitespace-nowrap text-muted-foreground">
              {r.type} / {r.size} / {r.filled ? 'filled' : 'placeholder'}
            </td>
            {STATES.map((state) => (
              <td key={state} className={`state-${state} w-44`}>
                <Input
                  type={r.type}
                  size={r.size}
                  placeholder="Placeholder"
                  aria-label="Example"
                  defaultValue={r.filled ? 'Placeholder' : undefined}
                  shortcut={r.type === 'search' ? '/' : undefined}
                  onClear={r.type === 'search' ? () => {} : undefined}
                  invalid={state === 'error'}
                  disabled={state === 'disabled'}
                  readOnly={state === 'read-only'}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
}
