import { createCn } from 'cn/config'
import { SHADOWS, TEXT_STYLES } from './theme/tokens.generated'

/**
 * Class-name merge (clsx + tailwind-merge) that knows the TBT tokens, so e.g.
 * `cn('text-label', 'text-primary')` keeps both (size vs. color) and
 * `cn('text-body', 'text-label')` keeps only the last type style.
 */
export const cn = createCn({
  extend: {
    // h-control-sm / size-control-md … (see @theme in globals.css)
    theme: { spacing: ['control-sm', 'control-md', 'control-lg'] },
    classGroups: {
      'font-size': [{ text: TEXT_STYLES.map((t) => t.key) }],
      shadow: [{ shadow: SHADOWS.map((s) => s.key) }],
    },
  },
})
