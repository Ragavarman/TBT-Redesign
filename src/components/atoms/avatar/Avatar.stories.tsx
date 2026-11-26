import type { Meta, StoryObj } from '@storybook/react-vite'
import { Avatar } from './Avatar'

const SIZES = ['xs', 'sm', 'md', 'lg'] as const

const meta = {
  title: 'Atoms/Avatar',
  component: Avatar,
  args: { name: 'Tara Lane', size: 'md' },
  argTypes: {
    size: { control: 'inline-radio', options: SIZES },
    presence: { control: 'inline-radio', options: [undefined, 'online', 'away', 'offline'] },
  },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** size × type — same grid as Figma 08 · Avatar (initials / icon), plus presence. */
export const Matrix: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(['initials', 'icon', 'presence'] as const).map((row) => (
        <div key={row} className="flex items-center gap-4">
          <span className="w-16 text-caption text-muted-foreground">{row}</span>
          {SIZES.map((s) => (
            <Avatar
              key={s}
              size={s}
              name={row === 'icon' ? undefined : 'Tara Lane'}
              presence={row === 'presence' ? 'online' : undefined}
            />
          ))}
        </div>
      ))}
    </div>
  ),
}

/** A photo that fails to load falls back to initials. */
export const ImageFallback: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar name="Broken Image" src="/does-not-exist.png" />
      <Avatar name="Amir Malik" presence="away" />
      <Avatar name="Nia Park" presence="offline" />
    </div>
  ),
}
