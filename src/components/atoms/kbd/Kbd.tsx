import type { ComponentProps } from 'react'
import { CAPTION } from '@/lib/optical'
import { cn } from '@/lib/utils'

export interface KbdProps extends ComponentProps<'kbd'> {
  /**
   * `default` on neutral surfaces. `inverse` on solid fills (primary / destructive buttons):
   * takes the surrounding text color.
   */
  tone?: 'default' | 'inverse'
}

/**
 * Keyboard shortcut key (Figma 05 · Kbd): Caption text, radius 4, 18px tall.
 * Optical padding; min-width = height so a single key is square and longer ones grow.
 * `data-edge` + --edge let a parent (Button, Input) pull it to the edge like an icon.
 */
export function Kbd({ tone = 'default', className, ...props }: KbdProps) {
  return (
    <kbd
      data-slot="kbd"
      data-edge
      className={cn(
        'optical [--bw:1px]',
        CAPTION.xs,
        'min-w-[calc(var(--slot)+2*var(--py))] [--edge:calc(var(--slot)+2*var(--py))]',
        'inline-flex shrink-0 items-center justify-center rounded-xs border font-sans select-none',
        tone === 'default' && 'border-input bg-card text-muted-foreground',
        tone === 'inverse' && 'border-current/40 bg-transparent text-current opacity-90',
        className,
      )}
      {...props}
    />
  )
}
