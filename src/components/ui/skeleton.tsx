import * as React from 'react'
import { cn } from '@/lib/utils'

/** shadcn Skeleton restyled to TBT (Figma 09 · Skeleton): `muted` fill, radius 4. */
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('animate-pulse rounded-xs bg-muted motion-reduce:animate-none', className)}
      {...props}
    />
  )
}

export { Skeleton }
