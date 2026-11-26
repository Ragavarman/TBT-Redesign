import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Checkbox } from './Checkbox'

const meta = {
  title: 'Atoms/Checkbox',
  component: Checkbox,
  args: {
    label: 'Label',
    invalid: false,
    disabled: false,
    onCheckedChange: fn(),
  },
  argTypes: {
    checked: { control: 'inline-radio', options: [undefined, false, true, 'indeterminate'] },
  },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithDescription: Story = {
  args: {
    label: 'Notify requester',
    description: 'Send an email when the ticket status changes.',
    defaultChecked: true,
  },
}

/** Bare checkbox (e.g. table rows) — give it an aria-label. */
export const Bare: Story = {
  args: { label: undefined, 'aria-label': 'Select row' },
}

const STATES = ['default', 'hover', 'focus', 'disabled', 'error'] as const
const CHECKED = [false, true, 'indeterminate'] as const

/** checked × state — same grid as Figma 06 · Checkbox. */
export const Matrix: Story = {
  parameters: {
    layout: 'padded',
    pseudo: { hover: ['.state-hover button'], focusVisible: ['.state-focus button'] },
  },
  render: () => (
    <table className="border-separate border-spacing-x-6 border-spacing-y-3">
      <thead>
        <tr>
          <th className="text-left text-caption font-normal text-muted-foreground">checked</th>
          {STATES.map((s) => (
            <th key={s} className="text-left text-caption font-normal text-muted-foreground">
              {s}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {CHECKED.map((c) => (
          <tr key={String(c)}>
            <td className="pr-2 text-caption text-muted-foreground">{String(c)}</td>
            {STATES.map((state) => (
              <td key={state} className={`state-${state}`}>
                <Checkbox
                  label="Label"
                  checked={c}
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
