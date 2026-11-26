import type { ComponentProps, MouseEvent } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Button as UiButton } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Icon, type IconName } from '../icon'
import { Spinner } from '../spinner'

export type IconButtonVariant = 'ghost' | 'outline' | 'secondary' | 'primary'
export type IconButtonSize = 'sm' | 'md'

const UI_VARIANT = {
  ghost: 'ghost',
  outline: 'outline',
  secondary: 'secondary',
  primary: 'default',
} as const
const UI_SIZE = { sm: 'icon-sm', md: 'icon' } as const
const ICON_PX = { sm: 14, md: 16 } as const

export interface IconButtonProps extends Omit<ComponentProps<'button'>, 'children'> {
  /** TBT icon name or any Lucide icon. */
  icon: IconName | LucideIcon
  /** Accessible name (required — the button has no visible text). */
  label: string
  /** ghost (default, toolbars) · outline · secondary · primary. */
  variant?: IconButtonVariant
  /** sm 28 · md 32. Default md. */
  size?: IconButtonSize
  /** Toggle state (e.g. sidebar collapsed, view mode). Sets aria-pressed. */
  selected?: boolean
  /** Shows a spinner instead of the icon and blocks clicks. */
  loading?: boolean
}

/**
 * Square icon-only button (Figma 05 · Icon button).
 * Pair with a Tooltip (molecule) where the action isn't obvious.
 */
export function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  selected,
  loading = false,
  className,
  onClick,
  ...props
}: IconButtonProps) {
  const neutral = variant !== 'primary'
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      e.preventDefault()
      return
    }
    onClick?.(e)
  }
  const px = ICON_PX[size]

  return (
    <UiButton
      variant={UI_VARIANT[variant]}
      size={UI_SIZE[size]}
      aria-label={label}
      aria-pressed={selected}
      aria-busy={loading || undefined}
      data-selected={selected || undefined}
      className={cn(
        neutral && 'text-muted-foreground',
        // Figma: selected = accent fill + border (neutral variants). Opacity reset so secondary doesn't dim.
        neutral && selected && 'border-border bg-accent opacity-100 hover:opacity-100',
        loading && 'pointer-events-none',
        className,
      )}
      onClick={handleClick}
      {...props}
    >
      {loading ? (
        <Spinner size={size} label={null} />
      ) : typeof icon === 'string' ? (
        <Icon name={icon} size={px} />
      ) : (
        <Icon icon={icon} size={px} />
      )}
    </UiButton>
  )
}
