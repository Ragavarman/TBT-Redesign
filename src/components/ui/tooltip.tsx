import * as React from 'react'
import { cn } from '@/lib/utils'
import { Tooltip as TooltipPrimitive } from 'radix-ui'
import { floatingMotion } from './menu-styles'

/**
 * shadcn Tooltip restyled to TBT (Figma 09 · Tooltip):
 * `foreground` fill, `background` Caption text, radius 6, 4/8 padding, 9×4 arrow.
 */
function TooltipProvider({
  delayDuration = 300,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  sideOffset = 4,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          'z-50 inline-flex w-fit max-w-xs origin-(--radix-tooltip-content-transform-origin) items-center',
          // optical padding: Caption + --py → 24px. The Radix arrow is the last child, so the
          // Kbd is pulled to the edge explicitly rather than via :last-child.
          'optical-edges rounded-sm bg-foreground optical text-caption text-background [--lh:1.3333] [--py:calc(4em/12)]',
          '[&>[data-slot=kbd]]:me-[calc(var(--e-py)-var(--e-px))]',
          floatingMotion,
          'data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95',
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow width={9} height={4} className="fill-foreground" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
