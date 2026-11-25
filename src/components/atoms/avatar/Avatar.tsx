import type { ComponentProps } from 'react'
import { Avatar as UiAvatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { Icon } from '../icon'
import { PresenceDot, type Presence } from '../presence-dot'
import { initialsOf } from './initials'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

/**
 * Size scale. --avatar drives the box (1:1) and the initials (40 % of the box).
 * Inside a chip / button, override with `[--avatar:var(--e-slot)]` to make it 1lh.
 */
const SIZE = {
  xs: { box: '[--avatar:20px]', icon: 12 },
  sm: { box: '[--avatar:24px]', icon: 12 },
  md: { box: '[--avatar:32px]', icon: 16 },
  lg: { box: '[--avatar:40px]', icon: 20 },
  xl: { box: '[--avatar:48px]', icon: 24 },
  '2xl': { box: '[--avatar:64px]', icon: 24 },
} as const

export interface AvatarProps extends Omit<ComponentProps<typeof UiAvatar>, 'size' | 'children'> {
  /** Person's name — used for initials and as the accessible label. */
  name?: string
  /** Photo URL. Falls back to initials (or the user icon) while loading or on error. */
  src?: string
  /** Override the derived initials. */
  initials?: string
  /** xs 20 · sm 24 · md 32 (default) · lg 40 · xl 48 · 2xl 64. */
  size?: AvatarSize
  /** Availability dot at the bottom-right. */
  presence?: Presence
}

/**
 * Person avatar (Figma 08 · Avatar): photo, initials or user icon, optional presence dot.
 * Always 1:1 and round; initials are 40 % of the size, centred on the cap height
 * (Inter's cap height is centred in its line box, and `text-box` trims to it where supported).
 */
export function Avatar({
  name,
  src,
  initials,
  size = 'md',
  presence,
  className,
  ...props
}: AvatarProps) {
  const s = SIZE[size]
  const text = initials ?? (name ? initialsOf(name) : '')
  return (
    <UiAvatar
      role="img"
      aria-label={name}
      className={cn(s.box, 'size-(--avatar)', presence && 'overflow-visible', className)}
      {...props}
    >
      {src && <AvatarImage src={src} alt="" />}
      <AvatarFallback
        className="text-[length:round(calc(var(--avatar)*0.4),1px)] leading-none font-medium [text-box:trim-both_cap_alphabetic]"
        aria-hidden
      >
        {text || <Icon name="user" size={s.icon} className="text-muted-foreground" />}
      </AvatarFallback>
      {presence && (
        <PresenceDot
          state={presence}
          label={null}
          className="absolute right-0 bottom-0 z-10 translate-x-[15%] translate-y-[15%]"
        />
      )}
    </UiAvatar>
  )
}
