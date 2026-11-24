import { useId, type ComponentProps, type ReactNode } from 'react'
import { Switch as UiSwitch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { ChoiceLayout } from '../_internal/ChoiceLayout'

export interface SwitchProps extends Omit<ComponentProps<typeof UiSwitch>, 'children' | 'size'> {
  /** md (32×18, default) · sm (26×14). */
  size?: 'md' | 'sm'
  /** Visible label (Body). Omit for a bare switch — then pass `aria-label`. */
  label?: ReactNode
  /** Secondary line under the label (Small, muted). */
  description?: ReactNode
}

/** Switch for settings that apply immediately (Figma 06 · Switch). */
export function Switch({
  size = 'md',
  label,
  description,
  id,
  disabled,
  className,
  ...props
}: SwitchProps) {
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
      // center the track on the 20px label line: md 18px → 1px, sm 14px → 3px
      className={cn(
        size === 'md' ? '[&>[data-slot]:first-child]:mt-px' : '[&>[data-slot]:first-child]:mt-0.75',
        className,
      )}
      control={
        <UiSwitch
          id={controlId}
          size={size === 'md' ? 'default' : 'sm'}
          disabled={disabled}
          aria-describedby={description ? descriptionId : undefined}
          className={cn(
            label && !disabled && 'group-hover/choice:opacity-90',
            !label && !description && className,
          )}
          {...props}
        />
      }
    />
  )
}
