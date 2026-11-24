import type { ComponentProps, MouseEvent, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Slot } from 'radix-ui'
import { Button as UiButton } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Icon, type IconName } from '../icon'
import { Kbd } from '../kbd'
import { Spinner } from '../spinner'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link'
export type ButtonSize = 'sm' | 'md' | 'lg'

const UI_VARIANT = {
  primary: 'default',
  secondary: 'secondary',
  outline: 'outline',
  ghost: 'ghost',
  destructive: 'destructive',
  link: 'link',
} as const
const UI_SIZE = { sm: 'sm', md: 'default', lg: 'lg' } as const
const ICON_PX = { sm: 14, md: 16, lg: 16 } as const
const SPINNER = { sm: 'sm', md: 'md', lg: 'md' } as const

export interface ButtonProps extends Omit<ComponentProps<'button'>, 'children'> {
  /** primary (one per view) · secondary · outline · ghost (dense toolbars) · destructive · link. */
  variant?: ButtonVariant
  /** sm 28 · md 32 · lg 36. Default md. */
  size?: ButtonSize
  /** Icon before the label: a TBT icon name or any Lucide icon. */
  leadingIcon?: IconName | LucideIcon
  /** Icon after the label. */
  trailingIcon?: IconName | LucideIcon
  /** Keyboard shortcut shown at the end, e.g. "K". */
  shortcut?: string
  /** Replaces the leading icon with a spinner and blocks clicks (stays full opacity). */
  loading?: boolean
  /** Render the child element (e.g. a router <Link>) with button styles. */
  asChild?: boolean
  children?: ReactNode
}

const renderIcon = (icon: IconName | LucideIcon | undefined, size: ButtonSize) =>
  icon === undefined ? null : typeof icon === 'string' ? (
    <Icon name={icon} size={ICON_PX[size]} />
  ) : (
    <Icon icon={icon} size={ICON_PX[size]} />
  )

/** TBT Button (Figma 05 · Button). */
export function Button({
  variant = 'primary',
  size = 'md',
  leadingIcon,
  trailingIcon,
  shortcut,
  loading = false,
  asChild = false,
  className,
  onClick,
  children,
  ...props
}: ButtonProps) {
  const solid = variant === 'primary' || variant === 'destructive'
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      e.preventDefault()
      return
    }
    onClick?.(e)
  }

  return (
    <UiButton
      variant={UI_VARIANT[variant]}
      size={UI_SIZE[size]}
      asChild={asChild}
      aria-busy={loading || undefined}
      data-loading={loading || undefined}
      className={cn(loading && 'pointer-events-none', className)}
      onClick={handleClick}
      {...props}
    >
      {loading ? <Spinner size={SPINNER[size]} label={null} /> : renderIcon(leadingIcon, size)}
      <Slot.Slottable>{children}</Slot.Slottable>
      {renderIcon(trailingIcon, size)}
      {shortcut && <Kbd tone={solid ? 'inverse' : 'default'}>{shortcut}</Kbd>}
    </UiButton>
  )
}
