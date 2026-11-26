import type { ComponentProps } from 'react'
import { Separator as UiSeparator } from '@/components/ui/separator'

export type SeparatorProps = ComponentProps<typeof UiSeparator>

/** 1px divider in `border` (Figma 07 · Menu separator). Decorative by default; set `decorative={false}` for a semantic separator. */
export function Separator(props: SeparatorProps) {
  return <UiSeparator {...props} />
}
