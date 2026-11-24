import * as React from 'react'
import { cn } from '@/lib/utils'
import { fieldShell } from './input'

/** shadcn Textarea restyled to TBT (Figma 06 · Textarea): grows with content, min height 80. */
function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(fieldShell, 'flex field-sizing-content min-h-20 resize-y px-3 py-2', className)}
      {...props}
    />
  )
}

export { Textarea }
