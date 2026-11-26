import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { ICON_NAMES } from '../icon'
import { Badge } from './Badge'

const VARIANTS = [
  'neutral',
  'primary',
  'outline',
  'success',
  'warning',
  'destructive',
  'info',
] as const

const meta = {
  title: 'Atoms/Badge',
  component: Badge,
  args: { children: 'Badge', variant: 'neutral', size: 'md', dot: false },
  argTypes: {
    variant: { control: 'select', options: VARIANTS },
    size: { control: 'inline-radio', options: ['md', 'sm'] },
    icon: { control: 'select', options: [undefined, ...ICON_NAMES] },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** variant × size — same grid as Figma 08 · Badge. */
export const Matrix: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex flex-col gap-3">
      {(['md', 'sm'] as const).map((size) => (
        <div key={size} className="flex items-center gap-2">
          <span className="w-8 text-caption text-muted-foreground">{size}</span>
          {VARIANTS.map((v) => (
            <Badge key={v} variant={v} size={size}>
              {v}
            </Badge>
          ))}
        </div>
      ))}
    </div>
  ),
}

export const Parts: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Badge variant="success" dot>
        Online
      </Badge>
      <Badge variant="info" icon="clock">
        2h left
      </Badge>
      <Badge variant="outline" icon="tag" onRemove={fn()}>
        billing
      </Badge>
      <Badge variant="neutral" size="sm">
        12
      </Badge>
    </div>
  ),
}
