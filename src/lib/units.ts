/**
 * Figma px → rem, so a size given in design pixels scales with the root font size
 * (the UI scale in globals.css, and the user's browser text-size setting).
 */
export const rem = (px: number) => `${px / 16}rem`
