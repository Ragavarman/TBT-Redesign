import type { Meta, StoryObj } from '@storybook/react-vite'
import { Progress } from './Progress'

const TONES = ['primary', 'success', 'warning', 'destructive', 'info'] as const

const meta = {
  title: 'Atoms/Progress',
  component: Progress,
  args: { value: 60, tone: 'primary', size: 'md', 'aria-label': 'Progress' },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100 } },
    tone: { control: 'select', options: TONES },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
  decorators: [(Story) => <div className="w-64">{Story()}</div>],
} satisfies Meta<typeof Progress>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** tone × size — same grid as Figma 08 · Progress. */
export const Matrix: Story = {
  decorators: [(Story) => <>{Story()}</>],
  render: () => (
    <div className="grid grid-cols-[6rem_12rem_12rem] items-center gap-x-6 gap-y-4">
      <span />
      <span className="text-caption text-muted-foreground">sm</span>
      <span className="text-caption text-muted-foreground">md</span>
      {TONES.flatMap((t) => [
        <span key={t} className="text-caption text-muted-foreground">
          {t}
        </span>,
        <Progress key={`${t}-sm`} tone={t} size="sm" value={60} aria-label={`${t} sm`} />,
        <Progress key={`${t}-md`} tone={t} size="md" value={60} aria-label={`${t} md`} />,
      ])}
    </div>
  ),
}
