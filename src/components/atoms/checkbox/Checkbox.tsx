import { useId, type ComponentProps, type ReactNode } from 'react'
import { Checkbox as UiCheckbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { ChoiceLayout } from '../_internal/ChoiceLayout'

export interface CheckboxProps extends Omit<ComponentProps<typeof UiCheckbox>, 'children'> {
  /** Visible label (Body). Omit for a bare checkbox — then pass `aria-label`. */
  label?: ReactNode
  /** Secondary line under the label (Small, muted). */
  description?: ReactNode
  /** Error state — destructive border. */
  invalid?: boolean
}

/**
 * Checkbox for multi-select and table rows (Figma 06 · Checkbox).
 * `checked` accepts `true | false | 'indeterminate'`.
 */
export function Checkbox({
  label,
  description,
  invalid,
  id,
  disabled,
  className,
  ...props
}: CheckboxProps) {
  const autoId = useId()
  const controlId = id ?? autoId
  const descriptionId = `${controlId}-description`
  return (
    <ChoiceLayout
      id={controlId}
      descriptionId={descriptionId}
      label={label}
      description={description}
      disabled={disabled}
      className={className}
      control={
        <UiCheckbox
          id={controlId}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={description ? descriptionId : undefined}
          className={cn(
            label &&
              !disabled &&
              'group-hover/choice:not-aria-invalid:not-data-[state=checked]:border-ring',
            !label && !description && className,
          )}
          {...props}
        />
      }
    />
  )
}
