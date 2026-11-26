import { useId, type ComponentProps, type ReactNode } from 'react'
import { RadioGroup as UiRadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import { ChoiceLayout } from '../_internal/ChoiceLayout'

export type RadioGroupProps = ComponentProps<typeof UiRadioGroup>

/** Container for Radio options — manages the single selection and arrow-key navigation. */
export function RadioGroup(props: RadioGroupProps) {
  return <UiRadioGroup {...props} />
}

export interface RadioProps extends Omit<ComponentProps<typeof RadioGroupItem>, 'children'> {
  /** Visible label (Body). Omit for a bare radio — then pass `aria-label`. */
  label?: ReactNode
  /** Secondary line under the label (Small, muted). */
  description?: ReactNode
  /** Error state — destructive border. */
  invalid?: boolean
}

/** One option of a RadioGroup — for one-of-many choices (Figma 06 · Radio). */
export function Radio({
  label,
  description,
  invalid,
  id,
  disabled,
  className,
  ...props
}: RadioProps) {
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
        <RadioGroupItem
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
