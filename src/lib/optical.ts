/**
 * Size tokens for optical padding (see `optical` in globals.css).
 * Each size sets ONLY a type style (font-size + line-height), --py (em) and --lh (unitless,
 * for the no-`lh`/`cap` fallback). Height = 1lh + 2 × --py, so --py is chosen to land on the
 * Figma 28 / 32 / 36 grid and components of the same size line up in a row.
 *
 *   control  (Button, IconButton, Tabs pill)      Label 13/18 · Body strong 14/20 at lg
 *   field    (Input, Select, menu rows)           Small 13/18 at sm · Body 14/20 at md
 *   caption  (Badge, Kbd, menu labels)            Caption 12/16
 */
export const CONTROL = {
  /** 24px */ xs: 'text-caption [--lh:1.3333] [--py:calc(4em/12)]',
  /** 28px */ sm: 'text-label [--lh:1.3846] [--py:calc(5em/13)]',
  /** 32px */ md: 'text-label [--lh:1.3846] [--py:calc(7em/13)]',
  /** 36px */ lg: 'text-body-strong [--lh:1.4286] [--py:calc(8em/14)]',
} as const

export const FIELD = {
  /** 28px */ sm: 'text-small [--lh:1.3846] [--py:calc(5em/13)]',
  /** 32px */ md: 'text-body [--lh:1.4286] [--py:calc(6em/14)]',
} as const

export const CAPTION = {
  /** 18px — Kbd */ xs: 'text-caption [--lh:1.3333] [--py:calc(1em/12)]',
  /** 20px — Badge sm */ sm: 'text-caption [--lh:1.3333] [--py:calc(2em/12)]',
  /** 22px — Badge md */ md: 'text-caption [--lh:1.3333] [--py:0.25em]',
  /** 28px — menu label */ lg: 'text-caption [--lh:1.3333] [--py:0.5em]',
} as const

/** Icon sizes kept from Figma (14 / 16 / 16), centred in the 1lh slot. */
export const ICON = {
  12: '[--icon:12px]',
  14: '[--icon:14px]',
  16: '[--icon:16px]',
} as const
