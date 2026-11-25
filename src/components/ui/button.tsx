import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Slot } from 'radix-ui'
import { CONTROL, ICON } from '@/lib/optical'

/**
 * shadcn Button, restyled to TBT (Figma 05 · Buttons).
 * Keeps shadcn's variant/size names so other shadcn components can use it.
 * Product code should use the `Button` / `IconButton` atoms instead.
 *
 * Figma: radius 6 · heights 28/32/36 · Label text (Body strong at lg) · icons 14/16/16
 * hover/pressed shift opacity (solid) or fill (outline/ghost) · focus = 2px ring · disabled 50%.
 *
 * Sizing is optical (see `optical` in globals.css): each size sets only type + --py; height and
 * horizontal padding are derived. No fixed heights or px padding.
 */
const buttonVariants = cva(
  [
    'group/button inline-flex shrink-0 items-center justify-center rounded-sm border border-transparent [--bw:1px]',
    'whitespace-nowrap outline-none select-none',
    'transition-[background-color,border-color,opacity,box-shadow] duration-150',
    'focus-visible:ring-2 focus-visible:ring-ring',
    'disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
    'aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-(--icon)",
  ],
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:opacity-90 active:opacity-80',
        secondary: 'bg-secondary text-secondary-foreground hover:opacity-85 active:opacity-75',
        outline:
          'border-border bg-card text-foreground hover:bg-accent active:bg-muted aria-expanded:bg-accent',
        ghost: 'text-foreground hover:bg-accent active:bg-muted aria-expanded:bg-accent',
        destructive:
          'bg-destructive text-destructive-foreground hover:opacity-90 focus-visible:ring-destructive/40 active:opacity-80',
        link: 'text-primary underline-offset-4 hover:underline active:opacity-80',
      },
      size: {
        xs: cn(CONTROL.xs, ICON[12], 'optical-edges optical'),
        sm: cn(CONTROL.sm, ICON[14], 'optical-edges optical'),
        default: cn(CONTROL.md, ICON[16], 'optical-edges optical'),
        lg: cn(CONTROL.lg, ICON[16], 'optical-edges optical'),
        'icon-xs': cn(CONTROL.xs, ICON[12], 'optical-square'),
        'icon-sm': cn(CONTROL.sm, ICON[14], 'optical-square'),
        icon: cn(CONTROL.md, ICON[16], 'optical-square'),
        'icon-lg': cn(CONTROL.lg, ICON[16], 'optical-square'),
      },
    },
    // links sit inline with text: no horizontal padding
    compoundVariants: [{ variant: 'link', className: '[--px:0px]' }],
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : 'button'

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
