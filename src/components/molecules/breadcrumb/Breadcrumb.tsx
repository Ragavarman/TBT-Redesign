import { Fragment, type ComponentProps, type MouseEventHandler, type ReactNode } from 'react'
import {
  Breadcrumb as UiBreadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown-menu'

export interface BreadcrumbEntry {
  label: ReactNode
  href?: string
  onClick?: MouseEventHandler<HTMLAnchorElement>
}

export interface BreadcrumbProps extends Omit<ComponentProps<typeof UiBreadcrumb>, 'children'> {
  /** Path from root to the current page. The last entry is the current page. */
  items: BreadcrumbEntry[]
  /**
   * Collapse the middle into “…” (a menu of the hidden levels) when there are more items
   * than this (Figma levels=collapsed). Default 4.
   */
  maxItems?: number
}

/**
 * Location trail (Figma 07 · Breadcrumbs). For router links, compose the exported parts
 * with `<BreadcrumbLink asChild><Link …/></BreadcrumbLink>`.
 */
export function Breadcrumb({ items, maxItems = 4, ...props }: BreadcrumbProps) {
  const collapse = items.length > maxItems
  const first = items[0]
  const hidden = collapse ? items.slice(1, items.length - (maxItems - 2)) : []
  const tail = collapse ? items.slice(items.length - (maxItems - 2)) : items.slice(1)

  const crumb = (item: BreadcrumbEntry, current: boolean) =>
    current ? (
      <BreadcrumbPage>{item.label}</BreadcrumbPage>
    ) : (
      <BreadcrumbLink href={item.href} onClick={item.onClick}>
        {item.label}
      </BreadcrumbLink>
    )

  if (!first) return null
  return (
    <UiBreadcrumb {...props}>
      <BreadcrumbList>
        <BreadcrumbItem>{crumb(first, items.length === 1)}</BreadcrumbItem>
        {collapse && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label={`Show ${hidden.length} more`}
                  className="flex cursor-pointer items-center rounded-xs outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <BreadcrumbEllipsis />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {hidden.map((h, i) => (
                    <DropdownMenuItem key={i} asChild>
                      <a href={h.href} onClick={h.onClick}>
                        {h.label}
                      </a>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
          </>
        )}
        {tail.map((item, i) => (
          <Fragment key={i}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>{crumb(item, i === tail.length - 1)}</BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </UiBreadcrumb>
  )
}

export {
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
}
