import type { ComponentProps } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Icon, type IconName } from '../icon'

const badgeVariants = cva(
  'inline-flex shrink-0 items-center gap-1 rounded-xs text-caption whitespace-nowrap',
  {
    variants: {
      variant: {
        neutral: 'bg-secondary text-secondary-foreground',
        primary: 'bg-primary text-primary-foreground',
        outline: 'border border-border text-foreground',
        success: 'bg-success-soft text-success',
        warning: 'bg-warning-soft text-warning',
        destructive: 'bg-destructive-soft text-destructive',
        info: 'bg-info-soft text-info',
      },
      size: {
        md: 'h-5.5 px-2',
        sm: 'h-4.5 px-1.5',
      },
    },
    defaultVariants: { variant: 'neutral', size: 'md' },
  },
)

export interface BadgeProps
  extends Omit<ComponentProps<'span'>, 'children'>, VariantProps<typeof badgeVariants> {
  children: React.ReactNode
  /** 6px dot in the text color before the label. */
  dot?: boolean
  /** 12px icon before the label. */
  icon?: IconName | LucideIcon
  /** Shows a remove (×) button; called when it's clicked. */
  onRemove?: () => void
  /** Accessible name for the remove button. Default "Remove". */
  removeLabel?: string
}

/** Compact label for counts, tags and states (Figma 08 · Badge). Caption text, radius 4. */
export function Badge({
  variant,
  size,
  dot,
  icon,
  onRemove,
  removeLabel = 'Remove',
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), onRemove && 'pr-1', className)}
      {...props}
    >
      {dot && <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-current" />}
      {icon &&
        (typeof icon === 'string' ? (
          <Icon name={icon} size={12} />
        ) : (
          <Icon icon={icon} size={12} />
        ))}
      {children}
      {onRemove && (
        <button
          type="button"
          aria-label={removeLabel}
          onClick={onRemove}
          className="inline-flex size-3.5 items-center justify-center rounded-xs opacity-70 outline-none hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Icon name="x" size={12} />
        </button>
      )}
    </span>
  )
}
