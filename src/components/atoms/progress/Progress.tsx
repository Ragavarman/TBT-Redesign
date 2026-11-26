import type { ComponentProps } from 'react'
import { Progress as UiProgress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

export type ProgressTone = 'primary' | 'success' | 'warning' | 'destructive' | 'info'

const TONE: Record<ProgressTone, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
  info: 'bg-info',
}

export interface ProgressProps extends Omit<
  ComponentProps<typeof UiProgress>,
  'indicatorClassName'
> {
  /** 0–100. */
  value: number
  /** Indicator color. Default primary. */
  tone?: ProgressTone
  /** sm 4px · md 8px (default). */
  size?: 'sm' | 'md'
}

/** Linear progress / meter bar (Figma 08 · Progress). Give it an aria-label or aria-labelledby. */
export function Progress({ tone = 'primary', size = 'md', className, ...props }: ProgressProps) {
  return (
    <UiProgress
      data-tone={tone}
      className={cn(size === 'sm' ? 'h-1' : 'h-2', className)}
      indicatorClassName={TONE[tone]}
      {...props}
    />
  )
}
