import type { ComponentProps } from 'react'
import { Skeleton as UiSkeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export interface SkeletonProps extends ComponentProps<typeof UiSkeleton> {
  /** line: 12px text line (radius 4) · circle: avatar placeholder · block: any box (size it with className). */
  shape?: 'line' | 'circle' | 'block'
}

/**
 * Loading placeholder (Figma 09 · Skeleton). Compose lines, circles and blocks into
 * row / card / table-row placeholders that match the real layout.
 */
export function Skeleton({ shape = 'line', className, ...props }: SkeletonProps) {
  return (
    <UiSkeleton
      aria-hidden
      data-shape={shape}
      className={cn(
        shape === 'line' && 'h-3 w-full',
        shape === 'circle' && 'size-8 rounded-full',
        className,
      )}
      {...props}
    />
  )
}
