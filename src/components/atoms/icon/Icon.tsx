import type { LucideIcon, LucideProps } from 'lucide-react'
import { rem } from '@/lib/units'
import { cn } from '@/lib/utils'
import { ICONS, type IconName, type IconSize } from './icons'

type IconSource =
  | { /** A TBT icon name (Figma `icon/*`). */ name: IconName; icon?: never }
  | { name?: never; /** Any Lucide icon component. */ icon: LucideIcon }

export type IconProps = IconSource &
  Omit<LucideProps, 'size' | 'ref' | 'name'> & {
    /** Pixel size. Default 16. */
    size?: IconSize
    /** Accessible label. Omit for decorative icons (they are hidden from screen readers). */
    label?: string
  }

/**
 * Lucide icon at a TBT size with the Figma 1.5px round stroke.
 * Color follows `currentColor` — tint with a text token (`text-muted-foreground`).
 */
export function Icon({ name, icon, size = 16, label, className, style, ...props }: IconProps) {
  const Component = icon ?? ICONS[name as IconName]
  return (
    <Component
      size={size}
      // size is in Figma px; render it in rem so icons grow with the UI scale / browser text size
      style={{ width: rem(size), height: rem(size), ...style }}
      strokeWidth={1.5}
      absoluteStrokeWidth
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      data-slot="icon"
      className={cn('shrink-0', className)}
      {...props}
    />
  )
}
