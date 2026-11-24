import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { ICON_NAMES } from '../icon'
import { IconButton } from '../icon-button'
import { Button, type ButtonSize, type ButtonVariant } from './Button'

const meta = {
  title: 'Atoms/Button',
  component: Button,
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'md',
    loading: false,
    disabled: false,
    onClick: fn(),
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'outline', 'ghost', 'destructive', 'link'],
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    leadingIcon: { control: 'select', options: [undefined, ...ICON_NAMES] },
    trailingIcon: { control: 'select', options: [undefined, ...ICON_NAMES] },
    shortcut: { control: 'text' },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithIcons: Story = {
  args: { leadingIcon: 'plus', children: 'New ticket' },
  render: (args) => (
    <div className="flex items-center gap-3">
      <Button {...args} />
      <Button {...args} variant="outline" leadingIcon={undefined} trailingIcon="chevron-down">
        Assign
      </Button>
      <Button {...args} shortcut="K" />
      <Button {...args} variant="outline" leadingIcon="filter" shortcut="F">
        Filters
      </Button>
    </div>
  ),
}

export const Loading: Story = {
  args: { loading: true, children: 'Saving' },
}

export const AsLink: Story = {
  name: 'As link (asChild)',
  render: (args) => (
    <Button {...args} asChild variant="outline" trailingIcon="external">
      <a href="https://example.com" target="_blank" rel="noreferrer">
        Open docs
      </a>
    </Button>
  ),
}

const VARIANTS: ButtonVariant[] = [
  'primary',
  'secondary',
  'outline',
  'ghost',
  'destructive',
  'link',
]
const SIZES: ButtonSize[] = ['sm', 'md', 'lg']
const STATES = ['default', 'hover', 'focus', 'pressed', 'disabled', 'loading'] as const

/** variant × size × state — same grid as Figma 05 · Button. Hover/focus/pressed are forced with the pseudo-states addon. */
export const Matrix: Story = {
  parameters: {
    layout: 'padded',
    pseudo: {
      hover: ['.state-hover > *'],
      focusVisible: ['.state-focus > *'],
      active: ['.state-pressed > *'],
    },
  },
  render: () => (
    <table className="border-separate border-spacing-x-6 border-spacing-y-3">
      <thead>
        <tr>
          <th className="text-left text-caption font-normal text-muted-foreground">
            variant / size
          </th>
          {STATES.map((s) => (
            <th key={s} className="text-left text-caption font-normal text-muted-foreground">
              {s}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {VARIANTS.flatMap((variant) =>
          SIZES.map((size) => (
            <tr key={`${variant}-${size}`}>
              <td className="pr-4 text-caption text-muted-foreground">
                {variant} / {size}
              </td>
              {STATES.map((state) => (
                <td key={state} className={`state-${state}`}>
                  <Button
                    variant={variant}
                    size={size}
                    disabled={state === 'disabled'}
                    loading={state === 'loading'}
                  >
                    Button
                  </Button>
                </td>
              ))}
            </tr>
          )),
        )}
      </tbody>
    </table>
  ),
}

/** Figma 05 · In context. */
export const InContext: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex flex-wrap items-start gap-10">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 rounded-xl border bg-card p-2">
          <Button leadingIcon="plus" shortcut="K">
            New ticket
          </Button>
          <Button variant="outline" leadingIcon="filter">
            Filters
          </Button>
          <Button variant="ghost" leadingIcon="display">
            Display
          </Button>
          <IconButton icon="dots" label="More actions" />
        </div>
        <span className="text-caption text-muted-foreground">
          Inbox toolbar · primary + outline + ghost
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex w-96 items-center gap-2 rounded-xl border bg-card p-3">
          <Button variant="destructive">Delete</Button>
          <div className="flex-1" />
          <Button variant="outline">Cancel</Button>
          <Button>Save changes</Button>
        </div>
        <span className="text-caption text-muted-foreground">
          Dialog footer · destructive left, primary right
        </span>
      </div>
    </div>
  ),
}
