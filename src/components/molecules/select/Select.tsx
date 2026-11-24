import type { ComponentProps, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Select as UiSelect,
  SelectContent,
  SelectGroup,
  SelectItem as UiSelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Icon, type IconName } from '@/components/atoms'

export interface SelectOption {
  value: string
  label: ReactNode
  icon?: IconName | LucideIcon
  disabled?: boolean
}

export interface SelectProps extends Omit<ComponentProps<typeof UiSelect>, 'children'> {
  /** Shown until a value is picked. Default "Select…". */
  placeholder?: string
  /** md 32 (default) · sm 28. */
  size?: 'md' | 'sm'
  /** Icon at the start of the trigger. */
  leadingIcon?: IconName | LucideIcon
  /** Options as data. For groups / separators pass `children` (SelectItem, SelectGroup …) instead. */
  options?: SelectOption[]
  children?: ReactNode
  /** Error state — destructive border (sets aria-invalid). */
  invalid?: boolean
  /** Forwarded to the trigger (for FormField / labels). */
  id?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  className?: string
}

const renderIcon = (icon?: IconName | LucideIcon) =>
  icon === undefined ? null : typeof icon === 'string' ? (
    <Icon name={icon} size={14} />
  ) : (
    <Icon icon={icon} size={14} />
  )

/** One option. Accepts an `icon` before the label. */
export function SelectItem({
  icon,
  children,
  ...props
}: ComponentProps<typeof UiSelectItem> & { icon?: IconName | LucideIcon }) {
  return (
    <UiSelectItem {...props}>
      {renderIcon(icon)}
      {children}
    </UiSelectItem>
  )
}

/**
 * Single-choice picker (Figma 06 · Select). Same shell and states as Input;
 * opens a Menu content popover.
 *
 * ```tsx
 * <Select placeholder="Status" options={[{ value: 'open', label: 'Open' }]} />
 * ```
 */
export function Select({
  placeholder = 'Select…',
  size = 'md',
  leadingIcon,
  options,
  children,
  invalid,
  id,
  className,
  disabled,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  ...props
}: SelectProps) {
  return (
    <UiSelect disabled={disabled} {...props}>
      <SelectTrigger
        id={id}
        size={size === 'md' ? 'default' : 'sm'}
        aria-invalid={invalid || undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
        className={className ?? 'w-full'}
      >
        {leadingIcon && <span className="text-foreground">{renderIcon(leadingIcon)}</span>}
        <span className="min-w-0 flex-1 truncate">
          <SelectValue placeholder={placeholder} />
        </span>
      </SelectTrigger>
      <SelectContent>
        {options
          ? options.map((o) => (
              <SelectItem key={o.value} value={o.value} icon={o.icon} disabled={o.disabled}>
                {o.label}
              </SelectItem>
            ))
          : children}
      </SelectContent>
    </UiSelect>
  )
}

export { SelectGroup, SelectLabel, SelectSeparator }
