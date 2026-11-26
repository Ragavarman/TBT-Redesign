import * as React from 'react'
import { cn } from '@/lib/utils'
import { fieldShell } from './input'

/** shadcn Textarea restyled to TBT (Figma 06 · Textarea): grows with content, min height 80. */
function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        fieldShell,
        // optical padding (8px top, ≈13px side); min height = 3 lines
        'flex field-sizing-content resize-y optical [--bw:1px]',
        'text-body [--lh:1.4286] [--py:calc(8em/14)]',
        'min-h-[calc(3*var(--slot)+2*var(--py))]',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
