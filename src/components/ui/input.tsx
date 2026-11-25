import * as React from 'react'
import { FIELD } from '@/lib/optical'
import { cn } from '@/lib/utils'

/**
 * Shared field shell (Figma 06 · "Inputs share one shape"): card fill, input border, radius 6.
 * hover → ring border · focus → 2px ring · aria-invalid → destructive border · disabled → muted 50%.
 * Used by ui/input, ui/textarea and the Input / Textarea atoms.
 */
export const fieldBase = cn(
  'w-full min-w-0 rounded-sm border border-input bg-card text-body text-foreground',
  'transition-[border-color,box-shadow,background-color] duration-150 outline-none',
  'placeholder:text-muted-foreground',
  'hover:border-ring',
)

/** fieldBase + states read from the native element (:focus-visible, aria-invalid, :disabled, :read-only). */
export const fieldShell = cn(
  fieldBase,
  'focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring',
  'aria-invalid:border-destructive aria-invalid:hover:border-destructive',
  'aria-invalid:focus-visible:border-destructive aria-invalid:focus-visible:ring-destructive',
  'disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-50 disabled:hover:border-input',
  'read-only:not-disabled:border-transparent read-only:not-disabled:bg-muted',
)

/** shadcn Input restyled to TBT. Product code should use the `Input` atom (icons, shortcut, clear). */
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        fieldShell,
        'optical [--bw:1px]',
        FIELD.md,
        'file:inline-flex file:h-(--slot) file:border-0 file:bg-transparent file:text-label file:text-foreground',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
