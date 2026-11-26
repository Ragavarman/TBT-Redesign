import * as React from 'react'
import { cn } from '@/lib/utils'
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn('grid w-full gap-3', className)}
      {...props}
    />
  )
}

/** shadcn RadioGroupItem restyled to TBT (Figma 06 · Radio): 16px ring, 8px primary dot when checked. */
function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        'peer relative flex aspect-square size-4 shrink-0 items-center justify-center rounded-full border border-input bg-card',
        'transition-[border-color,box-shadow] duration-150 outline-none',
        'after:absolute after:-inset-1.5',
        'hover:border-ring',
        'focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring',
        'data-[state=checked]:border-primary',
        'aria-invalid:border-destructive aria-invalid:hover:border-destructive',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-input',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator data-slot="radio-group-indicator" className="flex">
        <span className="size-2 rounded-full bg-primary" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
