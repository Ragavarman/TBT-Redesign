import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const textVariants = cva('', {
  variants: {
    /** Figma text styles (03 · Typography). */
    variant: {
      display: 'text-display',
      'heading-1': 'text-heading-1',
      'heading-2': 'text-heading-2',
      title: 'text-title',
      'body-strong': 'text-body-strong',
      body: 'text-body',
      small: 'text-small',
      label: 'text-label',
      caption: 'text-caption',
      overline: 'text-overline uppercase',
    },
    /** Text color token. `inherit` keeps the parent's color. */
    tone: {
      inherit: '',
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      primary: 'text-primary',
      success: 'text-success',
      warning: 'text-warning',
      info: 'text-info',
      destructive: 'text-destructive',
    },
    truncate: { true: 'truncate', false: '' },
  },
  defaultVariants: { variant: 'body', tone: 'inherit', truncate: false },
})

type TextElement =
  | 'p'
  | 'span'
  | 'div'
  | 'label'
  | 'strong'
  | 'em'
  | 'small'
  | 'li'
  | 'dt'
  | 'dd'
  | 'figcaption'
  | 'legend'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'

type Variant = NonNullable<VariantProps<typeof textVariants>['variant']>

const DEFAULT_ELEMENT: Record<Variant, TextElement> = {
  display: 'h1',
  'heading-1': 'h2',
  'heading-2': 'h3',
  title: 'h4',
  'body-strong': 'p',
  body: 'p',
  small: 'p',
  label: 'span',
  caption: 'span',
  overline: 'span',
}

export interface TextProps extends HTMLAttributes<HTMLElement>, VariantProps<typeof textVariants> {
  /** HTML element. Defaults to a sensible one for the variant (heading styles → h1–h4, body → p, …). */
  as?: TextElement
  /** For `as="label"`. */
  htmlFor?: string
}

/** Text in a TBT type style. `<Text variant="caption" tone="muted">…</Text>` */
export function Text({ as, variant, tone, truncate, className, ...props }: TextProps) {
  const Element = as ?? DEFAULT_ELEMENT[variant ?? 'body']
  return <Element className={cn(textVariants({ variant, tone, truncate }), className)} {...props} />
}

export interface HeadingProps extends Omit<TextProps, 'as'> {
  /** Document outline level (h1–h6). Pick the style separately with `variant`. Default 2. */
  level?: 1 | 2 | 3 | 4 | 5 | 6
}

/** Semantic heading: `level` sets the element, `variant` the look (default heading-2). */
export function Heading({
  level = 2,
  variant = 'heading-2',
  tone = 'default',
  ...props
}: HeadingProps) {
  return <Text as={`h${level}`} variant={variant} tone={tone} {...props} />
}
