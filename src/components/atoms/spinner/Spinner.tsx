import type { SVGProps } from 'react'
import { cn } from '@/lib/utils'

const SIZES = { sm: 14, md: 16, lg: 20 } as const

export interface SpinnerProps extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
  /** sm 14 · md 16 · lg 20 (Figma 05 · Spinner). Default md. */
  size?: keyof typeof SIZES
  /** Accessible label. Pass `null` when the spinner is decorative (e.g. inside a busy button). */
  label?: string | null
}

/** Loading indicator: a faint track with a spinning arc, in `currentColor`. */
export function Spinner({ size = 'md', label = 'Loading', className, ...props }: SpinnerProps) {
  const px = SIZES[size]
  return (
    <svg
      viewBox="0 0 16 16"
      width={px}
      height={px}
      fill="none"
      role={label ? 'status' : undefined}
      aria-label={label ?? undefined}
      aria-hidden={label ? undefined : true}
      data-slot="spinner"
      className={cn('shrink-0 animate-spin', className)}
      {...props}
    >
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2" opacity="0.25" />
      <path d="M8 1a7 7 0 0 1 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
