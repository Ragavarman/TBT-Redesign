import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface ComposerBarProps extends ComponentProps<'div'> {
  /** Ghost md buttons with shortcuts: Reply (R), Note (N), Canned reply (/), More. */
  children: ReactNode
  /**
   * floating — centred over the bottom of the conversation with an overlay shadow (default) ·
   * inline — in the flow, e.g. in docs.
   */
  position?: 'floating' | 'inline'
}

/**
 * Ticket reply launcher (Figma Interface · Action bar): a card-filled toolbar with 4px padding
 * and a 2px gap, floating 20px above the bottom of the conversation panel.
 */
export function ComposerBar({
  position = 'floating',
  className,
  children,
  ...props
}: ComposerBarProps) {
  const bar = (
    <div
      role="toolbar"
      aria-label="Reply"
      data-slot="composer-bar"
      className={cn(
        'inline-flex items-center gap-0.5 rounded-xl border bg-card p-1 shadow-overlay',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
  return position === 'floating' ? (
    <div className="pointer-events-none flex justify-center pb-5 *:pointer-events-auto">{bar}</div>
  ) : (
    bar
  )
}
