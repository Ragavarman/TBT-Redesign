import { useRef, useState, type ChangeEvent, type ComponentProps, type Ref } from 'react'
import type { LucideIcon } from 'lucide-react'
import { fieldBase } from '@/components/ui/input'
import { FIELD } from '@/lib/optical'
import { cn } from '@/lib/utils'
import { Icon, type IconName } from '../icon'
import { Kbd } from '../kbd'

export interface InputProps extends Omit<ComponentProps<'input'>, 'size' | 'type'> {
  /** `search` adds the search icon by default and search semantics. Other HTML types pass through. */
  type?: 'text' | 'search' | 'email' | 'password' | 'url' | 'tel' | 'number'
  /** md 32 (Body text, default) · sm 28 (Small text). */
  size?: 'md' | 'sm'
  /** Icon at the start. Defaults to `search` for type="search"; pass `null` to hide it. */
  leadingIcon?: IconName | LucideIcon | null
  /** Keyboard hint shown at the end while the field is empty, e.g. "/". */
  shortcut?: string
  /** Shows a clear (×) button while the field has a value. Called after the field is cleared. */
  onClear?: () => void
  /** Error state — destructive border (sets aria-invalid). */
  invalid?: boolean
  /** Class for the outer field (border, size). `className` goes to the <input> element. */
  wrapperClassName?: string
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value)
  else if (ref) ref.current = value
}

/**
 * Text & search input (Figma 06 · Text & search input).
 * The visible border lives on a wrapper so icons, the Kbd hint and the clear button sit inside it.
 */
export function Input({
  type = 'text',
  size = 'md',
  leadingIcon,
  shortcut,
  onClear,
  invalid,
  disabled,
  readOnly,
  value,
  defaultValue,
  onChange,
  wrapperClassName,
  className,
  ref,
  ...props
}: InputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const controlled = value !== undefined
  const [uncontrolledFilled, setUncontrolledFilled] = useState(
    defaultValue !== undefined && String(defaultValue) !== '',
  )
  const filled = controlled ? String(value ?? '') !== '' : uncontrolledFilled

  const icon = leadingIcon === undefined ? (type === 'search' ? 'search' : undefined) : leadingIcon
  const iconPx = 14
  const showClear = !!onClear && filled && !disabled && !readOnly
  const showShortcut = !!shortcut && !filled

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!controlled) setUncontrolledFilled(e.target.value !== '')
    onChange?.(e)
  }

  const clear = () => {
    const el = inputRef.current
    if (el && !controlled) {
      el.value = ''
      setUncontrolledFilled(false)
    }
    onClear?.()
    el?.focus()
  }

  return (
    <div
      data-slot="input"
      data-size={size}
      data-disabled={disabled || undefined}
      data-invalid={invalid || undefined}
      data-readonly={readOnly || undefined}
      className={cn(
        // same shape as ui/input; states come from the inner <input> via has-[] and data-*
        fieldBase,
        // optical padding: type + --py set the height (32 / 28); icons, Kbd and clear sit at the edge
        'optical-edges flex items-center optical [--bw:1px] [--icon:0.875rem]',
        FIELD[size],
        'has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-1 has-[input:focus-visible]:ring-ring',
        'data-invalid:border-destructive data-invalid:hover:border-destructive',
        'data-invalid:has-[input:focus-visible]:border-destructive data-invalid:has-[input:focus-visible]:ring-destructive',
        'data-disabled:cursor-not-allowed data-disabled:bg-muted data-disabled:opacity-50 data-disabled:hover:border-input',
        'data-readonly:border-transparent data-readonly:bg-muted data-readonly:hover:border-transparent',
        wrapperClassName,
      )}
      onPointerDown={(e) => {
        // clicking the padding / icon focuses the field
        if (e.target === e.currentTarget) {
          e.preventDefault()
          inputRef.current?.focus()
        }
      }}
    >
      {icon &&
        (typeof icon === 'string' ? (
          <Icon name={icon} size={iconPx} className="text-foreground" />
        ) : (
          <Icon icon={icon} size={iconPx} className="text-foreground" />
        ))}
      <input
        ref={(el) => {
          inputRef.current = el
          assignRef(ref, el)
        }}
        type={type}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={invalid || undefined}
        className={cn(
          'h-(--slot) min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed',
          '[&::-webkit-search-cancel-button]:appearance-none',
          className,
        )}
        {...props}
      />
      {showShortcut && <Kbd aria-hidden>{shortcut}</Kbd>}
      {showClear && (
        <button
          type="button"
          aria-label="Clear"
          onClick={clear}
          data-edge
          className="inline-flex size-(--e-slot) shrink-0 items-center justify-center rounded-xs text-muted-foreground outline-none [--edge:var(--e-slot)] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Icon name="x" size={14} />
        </button>
      )}
    </div>
  )
}
