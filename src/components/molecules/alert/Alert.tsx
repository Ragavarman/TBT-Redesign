import type { ComponentProps, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Icon, IconButton, type IconName } from '@/components/atoms'
import { cn } from '@/lib/utils'

const alertVariants = cva(
  'flex w-full items-start gap-3 rounded-md border p-3 text-foreground [&>[data-slot=icon]]:mt-0.5',
  {
    variants: {
      variant: {
        neutral: 'border-border bg-card [&>[data-slot=icon]]:text-foreground',
        info: 'border-info bg-info-soft [&>[data-slot=icon]]:text-info',
        success: 'border-success bg-success-soft [&>[data-slot=icon]]:text-success',
        warning: 'border-warning bg-warning-soft [&>[data-slot=icon]]:text-warning',
        destructive: 'border-destructive bg-destructive-soft [&>[data-slot=icon]]:text-destructive',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
)

const TITLE_TONE = {
  neutral: 'text-foreground',
  info: 'text-info',
  success: 'text-success',
  warning: 'text-warning',
  destructive: 'text-destructive',
} as const

const DEFAULT_ICON: Record<keyof typeof TITLE_TONE, IconName> = {
  neutral: 'info',
  info: 'info',
  success: 'check',
  warning: 'warning',
  destructive: 'warning',
}

export interface AlertProps
  extends Omit<ComponentProps<'div'>, 'title'>, VariantProps<typeof alertVariants> {
  title: ReactNode
  description?: ReactNode
  /** Override the variant's icon, or `null` to hide it. */
  icon?: IconName | LucideIcon | null
  /** Inline action at the end — usually `<Button variant="outline" size="sm">`. */
  action?: ReactNode
  /** Shows a dismiss (×) button. */
  onDismiss?: () => void
}

/**
 * Inline message in the page flow (Figma 09 · Alert): soft tint + coloured border per variant,
 * Body strong title, Small description, optional action and dismiss.
 */
export function Alert({
  variant,
  title,
  description,
  icon,
  action,
  onDismiss,
  className,
  ...props
}: AlertProps) {
  const v = variant ?? 'neutral'
  const glyph = icon === undefined ? DEFAULT_ICON[v] : icon
  return (
    <div
      data-slot="alert"
      data-variant={v}
      role={v === 'destructive' || v === 'warning' ? 'alert' : 'status'}
      className={cn(alertVariants({ variant: v }), className)}
      {...props}
    >
      {glyph &&
        (typeof glyph === 'string' ? (
          <Icon name={glyph} size={16} />
        ) : (
          <Icon icon={glyph} size={16} />
        ))}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className={cn('text-body-strong', TITLE_TONE[v])}>{title}</p>
        {description && <div className="text-small text-foreground">{description}</div>}
      </div>
      {action && <div className="shrink-0 self-center">{action}</div>}
      {onDismiss && (
        <IconButton
          icon="x"
          label="Dismiss"
          size="sm"
          onClick={onDismiss}
          className="-my-1 -mr-1.5 shrink-0 text-current/70"
        />
      )}
    </div>
  )
}
