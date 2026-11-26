import * as React from 'react'
import { cn } from '@/lib/utils'
import { Dialog as SheetPrimitive } from 'radix-ui'
import { overlayClass } from './dialog'

/**
 * Side panel (Figma Interface · T5 Add invoice): a modal dialog docked to the right edge,
 * 8px from the viewport like the app panels. Layout is composed by the Sheet organism.
 */

const Sheet = SheetPrimitive.Root
const SheetTrigger = SheetPrimitive.Trigger
const SheetClose = SheetPrimitive.Close
const SheetTitle = ({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) => (
  <SheetPrimitive.Title className={cn('text-heading-2 text-foreground', className)} {...props} />
)
const SheetDescription = ({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) => (
  <SheetPrimitive.Description
    className={cn('text-small text-muted-foreground', className)}
    {...props}
  />
)

function SheetContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content>) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay className={overlayClass} />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          'fixed inset-y-2 right-2 z-50 flex w-[calc(100%-1rem)] max-w-120 flex-col overflow-hidden',
          'rounded-xl border bg-background text-foreground shadow-modal outline-none',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-right-8',
          'duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-right-8',
          'motion-reduce:animate-none',
          className,
        )}
        {...props}
      >
        {children}
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  )
}

export { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger }
