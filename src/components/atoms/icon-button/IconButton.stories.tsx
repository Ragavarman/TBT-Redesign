import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { ICON_NAMES } from '../icon'
import { IconButton, type IconButtonSize, type IconButtonVariant } from './IconButton'

const meta = {
  title: 'Atoms/IconButton',
  component: IconButton,
  args: {
    icon: 'dots',
    label: 'More actions',
    variant: 'ghost',
    size: 'md',
    selected: false,
    loading: false,
    disabled: false,
    onClick: fn(),
  },
  argTypes: {
    icon: { control: 'select', options: ICON_NAMES },
    variant: { control: 'inline-radio', options: ['ghost', 'outline', 'secondary', 'primary'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof IconButton>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** `selected` is for toggles — e.g. sidebar collapse or view mode. */
export const Toggle: Story = {
  render: (args) => {
    function ToggleDemo() {
      const [open, setOpen] = useState(false)
      return (
        <IconButton
          {...args}
          icon="sidebar"
          label="Toggle sidebar"
          variant="outline"
          selected={open}
          onClick={() => setOpen((o) => !o)}
        />
      )
    }
    return <ToggleDemo />
  },
}

const VARIANTS: IconButtonVariant[] = ['ghost', 'outline', 'secondary', 'primary']
const SIZES: IconButtonSize[] = ['sm', 'md']
const STATES = ['default', 'hover', 'focus', 'pressed', 'selected', 'disabled', 'loading'] as const

/** variant × size × state — same grid as Figma 05 · Icon button. */
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
                  <IconButton
                    icon="dots"
                    label="More"
                    variant={variant}
                    size={size}
                    selected={state === 'selected'}
                    disabled={state === 'disabled'}
                    loading={state === 'loading'}
                  />
                </td>
              ))}
            </tr>
          )),
        )}
      </tbody>
    </table>
  ),
}
