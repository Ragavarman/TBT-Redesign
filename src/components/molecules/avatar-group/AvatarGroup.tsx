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

/** Overflow chip uses the avatar scale: same box, count at 40 % of it. */
const CHIP = {
  xs: '[--avatar:20px]',
  sm: '[--avatar:24px]',
  md: '[--avatar:32px]',
  lg: '[--avatar:40px]',
  xl: '[--avatar:48px]',
  '2xl': '[--avatar:64px]',
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
          className="ring-2 ring-card"
        />
      ))}
      {rest > 0 && (
        <span
          aria-hidden
          className={cn(
            'relative flex size-(--avatar) shrink-0 items-center justify-center rounded-full bg-muted text-[length:round(calc(var(--avatar)*0.4),1px)] leading-none font-medium text-muted-foreground ring-2 ring-card',
            CHIP[size],
          )}
        >
          +{rest}
        </span>
      )}
    </div>
  )
}
