import * as React from 'react'
import { cn } from '@/lib/utils'
import { Switch as SwitchPrimitive } from 'radix-ui'

/**
 * shadcn Switch restyled to TBT (Figma 06 · Switch).
 * md: track 32×18, thumb 14 · sm: track 26×14, thumb 10 · 2px inset · hover 90% · focus 2px ring.
 */
function Switch({
  className,
  size = 'default',
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: 'sm' | 'default'
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        'peer group/switch relative inline-flex shrink-0 items-center rounded-full px-0.5',
        'transition-[background-color,opacity,box-shadow] duration-150 outline-none',
        'after:absolute after:-inset-1.5',
        'data-[size=default]:h-4.5 data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6.5',
        'bg-input data-[state=checked]:bg-primary',
        'hover:opacity-90',
        'focus-visible:ring-2 focus-visible:ring-ring',
        'aria-invalid:ring-2 aria-invalid:ring-destructive',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'pointer-events-none block rounded-full bg-background transition-transform duration-150',
          'group-data-[size=default]/switch:size-3.5 group-data-[size=sm]/switch:size-2.5',
          'data-[state=unchecked]:translate-x-0',
          'group-data-[size=default]/switch:data-[state=checked]:translate-x-3.5',
          'group-data-[size=sm]/switch:data-[state=checked]:translate-x-3',
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
