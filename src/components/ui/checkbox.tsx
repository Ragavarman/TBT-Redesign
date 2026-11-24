import * as React from 'react'
import { cn } from '@/lib/utils'
import { Checkbox as CheckboxPrimitive } from 'radix-ui'
import { CheckIcon, MinusIcon } from 'lucide-react'

/**
 * shadcn Checkbox restyled to TBT (Figma 06 · Checkbox): 16px, radius 4.
 * Radix exposes state via data-state="checked | unchecked | indeterminate".
 */
function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer relative flex size-4 shrink-0 items-center justify-center rounded-xs border border-input bg-card text-primary-foreground',
        'transition-[border-color,background-color,box-shadow] duration-150 outline-none',
        // enlarge the hit area without changing layout
        'after:absolute after:-inset-1.5',
        'hover:border-ring',
        'focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring',
        'data-[state=checked]:border-primary data-[state=checked]:bg-primary',
        'data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary',
        'aria-invalid:border-destructive aria-invalid:hover:border-destructive',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-input',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="group/indicator grid place-content-center text-current"
      >
        <CheckIcon
          className="size-3 group-data-[state=indeterminate]/indicator:hidden"
          strokeWidth={1.5}
          absoluteStrokeWidth
        />
        <MinusIcon
          className="hidden size-3 group-data-[state=indeterminate]/indicator:block"
          strokeWidth={1.5}
          absoluteStrokeWidth
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
