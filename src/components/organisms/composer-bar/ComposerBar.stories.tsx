import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Button } from '@/components/atoms'
import { ComposerBar } from './ComposerBar'

const onAction = fn()

const actions = (
  <>
    <Button variant="ghost" leadingIcon="reply" shortcut="R" onClick={() => onAction('reply')}>
      Reply
    </Button>
    <Button variant="ghost" leadingIcon="pencil" shortcut="N" onClick={() => onAction('note')}>
      Note
    </Button>
    <Button variant="ghost" leadingIcon="chat" shortcut="/" onClick={() => onAction('canned')}>
      Canned reply
    </Button>
    <Button variant="ghost" leadingIcon="dots" onClick={() => onAction('more')}>
      More
    </Button>
  </>
)

const meta = {
  title: 'Organisms/ComposerBar',
  component: ComposerBar,
  args: { children: actions, position: 'inline' },
  argTypes: {
    children: { control: false },
    position: { control: 'inline-radio', options: ['floating', 'inline'] },
  },
} satisfies Meta<typeof ComposerBar>

export default meta
type Story = StoryObj<typeof meta>

/** Figma Interface · Action bar. */
export const Default: Story = {}

/** Floating over the bottom of a conversation panel. */
export const Floating: Story = {
  args: { position: 'floating' },
  parameters: { layout: 'padded' },
  render: (args) => (
    <div className="relative flex h-80 w-181 flex-col overflow-hidden rounded-xl border bg-card">
      <div className="flex-1 p-8 text-small text-muted-foreground">Timeline…</div>
      <div className="absolute inset-x-0 bottom-0">
        <ComposerBar {...args} />
      </div>
    </div>
  ),
}
