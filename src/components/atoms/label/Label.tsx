import type { ComponentProps } from 'react'
import { Label as UiLabel } from '@/components/ui/label'

export interface LabelProps extends ComponentProps<typeof UiLabel> {
  /** Adds a destructive “*”. Also set `required` on the control itself. */
  required?: boolean
  /** Adds a muted “(optional)”. */
  optional?: boolean
}

/** Form label (Figma 06 · Form label): Label 13 Medium, optional/required marker. */
export function Label({ required, optional, children, ...props }: LabelProps) {
  return (
    <UiLabel {...props}>
      {children}
      {required && (
        <span aria-hidden className="text-destructive">
          *
        </span>
      )}
      {optional && !required && (
        <span className="text-small font-normal text-muted-foreground">(optional)</span>
      )}
    </UiLabel>
  )
}
