import * as React from 'react'
import { cn } from '@/lib/utils'
import { Select as SelectPrimitive } from 'radix-ui'
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from 'lucide-react'
import { FIELD } from '@/lib/optical'
import { fieldBase } from './input'
import { menuContent, menuItem, menuLabel, menuSeparator } from './menu-styles'

/**
 * shadcn Select restyled to TBT (Figma 06 · Select).
 * Trigger uses the shared field shell; the list is a Menu content panel.
 */
function Select({ ...props }: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" className={className} {...props} />
}

function SelectValue({ ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  size = 'default',
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: 'sm' | 'default'
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        fieldBase,
        // optical padding: same height as Input / Button of the same size; chevron at the edge
        'group/select optical-edges flex items-center justify-between optical text-left whitespace-nowrap [--bw:1px] [--icon:0.875rem]',
        size === 'sm' ? FIELD.sm : FIELD.md,
        'focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring',
        'data-[state=open]:border-ring data-[state=open]:ring-1 data-[state=open]:ring-ring',
        'aria-invalid:border-destructive aria-invalid:hover:border-destructive',
        'disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-50 disabled:hover:border-input',
        'data-placeholder:text-muted-foreground',
        '*:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2',
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-(--icon)",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon
          className="text-muted-foreground transition-transform duration-150 group-data-[state=open]/select:rotate-180"
          strokeWidth={1.5}
          absoluteStrokeWidth
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = 'popper',
  align = 'start',
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          menuContent,
          'relative max-h-(--radix-select-content-available-height) origin-(--radix-select-content-transform-origin)',
          position === 'popper' && 'min-w-(--radix-select-trigger-width)',
          className,
        )}
        position={position}
        align={align}
        sideOffset={sideOffset}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn(menuLabel, className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      // room for the check indicator: --px + icon + gap
      className={cn(menuItem, 'pe-[calc(var(--px)+var(--icon)+var(--py))]!', className)}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <span className="absolute end-(--px) flex size-(--icon) items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="text-foreground" strokeWidth={1.5} absoluteStrokeWidth />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn(menuSeparator, className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        'flex h-6 cursor-default items-center justify-center text-muted-foreground',
        className,
      )}
      {...props}
    >
      <ChevronUpIcon className="size-3.5" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        'flex h-6 cursor-default items-center justify-center text-muted-foreground',
        className,
      )}
      {...props}
    >
      <ChevronDownIcon className="size-3.5" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
