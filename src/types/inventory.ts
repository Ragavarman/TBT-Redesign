/** Inventory domain types (Figma 10 · Condition badge). */

export const ASSET_CONDITIONS = ['good', 'needs-repair', 'retired'] as const
export type AssetCondition = (typeof ASSET_CONDITIONS)[number]

export const ASSET_CONDITION_LABEL: Record<AssetCondition, string> = {
  good: 'Good',
  'needs-repair': 'Needs repair',
  retired: 'Retired',
}
