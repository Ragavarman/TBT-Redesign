import type { ComponentProps, ReactElement, ReactNode } from 'react'
import {
  Popover as UiPopover,
  PopoverAnchor,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { IconButton } from '@/components/atoms'
import { cn } from '@/lib/utils'

export interface PopoverProps extends Omit<ComponentProps<typeof UiPopover>, 'children'> {
  /** The element that opens the popover (Button, IconButton …). */
  trigger: ReactElement
  /** Header title (Title style). Omit for a bare panel. */
  title?: ReactNode
  /** Show the × close button in the header. Default true when there is a title. */
  showClose?: boolean
  /** Footer row on a muted strip — typically Reset (ghost) + Apply (primary), size sm. */
  footer?: ReactNode
  children: ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  align?: 'start' | 'center' | 'end'
  /** Panel width etc. Default width 300 (Figma). */
  className?: string
}

/**
 * Floating panel anchored to a trigger (Figma 09 · Popover): optional header with close,
 * body, and a muted footer for actions.
 */
export function Popover({
  trigger,
  title,
  showClose,
  footer,
  children,
  side = 'bottom',
  align = 'start',
  className,
  ...props
}: PopoverProps) {
  const close = showClose ?? title !== undefined
  return (
    <UiPopover {...props}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        className={className}
        // Focus the panel itself on open (not the first button), so the close × doesn't
        // light up with a focus ring; Tab still moves into the fields and actions.
        tabIndex={-1}
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          ;(e.currentTarget as HTMLElement | null)?.focus()
        }}
      >
        {(title !== undefined || close) && (
          <div className="flex items-center gap-2 px-3 pt-3 pb-2">
            <div className="min-w-0 flex-1 text-title text-popover-foreground">{title}</div>
            {close && (
              <PopoverClose asChild>
                <IconButton icon="x" label="Close" size="sm" className="-my-1 -mr-1.5" />
              </PopoverClose>
            )}
          </div>
        )}
        <div className={cn('px-3 pb-3', title === undefined && !close && 'pt-3')}>{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t bg-muted px-3 py-2">
            {footer}
          </div>
        )}
      </PopoverContent>
    </UiPopover>
  )
}

/** Escape hatches for custom compositions. */
export { PopoverAnchor, PopoverClose }
