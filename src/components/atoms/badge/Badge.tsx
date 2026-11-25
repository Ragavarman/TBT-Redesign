import type { ComponentProps } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { CAPTION } from '@/lib/optical'
import { cn } from '@/lib/utils'
import { Avatar } from '../avatar'
import { Icon, type IconName } from '../icon'

/*
 * Optical padding: Caption 12/16 + --py → md 22px, sm 20px. The border is always present
 * (transparent unless outline) and sits inside the padding, so variants share one height.
 */
const badgeVariants = cva(
  [
    'optical-edges inline-flex shrink-0 items-center optical whitespace-nowrap',
    'rounded-xs border border-transparent [--bw:1px] [--icon:12px]',
  ],
  {
    variants: {
      variant: {
        neutral: 'bg-secondary text-secondary-foreground',
        primary: 'bg-primary text-primary-foreground',
        outline: 'border-border text-foreground',
        success: 'bg-success-soft text-success',
        warning: 'bg-warning-soft text-warning',
        destructive: 'bg-destructive-soft text-destructive',
        info: 'bg-info-soft text-info',
      },
      size: {
        md: CAPTION.md,
        sm: CAPTION.sm,
      },
      /** Counter: min-width = height (one digit is a circle, "99+" grows into a pill). */
      count: {
        true: 'min-w-[calc(var(--slot)+2*var(--py))] justify-center rounded-full tabular-nums',
        false: '',
      },
    },
    defaultVariants: { variant: 'neutral', size: 'md', count: false },
  },
)

export interface BadgeProps
  extends Omit<ComponentProps<'span'>, 'children'>, VariantProps<typeof badgeVariants> {
  children: React.ReactNode
  /** 6px dot in the text color before the label. */
  dot?: boolean
  /** 12px icon before the label. */
  icon?: IconName | LucideIcon
  /** Person chip: a 1lh avatar before the label. */
  avatar?: { name: string; src?: string }
  /** Shows a remove (×) button; called when it's clicked. */
  onRemove?: () => void
  /** Accessible name for the remove button. Default "Remove". */
  removeLabel?: string
}

/**
 * Compact label for counts, tags and states (Figma 08 · Badge). Caption text, radius 4.
 * `count` makes a circular counter; `onRemove` makes a removable tag; `avatar` a person chip.
 */
export function Badge({
  variant,
  size,
  count,
  dot,
  icon,
  avatar,
  onRemove,
  removeLabel = 'Remove',
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, size, count }), className)}
      {...props}
    >
      {dot && (
        <span
          aria-hidden
          data-edge
          className="size-1.5 shrink-0 rounded-full bg-current [--edge:6px]"
        />
      )}
      {icon &&
        (typeof icon === 'string' ? (
          <Icon name={icon} size={12} />
        ) : (
          <Icon icon={icon} size={12} />
        ))}
      {avatar && (
        <Avatar
          name={avatar.name}
          src={avatar.src}
          size="xs"
          data-edge
          aria-hidden
          // 1lh, like an icon, so the space around it equals --py
          className="[--avatar:var(--e-slot)] [--edge:var(--e-slot)]"
        />
      )}
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          aria-label={removeLabel}
          onClick={onRemove}
          data-edge
          className={cn(
            'inline-flex size-(--e-slot) shrink-0 items-center justify-center opacity-70 outline-none [--edge:var(--e-slot)]',
            // nested radius: inner = outer − padding
            'rounded-[max(0px,calc(var(--radius-xs)-var(--e-py)))]',
            'hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring',
          )}
        >
          <Icon name="x" size={12} />
        </button>
      )}
    </span>
  )
}
