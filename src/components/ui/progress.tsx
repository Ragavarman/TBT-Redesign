import * as React from 'react'
import { cn } from '@/lib/utils'
import { Progress as ProgressPrimitive } from 'radix-ui'

/** shadcn Progress restyled to TBT (Figma 08 · Progress): `secondary` track, rounded indicator. */
function Progress({
  className,
  indicatorClassName,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & { indicatorClassName?: string }) {
  const pct = Math.min(100, Math.max(0, value ?? 0))
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value}
      className={cn(
        'relative flex h-2 w-full items-center overflow-hidden rounded-full bg-secondary',
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          'size-full flex-1 rounded-full bg-primary transition-transform duration-300 motion-reduce:transition-none',
          indicatorClassName,
        )}
        style={{ transform: `translateX(-${100 - pct}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
