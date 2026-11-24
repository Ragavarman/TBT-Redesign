import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { Icon } from '../icon'

export type HelperTextTone = 'default' | 'error' | 'success'

const TONE = {
  default: { className: 'text-muted-foreground', icon: 'info' },
  error: { className: 'text-destructive', icon: 'warning' },
  success: { className: 'text-success', icon: 'check' },
} as const

export interface HelperTextProps extends ComponentProps<'p'> {
  /** default (hint) · error (validation message) · success. */
  tone?: HelperTextTone
  /** Leading icon in the tone color. Defaults to on for `error`. */
  icon?: boolean
}

/** Hint or validation message under a control (Figma 06 · Helper text): Small, 6px icon gap. */
export function HelperText({
  tone = 'default',
  icon,
  className,
  children,
  ...props
}: HelperTextProps) {
  const t = TONE[tone]
  const showIcon = icon ?? tone === 'error'
  return (
    <p
      data-slot="helper-text"
      data-tone={tone}
      className={cn('flex items-start gap-1.5 text-small', t.className, className)}
      {...props}
    >
      {showIcon && <Icon name={t.icon} size={14} className="mt-0.5" />}
      <span>{children}</span>
    </p>
  )
}
