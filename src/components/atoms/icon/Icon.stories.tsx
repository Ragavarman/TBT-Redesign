import type { Meta, StoryObj } from '@storybook/react-vite'
import { Icon } from './Icon'
import { ICON_NAMES, ICON_SIZES } from './icons'

const meta = {
  title: 'Atoms/Icon',
  component: Icon,
  args: { name: 'inbox', size: 16 },
  argTypes: {
    name: { control: 'select', options: ICON_NAMES },
    size: { control: 'inline-radio', options: ICON_SIZES },
  },
} satisfies Meta<typeof Icon>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Sizes: 12 dense meta · 14 menus · 16 default · 20 empty states · 24. */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-6">
      {ICON_SIZES.map((s) => (
        <div key={s} className="flex flex-col items-center gap-2">
          <Icon name="inbox" size={s} />
          <span className="text-caption text-muted-foreground">{s}px</span>
        </div>
      ))}
    </div>
  ),
}

/** The 55 TBT icons (Figma 04 · Iconography). */
export const Gallery: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="grid grid-cols-10 gap-2">
      {ICON_NAMES.map((name) => (
        <div
          key={name}
          className="flex h-16 flex-col items-center justify-center gap-2 rounded-md bg-muted/60"
        >
          <Icon name={name} />
          <span className="text-caption text-muted-foreground">{name}</span>
        </div>
      ))}
    </div>
  ),
}

/** Icons take `currentColor` — tint with text tokens. */
export const Tinted: Story = {
  render: () => (
    <div className="flex gap-4">
      <Icon name="check" className="text-success" label="Done" />
      <Icon name="warning" className="text-warning" label="Warning" />
      <Icon name="info" className="text-info" label="Info" />
      <Icon name="x" className="text-destructive" label="Error" />
      <Icon name="star" className="text-muted-foreground" />
    </div>
  ),
}
