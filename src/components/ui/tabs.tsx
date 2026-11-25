import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Tabs as TabsPrimitive } from 'radix-ui'

/**
 * shadcn Tabs restyled to TBT (Figma 07 · Tabs).
 * pill — view switchers in toolbars (28px, accent fill when active)
 * underline — page-level sections (36px, 2px foreground underline when active)
 */
function Tabs({
  className,
  orientation = 'horizontal',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn('group/tabs flex gap-3 data-[orientation=horizontal]:flex-col', className)}
      {...props}
    />
  )
}

const tabsListVariants = cva('group/tabs-list inline-flex w-fit items-center', {
  variants: {
    variant: {
      pill: 'gap-1',
      underline: 'gap-4 border-b border-border',
    },
  },
  defaultVariants: { variant: 'pill' },
})

function TabsList({
  className,
  variant = 'pill',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center whitespace-nowrap text-muted-foreground outline-none',
        // optical padding: Label 13/18 + --py per variant (pill 28px, underline 36px)
        'optical-edges optical text-label [--icon:14px] [--lh:1.3846]',
        'transition-[color,background-color,box-shadow] duration-150',
        'hover:text-foreground data-[state=active]:text-foreground',
        'focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-(--icon)",
        // pill
        'group-data-[variant=pill]/tabs-list:rounded-sm group-data-[variant=pill]/tabs-list:[--py:calc(5em/13)]',
        'group-data-[variant=pill]/tabs-list:data-[state=active]:bg-accent',
        // underline — the 2px bar sits on the list's bottom border
        // text aligns with the page edge, so only a hairline of side padding (for the focus ring);
        // the 2px indicator is taken out of the bottom padding, so height stays 1lh + 2 × --py
        'group-data-[variant=underline]/tabs-list:-mb-px group-data-[variant=underline]/tabs-list:[--px:0.15em] group-data-[variant=underline]/tabs-list:[--py:calc(9em/13)]',
        'group-data-[variant=underline]/tabs-list:pb-[calc(var(--py)-2px)]!',
        'group-data-[variant=underline]/tabs-list:border-b-2 group-data-[variant=underline]/tabs-list:border-transparent',
        'group-data-[variant=underline]/tabs-list:data-[state=active]:border-foreground',
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('flex-1 text-body outline-none', className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
