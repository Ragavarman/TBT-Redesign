import type { ComponentProps, ReactElement, ReactNode } from 'react'
import {
  Tooltip as UiTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Kbd } from '@/components/atoms'

export interface TooltipProps extends Omit<ComponentProps<typeof UiTooltip>, 'children'> {
  /** Short hint (Caption). */
  content: ReactNode
  /** Keyboard shortcut shown after the hint, e.g. "I". */
  shortcut?: string
  /** top (default) · bottom · left · right. */
  side?: 'top' | 'bottom' | 'left' | 'right'
  align?: 'start' | 'center' | 'end'
  /** The element that triggers the tooltip — must accept a ref (Button, IconButton, …). */
  children: ReactElement
}

/**
 * Hover / focus hint (Figma 09 · Tooltip). Wrap icon-only buttons so the action is discoverable.
 *
 * ```tsx
 * <Tooltip content="Assign to me" shortcut="I">
 *   <IconButton icon="user" label="Assign to me" />
 * </Tooltip>
 * ```
 */
export function Tooltip({
  content,
  shortcut,
  side = 'top',
  align,
  children,
  ...props
}: TooltipProps) {
  return (
    <TooltipProvider>
      <UiTooltip {...props}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} align={align}>
          <span>{content}</span>
          {shortcut && (
            <Kbd aria-hidden className="opacity-85">
              {shortcut}
            </Kbd>
          )}
        </TooltipContent>
      </UiTooltip>
    </TooltipProvider>
  )
}

/** Optional app-level provider to share the open delay between tooltips. */
export { TooltipProvider }
