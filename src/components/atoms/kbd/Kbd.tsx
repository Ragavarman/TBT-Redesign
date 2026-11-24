import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export interface KbdProps extends ComponentProps<'kbd'> {
  /**
   * `default` on neutral surfaces. `inverse` on solid fills (primary / destructive buttons):
   * takes the surrounding text color.
   */
  tone?: 'default' | 'inverse'
}

/** Keyboard shortcut key (Figma 05 · Kbd): 18px, radius 4, Caption text. */
export function Kbd({ tone = 'default', className, ...props }: KbdProps) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        'inline-flex h-4.5 min-w-4.5 shrink-0 items-center justify-center rounded-xs border px-1 font-sans text-caption select-none',
        tone === 'default' && 'border-input bg-card text-muted-foreground',
        tone === 'inverse' && 'border-current/40 bg-transparent text-current opacity-90',
        className,
      )}
      {...props}
    />
  )
}
