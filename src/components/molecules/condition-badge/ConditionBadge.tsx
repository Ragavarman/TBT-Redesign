import type { ComponentProps } from 'react'
import { CAPTION } from '@/lib/optical'
import { cn } from '@/lib/utils'
import { ASSET_CONDITION_LABEL, type AssetCondition } from '@/types'

const TONE: Record<AssetCondition, string> = {
  good: 'bg-success-soft text-success',
  'needs-repair': 'bg-warning-soft text-warning',
  retired: 'bg-muted text-muted-foreground',
}

export interface ConditionBadgeProps extends Omit<ComponentProps<'span'>, 'children'> {
  condition: AssetCondition
}

/** Inventory asset condition (Figma 10 · Condition badge): dot + label in a tinted capsule. */
export function ConditionBadge({ condition, className, ...props }: ConditionBadgeProps) {
  return (
    <span
      data-slot="condition-badge"
      data-condition={condition}
      className={cn(
        // optical padding (Caption + --py → 22px); the dot is pulled to the edge
        'optical-edges inline-flex shrink-0 items-center rounded-full optical whitespace-nowrap',
        CAPTION.md,
        TONE[condition],
        className,
      )}
      {...props}
    >
      <span aria-hidden data-edge className="size-1.5 rounded-full bg-current [--edge:6px]" />
      <span>{ASSET_CONDITION_LABEL[condition]}</span>
    </span>
  )
}
