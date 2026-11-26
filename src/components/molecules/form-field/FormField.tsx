import { useId, type ReactElement, type ReactNode } from 'react'
import { Slot } from 'radix-ui'
import { HelperText, Label } from '@/components/atoms'
import { cn } from '@/lib/utils'

export interface FormFieldProps {
  /** Field label (Form label). */
  label: ReactNode
  /** The control — a TBT Input, Textarea or Select. It receives id, aria-describedby, invalid, disabled and required. */
  children: ReactElement
  /** Hint under the control. Replaced by `error` when present. */
  helper?: ReactNode
  /** Validation message. Turns the control and message destructive. */
  error?: ReactNode
  required?: boolean
  optional?: boolean
  disabled?: boolean
  /** Override the generated control id. */
  id?: string
  className?: string
}

/**
 * Form label + control + helper text, wired for accessibility (Figma 06 · Field).
 *
 * ```tsx
 * <FormField label="Email" required error={errors.email}>
 *   <Input type="email" />
 * </FormField>
 * ```
 */
export function FormField({
  label,
  children,
  helper,
  error,
  required,
  optional,
  disabled,
  id,
  className,
}: FormFieldProps) {
  const autoId = useId()
  const controlId = id ?? autoId
  const messageId = `${controlId}-message`
  const message = error ?? helper
  const invalid = error !== undefined && error !== null && error !== false

  return (
    <div
      data-slot="form-field"
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      className={cn('flex flex-col gap-1.5', className)}
    >
      <Label htmlFor={controlId} required={required} optional={optional}>
        {label}
      </Label>
      <Slot.Root
        id={controlId}
        aria-describedby={message ? messageId : undefined}
        {...{ invalid: invalid || undefined, disabled, required }}
      >
        {children}
      </Slot.Root>
      {message && (
        <HelperText
          id={messageId}
          tone={invalid ? 'error' : 'default'}
          role={invalid ? 'alert' : undefined}
        >
          {message}
        </HelperText>
      )}
    </div>
  )
}
