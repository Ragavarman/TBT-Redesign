import type { ComponentProps } from 'react'
import { Textarea as UiTextarea } from '@/components/ui/textarea'

export interface TextareaProps extends ComponentProps<typeof UiTextarea> {
  /** Error state — destructive border (sets aria-invalid). */
  invalid?: boolean
}

/** Multi-line text for ticket replies, internal notes and descriptions (Figma 06 · Textarea). Grows with content; min height 80. */
export function Textarea({ invalid, ...props }: TextareaProps) {
  return <UiTextarea aria-invalid={invalid || undefined} {...props} />
}
