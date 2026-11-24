import type { ComponentProps } from 'react'
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
        'inline-flex h-5.5 shrink-0 items-center gap-1 rounded-full pr-2 pl-1.5 text-caption whitespace-nowrap',
        TONE[condition],
        className,
      )}
      {...props}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {ASSET_CONDITION_LABEL[condition]}
    </span>
  )
}
