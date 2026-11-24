import type { ComponentProps } from 'react'
import { Avatar, type AvatarSize } from '@/components/atoms'
import { cn } from '@/lib/utils'

export interface AvatarGroupPerson {
  name: string
  src?: string
}

export interface AvatarGroupProps extends ComponentProps<'div'> {
  people: AvatarGroupPerson[]
  /** Avatars shown before the “+N” chip. Default 3. */
  max?: number
  /** Default sm (24px). */
  size?: AvatarSize
}

const CHIP = {
  xs: 'size-5 text-[10px]',
  sm: 'size-6 text-[10px]',
  md: 'size-8 text-caption',
  lg: 'size-10 text-label',
} as const

/**
 * Overlapping avatars with an overflow count (Figma 08 · Avatar group):
 * −6px overlap; a 2px card ring (plus the avatar border) separates them cleanly.
 */
export function AvatarGroup({
  people,
  max = 3,
  size = 'sm',
  className,
  ...props
}: AvatarGroupProps) {
  const shown = people.slice(0, max)
  const rest = people.length - shown.length
  const names = people.map((p) => p.name).join(', ')
  return (
    <div
      role="group"
      aria-label={names}
      data-slot="avatar-group"
      className={cn('flex items-center -space-x-1.5', className)}
      {...props}
    >
      {shown.map((p) => (
        <Avatar
          key={p.name}
          name={p.name}
          src={p.src}
          size={size}
          aria-hidden
          className={cn(
            'ring-2 ring-card',
            (size === 'xs' || size === 'sm') && '[&_[data-slot=avatar-fallback]]:text-[10px]',
          )}
        />
      ))}
      {rest > 0 && (
        <span
          aria-hidden
          className={cn(
            'relative flex shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground ring-2 ring-card',
            CHIP[size],
          )}
        >
          +{rest}
        </span>
      )}
    </div>
  )
}
