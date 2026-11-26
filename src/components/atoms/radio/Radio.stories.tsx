import type { Meta, StoryObj } from '@storybook/react-vite'
import { Radio, RadioGroup } from './Radio'

const meta = {
  title: 'Atoms/Radio',
  component: Radio,
  args: { value: 'a', label: 'Option', invalid: false, disabled: false },
  decorators: [(Story) => <RadioGroup defaultValue="a">{Story()}</RadioGroup>],
} satisfies Meta<typeof Radio>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** A group: one-of-many choice with arrow-key navigation. */
export const Group: Story = {
  decorators: [(Story) => <>{Story()}</>],
  render: () => (
    <RadioGroup defaultValue="email" aria-label="Reply channel">
      <Radio value="email" label="Email" description="Reply goes to the requester's inbox." />
      <Radio value="chat" label="Chat" description="Continue in the live chat thread." />
      <Radio value="phone" label="Phone" description="Log a call instead." disabled />
    </RadioGroup>
  ),
}

const STATES = ['default', 'hover', 'focus', 'disabled', 'error'] as const

/** checked × state — same grid as Figma 06 · Radio. */
export const Matrix: Story = {
  decorators: [(Story) => <>{Story()}</>],
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
        {[false, true].map((checked) => (
          <tr key={String(checked)}>
            <td className="pr-2 text-caption text-muted-foreground">{String(checked)}</td>
            {STATES.map((state) => (
              <td key={state} className={`state-${state}`}>
                <RadioGroup value={checked ? 'x' : ''} aria-label={`${state} ${checked}`}>
                  <Radio
                    value="x"
                    label="Option"
                    invalid={state === 'error'}
                    disabled={state === 'disabled'}
                  />
                </RadioGroup>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
}
