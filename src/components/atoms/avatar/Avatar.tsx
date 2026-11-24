import type { ComponentProps } from 'react'
import { Avatar as UiAvatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { Icon } from '../icon'
import { PresenceDot, type Presence } from '../presence-dot'
import { initialsOf } from './initials'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg'

const SIZE = {
  xs: { box: 'size-5', text: 'text-[10px] leading-none font-medium', icon: 12 },
  sm: { box: 'size-6', text: 'text-caption', icon: 12 },
  md: { box: 'size-8', text: 'text-label', icon: 16 },
  lg: { box: 'size-10', text: 'text-body-strong', icon: 20 },
} as const

export interface AvatarProps extends Omit<ComponentProps<typeof UiAvatar>, 'size' | 'children'> {
  /** Person's name — used for initials and as the accessible label. */
  name?: string
  /** Photo URL. Falls back to initials (or the user icon) while loading or on error. */
  src?: string
  /** Override the derived initials. */
  initials?: string
  /** xs 20 · sm 24 · md 32 (default) · lg 40. */
  size?: AvatarSize
  /** Availability dot at the bottom-right. */
  presence?: Presence
}

/** Person avatar (Figma 08 · Avatar): photo, initials or user icon, optional presence dot. */
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
      className={cn(s.box, presence && 'overflow-visible', className)}
      {...props}
    >
      {src && <AvatarImage src={src} alt="" />}
      <AvatarFallback className={s.text} aria-hidden>
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
