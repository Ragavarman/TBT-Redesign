import type { Meta, StoryObj } from '@storybook/react-vite'
import { Textarea } from './Textarea'

const meta = {
  title: 'Atoms/Textarea',
  component: Textarea,
  args: { placeholder: 'Add a note…', invalid: false, disabled: false },
  decorators: [(Story) => <div className="w-80">{Story()}</div>],
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

const STATES = ['default', 'hover', 'focus', 'error', 'disabled'] as const

/** value × state — same grid as Figma 06 · Textarea. */
export const Matrix: Story = {
  decorators: [(Story) => <>{Story()}</>],
  parameters: {
    layout: 'padded',
    pseudo: { hover: ['.state-hover textarea'], focusVisible: ['.state-focus textarea'] },
  },
  render: () => (
    <table className="border-separate border-spacing-x-4 border-spacing-y-3">
      <thead>
        <tr>
          <th className="text-left text-caption font-normal text-muted-foreground">value</th>
          {STATES.map((s) => (
            <th key={s} className="text-left text-caption font-normal text-muted-foreground">
              {s}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {(['placeholder', 'filled'] as const).map((v) => (
          <tr key={v}>
            <td className="pr-2 text-caption text-muted-foreground">{v}</td>
            {STATES.map((state) => (
              <td key={state} className={`state-${state} align-top`}>
                <div className="w-44">
                  <Textarea
                    aria-label="Note"
                    placeholder="Add a note…"
                    defaultValue={v === 'filled' ? 'Add a note…' : undefined}
                    invalid={state === 'error'}
                    disabled={state === 'disabled'}
                  />
                </div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
}
