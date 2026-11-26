import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Shared layout for Checkbox / Radio / Switch with an optional label + description
 * (Figma 06: control · 8px gap · Body label · Small muted description, 2px apart).
 * Internal to the atoms layer — not exported from the barrel.
 */
export function ChoiceLayout({
  control,
  id,
  descriptionId,
  label,
  description,
  disabled,
  className,
}: {
  control: ReactNode
  id: string
  descriptionId: string
  label?: ReactNode
  description?: ReactNode
  disabled?: boolean
  className?: string
}) {
  if (!label && !description) return <>{control}</>
  return (
    <div
      data-slot="choice"
      data-disabled={disabled || undefined}
      className={cn(
        // hovering the label highlights the control like hovering the control itself
        'group/choice flex items-start gap-2 [&>[data-slot]:first-child]:mt-0.5',
        'data-disabled:opacity-50 [&>[data-slot]:first-child]:data-disabled:opacity-100',
        className,
      )}
    >
      {control}
      <div className="flex min-w-0 flex-col gap-0.5">
        {label && (
          <label
            htmlFor={id}
            className={cn(
              'text-body text-foreground select-none',
              disabled ? 'cursor-not-allowed' : 'cursor-pointer',
            )}
          >
            {label}
          </label>
        )}
        {description && (
          <p id={descriptionId} className="text-small text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
