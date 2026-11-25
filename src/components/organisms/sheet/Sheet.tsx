import type { ComponentProps, ReactElement, ReactNode } from 'react'
import { IconButton } from '@/components/atoms'
import {
  Sheet as UiSheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

export interface SheetProps extends Omit<ComponentProps<typeof UiSheet>, 'children'> {
  trigger?: ReactElement
  /** Heading 2 — also the accessible name. */
  title: ReactNode
  description?: ReactNode
  /** Footer actions, right-aligned: Cancel (secondary, wrap in <SheetClose asChild>) + primary. */
  footer?: ReactNode
  children: ReactNode
}

/**
 * Side panel for a focused task next to the page (Figma Interface · T5 Add invoice): header with
 * close, scrolling body, footer. Focus is trapped; Esc and the scrim close it.
 */
export function Sheet({ trigger, title, description, footer, children, ...props }: SheetProps) {
  return (
    <UiSheet {...props}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent {...(!description && { 'aria-describedby': undefined })}>
        <header className="flex items-start gap-3 border-b px-5 pt-4 pb-3">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <SheetTitle>{title}</SheetTitle>
            {description && <SheetDescription>{description}</SheetDescription>}
          </div>
          <SheetClose asChild>
            <IconButton icon="x" label="Close" size="sm" className="-mr-1.5" />
          </SheetClose>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <footer className="flex shrink-0 items-center justify-end gap-2 border-t px-5 py-3">
            {footer}
          </footer>
        )}
      </SheetContent>
    </UiSheet>
  )
}

export { SheetClose }
