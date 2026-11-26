import type { ComponentProps, ReactNode } from 'react'
import { Spinner } from '@/components/atoms'
import { cn } from '@/lib/utils'

export interface LoadingStateProps extends ComponentProps<'div'> {
  /** inline — spinner + label in a row (default) · block — centred, larger spinner, for panels. */
  type?: 'inline' | 'block'
  /** What is loading, e.g. "Loading tickets…". */
  label?: ReactNode
}

/**
 * Spinner with a label (Figma 09 · Loading state). Prefer Skeletons when the layout is known;
 * use this for short waits or unknown layouts.
 */
export function LoadingState({
  type = 'inline',
  label = 'Loading…',
  className,
  ...props
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      data-slot="loading-state"
      data-type={type}
      className={cn(
        'flex items-center text-small text-muted-foreground',
        type === 'inline' ? 'gap-2' : 'min-h-40 flex-col justify-center gap-2',
        className,
      )}
      {...props}
    >
      <Spinner size={type === 'inline' ? 'sm' : 'lg'} label={null} />
      <span>{label}</span>
    </div>
  )
}
