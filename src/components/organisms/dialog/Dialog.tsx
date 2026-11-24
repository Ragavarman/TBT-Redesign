import type { ComponentProps, ReactElement, ReactNode } from 'react'
import {
  Dialog as UiDialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { IconButton } from '@/components/atoms'
import { cn } from '@/lib/utils'

const WIDTH = { sm: 'max-w-100', md: 'max-w-130', lg: 'max-w-180' } as const

export interface DialogProps extends Omit<ComponentProps<typeof UiDialog>, 'children'> {
  /** Element that opens the dialog. Omit when controlling `open` yourself. */
  trigger?: ReactElement
  /** Heading 2. Also the accessible name. */
  title: ReactNode
  /** Small muted line under the title (accessible description). */
  description?: ReactNode
  /** sm 400 · md 520 (default) · lg 720. */
  size?: keyof typeof WIDTH
  /** Footer actions on a muted strip, right-aligned — Cancel (outline, wrap in <DialogClose asChild>) + primary. */
  footer?: ReactNode
  /** Hide the × in the header (e.g. when an action must be chosen). */
  hideClose?: boolean
  /** Body. Scrolls when taller than the viewport; header and footer stay put. */
  children: ReactNode
  className?: string
}

/**
 * Modal dialog (Figma 09 · Dialog): header (title, description, close) · scrolling body ·
 * muted footer. Focus is trapped inside; Esc and the scrim close it.
 */
export function Dialog({
  trigger,
  title,
  description,
  size = 'md',
  footer,
  hideClose,
  children,
  className,
  ...props
}: DialogProps) {
  return (
    <UiDialog {...props}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className={cn(WIDTH[size], className)}
        {...(!description && { 'aria-describedby': undefined })}
      >
        <header className="flex items-start gap-3 px-5 pt-5 pb-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </div>
          {!hideClose && (
            <DialogClose asChild>
              <IconButton icon="x" label="Close" size="sm" className="-mt-1 -mr-1.5" />
            </DialogClose>
          )}
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">{children}</div>
        {footer && (
          <footer className="flex shrink-0 items-center justify-end gap-2 border-t bg-muted px-5 py-3">
            {footer}
          </footer>
        )}
      </DialogContent>
    </UiDialog>
  )
}

export { DialogClose }
